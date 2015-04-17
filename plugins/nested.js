var _       = require('lodash');
var Promise = require('bluebird');

module.exports = function (Bookshelf) {

  var proto = Bookshelf.Model.prototype;

  var Model = Bookshelf.Model.extend({

    get: function (attr) {
      if (_acceptsNestedAttributesFor(this, attr)) {
        return this.related(attr);
      }
      return proto.get.apply(this, arguments);
    },

    set: function (key, value, options) {
      if (!key) {
        return this;
      }
      var attrs, value;
      if (_.isObject(key)) {
        attrs = key;
        options = value;
      } else {
        (attrs = {})[key] = value;
      }
      for (var attr in attrs) {
        if (_acceptsNestedAttributesFor(this, attr)) {
          _setRelation(this, attr, attrs[attr]);
          delete attrs[attr];
        }
      }
      return proto.set.call(this, attrs, options);
    },

    save: function (key, value, options) {
      var _model = this
        , attrs;
      if (!key || _.isObject(key)) {
        attrs = key || {};
        options = value || {};
      } else {
        (attrs = {})[key] = value;
      }

      _model.set(attrs, {silent: true});

      return _fetchNestedAttributes(_model)
        .then(_saveBelongsToNestedAttributes)
        .then(function (model) {
          return proto.save.call(model, null, options);
        })
        .then(function (model) {
          _model = model;
          return _model;
        })
        .then(_refreshRelationData)
        .then(_saveHasManyNestedAttributes)
        .then(_saveHasOneNestedAttributes)
        .then(_saveBelongsToManyNestedAttributes)
        .then(_clearNestedAttributes)
        .catch(function(error) {
          if (!_model.isNew()) {
            return _model.destroy().then(function() {
              throw error;
            });
          }
          throw error;
        });
    }

  });

  function _fetchNestedAttributes (model) {
    var nestedAttributes = model.nestedAttributes
      , fetches = []
      , value;
    for (var relation in nestedAttributes) {
      fetches.push(model.related(relation).fetch());
    }
    return Promise.all(fetches)
      .return(model);
  }

  function _acceptsNestedAttributesFor (model, relation) {
    return _.contains(model.acceptsNestedAttributesFor, relation);
  }

  function _nestedAttributesFor (model, relation) {
    var nestedAttributes = model.nestedAttributes || {}
    return nestedAttributes[relation];
  }

  function _setNestedAttributesFor (model, relation, value) {
    model.nestedAttributes = model.nestedAttributes || {}
    model.nestedAttributes[relation] = value;
    return value;
  }

  function _relationType (model, relation) {
    return model.related(relation).relatedData.type;
  }

  function _mapRelationsToPromise (model, type, fn) {
    var nestedAttributes = _.pick(model.nestedAttributes, function (relation, key) {
      return _relationType(model, key) == type;
    }), promises = [];

    for (var rel in nestedAttributes) {
      promises.push(fn(model.related(rel), nestedAttributes[rel]));
    }

    return Promise.all(promises)
      .return(model);
  }

  function _relationIsOne (model, relation) {
    var types = ['hasOne', 'belongsTo'];
    return _.contains(types, _relationType(model, relation));
  }

  function _relationIsMany (model, relation) {
    var types = ['hasMany', 'belongsToMany'];
    return _.contains(types, _relationType(model, relation));
  }

  function _setRelation (model, relation, value) {
    if (_relationIsOne(model, relation)) {
      return _setOne(model, relation, value);
    }
    return _setMany(model, relation, value);
  }

  function _setOne (model, relation, value) {
    if (_.isObject(value)) {
      return _setNestedAttributesFor(model, relation, value);
    }
  }

  function _setMany (model, relation, value) {
    var nestedAttributes = _nestedAttributesFor(model, relation);
    if (!(_.isArray(nestedAttributes))) {
      nestedAttributes = [];
    }
    if (_.isArray(value)) {
      var val;
      for (var key in value) {
        val = value[key];
        if (_.isObject(val)) {
          nestedAttributes.push(val);
        }
      }
    } else if (_.isObject(value)) {
      nestedAttributes.push(value);
    }
    return _setNestedAttributesFor(model, relation, nestedAttributes);
  }

  function _saveBelongsToNestedAttributes (model) {
    return _saveOneNestedAttributes(model, 'belongsTo');
  }

  function _saveHasOneNestedAttributes (model) {
    return _saveOneNestedAttributes(model, 'hasOne');
  }

  function _saveHasManyNestedAttributes (model) {
    return _saveManyNestedAttributes(model, 'hasMany');
  }

  function _saveBelongsToManyNestedAttributes (model) {
    return _saveManyNestedAttributes(model, 'belongsToMany');
  }

  function _saveOneNestedAttributes (model, type) {
    var foreignKey;

    return _mapRelationsToPromise(model, type, function (relation, attributes){
      foreignKey = relation.relatedData.key('foreignKey');
      if (relation.id && attributes._destroy) {
        return relation.destroy().then(function(target) {
          if (type == 'belongsTo') {
            model.set(foreignKey, null);
            return target;
          }
        });
      }
      return relation.save(attributes).then(function (target) {
        if (type == 'belongsTo') {
          model.set(foreignKey, target.id);
          return target;
        }
      });
    });
  }

  function _saveManyNestedAttributes (model, type)  {
    var idKey
      , attrs
      , matchingModel;

    return _mapRelationsToPromise(model, type, function (relation, attributes){
      idKey = relation.relatedData.key('parentIdAttribute');
      return Promise.map(attributes, function (attrs) {
        if (attrs[idKey]) {
          matchingModel = _.findWhere(relation.models, function (mo) {
            return mo.id == attrs[idKey];
          });
          if (!matchingModel) {
            return;
          }
          if (attrs._destroy && type == 'hasMany') {
            return matchingModel.destroy().then(function(mod){
              relation.remove(mod);
            });
          }
          if (attrs._detach && type == 'belongsToMany') {
            return relation.detach([matchingModel.id]);
          }
          return matchingModel.save(attrs);
        }
        return relation.create(attrs);
      });
    });
  }

  function _refreshRelationData (model) {
    var relation;
    for (key in model.relations) {
      relation = model.relations[key];
      if (relation && relation.relatedData) {
        relation.relatedData.init(model);
      }
    }
    return model;
  }

  function _clearNestedAttributes (model) {
    model.nestedAttributes = null;
    return model;
  }

  Bookshelf.Model = Model;

}
