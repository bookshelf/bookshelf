// Relation
// ---------------
var _          = require('lodash');
var inherits   = require('inherits');
var inflection = require('inflection');

var Helpers      = require('./helpers');
var ModelBase    = require('./base/model');
var RelationBase = require('./base/relation');
var Promise      = require('./base/promise');

var push         = [].push;

function BookshelfRelation() {
  RelationBase.apply(this, arguments);
}
inherits(BookshelfRelation, RelationBase);

_.extend(BookshelfRelation.prototype, {

  // Assembles the new model or collection we're creating an instance of,
  // gathering any relevant primitives from the parent object,
  // without keeping any hard references.
  init: function(parent) {
    this.parentId          = parent.id;
    this.parentTableName   = _.result(parent, 'tableName');
    this.parentIdAttribute = _.result(parent, 'idAttribute');

    if (this.isInverse()) {
      // use formatted attributes so that morphKey and foreignKey will match
      // attribute keys
      var attributes = parent.format(_.clone(parent.attributes));

      // If the parent object is eager loading, and it's a polymorphic `morphTo` relation,
      // we can't know what the target will be until the models are sorted and matched.
      if (this.type === 'morphTo' && !parent._isEager) {
        this.target = Helpers.morphCandidate(this.candidates, attributes[this.key('morphKey')]);
        this.targetTableName   = _.result(this.target.prototype, 'tableName');
        this.targetIdAttribute = _.result(this.target.prototype, 'idAttribute');
      }
      this.parentFk = attributes[this.key('foreignKey')];
    } else {
      this.parentFk = parent.id;
    }

    var target = this.target ? this.relatedInstance() : {};
        target.relatedData = this;

    if (this.type === 'belongsToMany') {
      _.extend(target, pivotHelpers);
    }

    return target;
  },

  // Initializes a `through` relation, setting the `Target` model and `options`,
  // which includes any additional keys for the relation.
  through: function(source, Target, options) {
    var type = this.type;
    if (type !== 'hasOne' && type !== 'hasMany' && type !== 'belongsToMany' && type !== 'belongsTo') {
      throw new Error('`through` is only chainable from `hasOne`, `belongsTo`, `hasMany`, or `belongsToMany`');
    }

    this.throughTarget = Target;
    this.throughTableName = _.result(Target.prototype, 'tableName');
    this.throughIdAttribute = _.result(Target.prototype, 'idAttribute');

    // Set the parentFk as appropriate now.
    if (this.type === 'belongsTo') {
      this.parentFk = this.parentId;
    }

    _.extend(this, options);
    _.extend(source, pivotHelpers);

    // Set the appropriate foreign key if we're doing a belongsToMany, for convenience.
    if (this.type === 'belongsToMany') {
      this.foreignKey = this.throughForeignKey;
    }

    return source;
  },

  // Generates and returns a specified key, for convenience... one of
  // `foreignKey`, `otherKey`, `throughForeignKey`.
  key: function(keyName) {
    var idKeyName;
    if (this[keyName]) return this[keyName];
    if (keyName === 'otherKey') {
      return this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
    }
    if (keyName === 'throughForeignKey') {
      return this[keyName] = singularMemo(this.joinTable()) + '_' + this.throughIdAttribute;
    }
    if (keyName === 'foreignKey') {
      if (this.type === 'morphTo') {
        idKeyName = this.columnNames && this.columnNames[1] ? this.columnNames[1] : this.morphName + '_id';
        return this[keyName] = idKeyName;
      }
      if (this.type === 'belongsTo') return this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
      if (this.isMorph()) {
        idKeyName = this.columnNames && this.columnNames[1] ? this.columnNames[1] : this.morphName + '_id';
        return this[keyName] = idKeyName;
      }
      return this[keyName] = singularMemo(this.parentTableName) + '_' + this.parentIdAttribute;
    }
    if (keyName === 'morphKey') {
      var typeKeyName = this.columnNames && this.columnNames[0] ? this.columnNames[0] : this.morphName + '_type';
      return this[keyName] = typeKeyName;
    }
    if (keyName === 'morphValue') return this[keyName] = this.parentTableName || this.targetTableName;
  },

  // Injects the necessary `select` constraints into a `knex` query builder.
  selectConstraints: function(knex, options) {
    var resp = options.parentResponse;

    // The `belongsToMany` and `through` relations have joins & pivot columns.
    if (this.isJoined()) this.joinClauses(knex);

    // Call the function, if one exists, to constrain the eager loaded query.
    if (options._beforeFn) options._beforeFn.call(knex, knex);

    // The base select column
    if (_.isArray(options.columns)) {
      knex.columns(options.columns);
    }

    var currentColumns = _.findWhere(knex._statements, {grouping: 'columns'});

    if (!currentColumns || currentColumns.length === 0) {
      knex.column(this.targetTableName + '.*');
    }

    if (this.isJoined()) this.joinColumns(knex);
    
    // If this is a single relation and we're not eager loading,
    // limit the query to a single item.
    if (this.isSingle() && !resp) knex.limit(1);

    // Finally, add (and validate) the where conditions, necessary for constraining the relation.
    this.whereClauses(knex, resp);
  },

  // Inject & validates necessary `through` constraints for the current model.
  joinColumns: function(knex) {
    var columns = [];
    var joinTable = this.joinTable();
    if (this.isThrough()) columns.push(this.throughIdAttribute);
    columns.push(this.key('foreignKey'));
    if (this.type === 'belongsToMany') columns.push(this.key('otherKey'));
    push.apply(columns, this.pivotColumns);
    knex.columns(_.map(columns, function(col) {
      return joinTable + '.' + col + ' as _pivot_' + col;
    }));
  },

  // Generates the join clauses necessary for the current relation.
  joinClauses: function(knex) {
    var joinTable = this.joinTable();

    if (this.type === 'belongsTo' || this.type === 'belongsToMany') {

      var targetKey = (this.type === 'belongsTo' ? this.key('foreignKey') : this.key('otherKey'));

      knex.join(
        joinTable,
        joinTable + '.' + targetKey, '=',
        this.targetTableName + '.' + this.targetIdAttribute
      );

      // A `belongsTo` -> `through` is currently the only relation with two joins.
      if (this.type === 'belongsTo') {
        knex.join(
          this.parentTableName,
          joinTable + '.' + this.throughIdAttribute, '=',
          this.parentTableName + '.' + this.key('throughForeignKey')
        );
      }

    } else {
      knex.join(
        joinTable,
        joinTable + '.' + this.throughIdAttribute, '=',
        this.targetTableName + '.' + this.key('throughForeignKey')
      );
    }
  },

  // Check that there isn't an incorrect foreign key set, vs. the one
  // passed in when the relation was formed.
  whereClauses: function(knex, resp) {
    var key;

    if (this.isJoined()) {
      var targetTable = this.type === 'belongsTo' ? this.parentTableName : this.joinTable();
      key = targetTable + '.' + (this.type === 'belongsTo' ? this.parentIdAttribute : this.key('foreignKey'));
    } else {
      key = this.targetTableName + '.' +
        (this.isInverse() ? this.targetIdAttribute : this.key('foreignKey'));
    }

    knex[resp ? 'whereIn' : 'where'](key, resp ? this.eagerKeys(resp) : this.parentFk);

    if (this.isMorph()) {
      knex.where(this.targetTableName + '.' + this.key('morphKey'), this.key('morphValue'));
    }
  },

  // Fetches all `eagerKeys` from the current relation.
  eagerKeys: function(resp) {
    var key = this.isInverse() && !this.isThrough() ? this.key('foreignKey') : this.parentIdAttribute;
    return _.uniq(_.pluck(resp, key));
  },

  // Generates the appropriate standard join table.
  joinTable: function() {
    if (this.isThrough()) return this.throughTableName;
    return this.joinTableName || [
      this.parentTableName,
      this.targetTableName
    ].sort().join('_');
  },

  // Creates a new model or collection instance, depending on
  // the `relatedData` settings and the models passed in.
  relatedInstance: function(models) {
    models = models || [];

    var Target = this.target;

    // If it's a single model, check whether there's already a model
    // we can pick from... otherwise create a new instance.
    if (this.isSingle()) {
      if (!(Target.prototype instanceof ModelBase)) {
        throw new Error('The `'+this.type+'` related object must be a Bookshelf.Model');
      }
      return models[0] || new Target();
    }

    // Allows us to just use a model, but create a temporary
    // collection for a "*-many" relation.
    if (Target.prototype instanceof ModelBase) {
      Target = this.Collection.extend({
        model: Target
      });
    }
    return new Target(models, {parse: true});
  },

  // Groups the related response according to the type of relationship
  // we're handling, for easy attachment to the parent models.
  eagerPair: function(relationName, related, parentModels) {
    var model;

    // If this is a morphTo, we only want to pair on the morphValue for the current relation.
    if (this.type === 'morphTo') {
      parentModels = _.filter(parentModels, function(model) {
        return model.get(this.key('morphKey')) === this.key('morphValue');
      }, this);
    }

    // If this is a `through` or `belongsToMany` relation, we need to cleanup & setup the `interim` model.
    if (this.isJoined()) related = this.parsePivot(related);

    // Group all of the related models for easier association with their parent models.
    var grouped = _.groupBy(related, function(model) {
      if (model.pivot) {
        return this.isInverse() && this.isThrough() ? model.pivot.id :
          model.pivot.get(this.key('foreignKey'));
      } else {
        return this.isInverse() ? model.id : model.get(this.key('foreignKey'));
      }
    }, this);

    // Loop over the `parentModels` and attach the grouped sub-models,
    // keeping the `relatedData` on the new related instance.
    for (var i = 0, l = parentModels.length; i < l; i++) {
      model = parentModels[i];
      var groupedKey;
      if (!this.isInverse()) {
        groupedKey = model.id;
      } else {
        var formatted = model.format(_.extend(Object.create(null), model.attributes));
        groupedKey = this.isThrough() ? formatted[this.key('throughForeignKey')] : formatted[this.key('foreignKey')];
      }
      var relation = model.relations[relationName] = this.relatedInstance(grouped[groupedKey]);
      relation.relatedData = this;
      if (this.isJoined()) _.extend(relation, pivotHelpers);
    }

    // Now that related models have been successfully paired, update each with
    // its parsed attributes
    for (i = 0, l = related.length; i < l; i++) {
      model = related[i];
      model.attributes = model.parse(model.attributes);
    }

    return related;
  },

  // The `models` is an array of models returned from the fetch,
  // after they're `set`... parsing out any of the `_pivot_` items from the
  // join table and assigning them on the pivot model or object as appropriate.
  parsePivot: function(models) {
    var Through = this.throughTarget;
    return _.map(models, function(model) {
      var data = {}, keep = {}, attrs = model.attributes, through;
      if (Through) through = new Through();
      for (var key in attrs) {
        if (key.indexOf('_pivot_') === 0) {
          data[key.slice(7)] = attrs[key];
        } else {
          keep[key] = attrs[key];
        }
      }
      model.attributes = keep;
      if (!_.isEmpty(data)) {
        model.pivot = through ? through.set(data, {silent: true}) : new this.Model(data, {
          tableName: this.joinTable()
        });
      }
      return model;
    }, this);
  },

  // A few predicates to help clarify some of the logic above.
  isThrough: function() {
    return (this.throughTarget != null);
  },
  isJoined: function() {
    return (this.type === 'belongsToMany' || this.isThrough());
  },
  isMorph: function() {
    return (this.type === 'morphOne' || this.type === 'morphMany');
  },
  isSingle: function() {
    var type = this.type;
    return (type === 'hasOne' || type === 'belongsTo' || type === 'morphOne' || type === 'morphTo');
  },
  isInverse: function() {
    return (this.type === 'belongsTo' || this.type === 'morphTo');
  },

  // Sets the `pivotColumns` to be retrieved along with the current model.
  withPivot: function(columns) {
    if (!_.isArray(columns)) columns = [columns];
    this.pivotColumns || (this.pivotColumns = []);
    push.apply(this.pivotColumns, columns);
  }

});

// Simple memoization of the singularize call.
var singularMemo = (function() {
  var cache = Object.create(null);
  return function(arg) {
    if (arg in cache) {
      return cache[arg];
    } else {
      return cache[arg] = inflection.singularize(arg);
    }
  };
}());

// Specific to many-to-many relationships, these methods are mixed
// into the `belongsToMany` relationships when they are created,
// providing helpers for attaching and detaching related models.
var pivotHelpers = {

  // Attach one or more "ids" from a foreign
  // table to the current. Creates & saves a new model
  // and attaches the model with a join table entry.
  attach: function(ids, options) {
    return Promise.bind(this).then(function(){
      return this.triggerThen('attaching', this, ids, options);
    }).then(function() {
      return this._handler('insert', ids, options);
    }).then(function(resp) {
      return this.triggerThen('attached', this, resp, options);
    });
  },

  // Detach related object from their pivot tables.
  // If a model or id is passed, it attempts to remove the
  // pivot table based on that foreign key. If a hash is passed,
  // it attempts to remove the item based on a where clause with
  // these parameters. If no parameters are specified, we assume we will
  // detach all related associations.
  detach: function(ids, options) {
    return Promise.bind(this).then(function(){
      return this.triggerThen('detaching', this, ids, options);
    }).then(function() {
      return this._handler('delete', ids, options);
    }).then(function(resp) {
      return this.triggerThen('detached', this, resp, options);
    });
  },

  // Update an existing relation's pivot table entry.
  updatePivot: function(data, options) {
    return this._handler('update', data, options);
  },

  // Selects any additional columns on the pivot table,
  // taking a hash of columns which specifies the pivot
  // column name, and the value the column should take on the
  // output to the model attributes.
  withPivot: function(columns) {
    this.relatedData.withPivot(columns);
    return this;
  },

  // Helper for handling either the `attach` or `detach` call on
  // the `belongsToMany` or `hasOne` / `hasMany` :through relationship.
  _handler: Promise.method(function(method, ids, options) {
    var pending = [];
    if (ids == void 0) {
      if (method === 'insert') return Promise.resolve(this);
      if (method === 'delete') pending.push(this._processPivot(method, null, options));
    }
    if (!_.isArray(ids)) ids = ids ? [ids] : [];
    for (var i = 0, l = ids.length; i < l; i++) {
      pending.push(this._processPivot(method, ids[i], options));
    }
    return Promise.all(pending).yield(this);
  }),

  // Handles setting the appropriate constraints and shelling out
  // to either the `insert` or `delete` call for the current model,
  // returning a promise.
  _processPivot: Promise.method(function(method, item, options) {
    var data = {};
    var relatedData = this.relatedData;

    // Grab the `knex` query builder for the current model, and
    // check if we have any additional constraints for the query.
    var builder = this._builder(relatedData.joinTable());
    if (options && options.query) {
      Helpers.query.call(null, {_knex: builder}, [options.query]);
    }

    data[relatedData.key('foreignKey')] = relatedData.parentFk;

    // If the item is an object, it's either a model
    // that we're looking to attach to this model, or
    // a hash of attributes to set in the relation.
    if (_.isObject(item)) {
      if (item instanceof ModelBase) {
        data[relatedData.key('otherKey')] = item.id;
      } else if (method !== 'update') {
        _.extend(data, item);
      }
    } else if (item) {
      data[relatedData.key('otherKey')] = item;
    }

    if (options) {
      if (options.transacting) builder.transacting(options.transacting);
      if (options.debug) builder.debug();
    }
    var collection = this;
    if (method === 'delete') {
      return builder.where(data).del().then(function() {
        var model;
        if (!item) return collection.reset();
        if (model = collection.get(data[relatedData.key('otherKey')])) {
          collection.remove(model);
        }
      });
    }
    if (method === 'update') {
      return builder.where(data).update(item).then(function (numUpdated) {
        if (options && options.require === true && numUpdated === 0) {
          throw new Error('No rows were updated');
        }
        return numUpdated;
      });
    }

    return builder.insert(data).then(function() {
      collection.add(item);
    });
  })

};

module.exports = BookshelfRelation;
