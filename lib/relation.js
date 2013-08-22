(function(define) { "use strict";

define(function(require, exports, module) {

  var _          = require('./ext/underscore')._;
  var when       = require('./ext/when').when;
  var inflection = require('./ext/inflection').inflection;

  var Helpers    = require('./helpers').Helpers;

  var M = require('./model');
  var C = require('./collection');

  var array = [];
  var push  = array.push;

  // Used internally, the `Relation` helps in simplifying the relationship building,
  // centralizing all logic dealing with type & option handling.
  var Relation = function(type, Target, options) {
    this.type = type;
    if (this.target = Target) {
      this.targetTableName = _.result(Target.prototype, 'tableName');
      this.targetIdAttribute = _.result(Target.prototype, 'idAttribute');
    }
    _.extend(this, options);
  };

  Relation.prototype = {

    // Assembles the new model or collection we're creating an instance of,
    // gathering any relevant primitives from the parent object,
    // without keeping any hard references.
    init: function(parent) {
      this.parentId = parent.id;
      this.parentTableName   = _.result(parent, 'tableName');
      this.parentIdAttribute = _.result(parent, 'idAttribute');

      // If the parent object is eager loading, we don't need the
      // id attribute, because we'll just be creating a `whereIn` from the
      // previous response anyway.
      if (!parent._isEager) {
        if (this.isInverse()) {
          if (this.type === 'morphTo') {
            this.target = Helpers.morphCandidate(this.candidates, parent.get(this.key('morphKey')));
          }
          this.parentFk = parent.get(this.key('otherKey'));
        } else {
          this.parentFk = parent.id;
        }
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

      // Set the appropriate foreign & other keys if we're doing a belongsToMany,
      // for convenience.
      if (this.type === 'belongsToMany') {
        this.foreignKey = this.throughForeignKey;
      }
      _.extend(this, options);
      _.extend(source, pivotHelpers);
      return source;
    },

    // Generates and returns a specified key, for convenience... one of
    // `foreignKey`, `otherKey`, `throughForeignKey`.
    key: function(keyName) {
      if (this[keyName]) return this[keyName];
      if (keyName === 'otherKey') {
        if (this.type === 'morphTo') return this[keyName] = this.morphName + '_id';
        return this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
      }
      if (keyName === 'throughForeignKey') {
        return this[keyName] = singularMemo(this.joinTable()) + '_' + this.throughIdAttribute;
      }
      if (keyName === 'foreignKey') {
        if (this.isMorph()) return this[keyName] = this.morphName + '_id';
        return this[keyName] = singularMemo(this.parentTableName) + '_' + this.parentIdAttribute;
      }
      if (keyName === 'morphKey') return this[keyName] = this.morphName + '_type';
      if (keyName === 'morphValue') return this[keyName] = this.parentTableName || this.targetTableName;
    },

    // Injects the necessary `select` constraints into a `knex` query builder.
    selectConstraints: function(knex, options) {
      var resp = options.parentResponse;

      // The base select column
      if (knex.columns.length === 0 && (!options.columns || options.columns.length === 0)) {
        knex.columns.push(this.isJoined() ? this.targetTableName + '.*' : '*');
      } else {
        // TODO
      }

      // The `belongsToMany` and `through` relations have joins & pivot columns.
      if (this.isJoined()) {
        this.joinClauses(knex);
        this.joinColumns(knex);
      }

      // Finally, add (and validate) the where conditions, necessary for constraining the relation.
      this.whereClauses(knex, resp);
    },

    // Inject & validates necessary `through` constraints for the current model.
    joinColumns: function(knex) {
      var columns = [];
      var joinTable = this.joinTable();
      if (this.isThrough()) {
        columns.push(this.throughIdAttribute, this.type === 'belongsTo' ? this.key('otherKey') : this.key('foreignKey'));
        if (this.type === 'belongsToMany') columns.push(this.key('otherKey'));
      } else {
        columns.push(this.key('foreignKey'));
        if (this.type === 'belongsToMany') columns.push(this.key('otherKey'));
      }
      push.apply(columns, this.pivotColumns);
      push.apply(knex.columns, _.map(columns, function(col) {
        return joinTable + '.' + col + ' as _pivot_' + col;
      }));
    },

    // Generates the join clauses necessary for the current relation.
    joinClauses: function(knex) {
      var joinTable = this.joinTable();

      if (this.type === 'belongsTo' || this.type === 'belongsToMany') {
        knex.join(
          joinTable,
          joinTable + '.' + this.key('otherKey'), '=',
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
      var key, keyed;

      if (this.isJoined()) {
        var targetTable = this.type === 'belongsTo' ? this.parentTableName : this.joinTable();
        key = targetTable + '.' + (this.type === 'belongsTo' ? this.parentIdAttribute : this.key('foreignKey'));
      } else {
        key = this.isInverse() ? this.parentIdAttribute : this.key('foreignKey');
      }

      knex[resp ? 'whereIn' : 'where'](key, resp ? this.eagerKeys(resp) : this.parentFk);

      if (this.isMorph()) {
        knex.where(this.key('morphKey'), this.key('morphValue'));
      }
    },

    // Fetches all `eagerKeys` from the current relation.
    eagerKeys: function(resp) {
      return _.uniq(_.pluck(resp, this.isInverse() ? this.key('otherKey') : this.parentIdAttribute));
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
      models || (models = []);

      var Target = this.target;
      if (this.isSingle()) {
        if (!(Target.prototype instanceof M.Model)) {
          throw new Error('The `'+this.type+'` related object must be a Bookshelf.Model');
        }
        return models[0] || new Target();
      }

      // Allows us to just use a model, but create a temporary collection for
      // a many relation.
      if (Target.prototype instanceof M.Model) {
        Target = C.Collection.extend({
          model: Target,
          builder: Target.prototype.builder
        });
      }
      return new Target(models, {parse: true});
    },

    // Creates a new model, used internally in the eager fetch helper methods.
    createModel: function(data) {
      if (this.target.prototype instanceof C.Collection) {
        return new this.target.prototype.model(data, {parse: true})._reset();
      }
      return new this.target(data, {parse: true})._reset();
    },

    // Groups the related response according to the type of relationship
    // we're handling, for easy attachment to the parent models.
    eagerPair: function(relationName, related, models) {

      // If this is a `through` or `belongsToMany` relation, we need to cleanup & setup the `interim` model.
      if (this.isJoined()) related = this.parsePivot(related);

      var grouped = _.groupBy(related, function(model) {
        return this.isSingle() ? model.id : (model.pivot
          ? model.pivot.get(this.key('foreignKey')) : model.get(this.key('foreignKey')));
      }, this);

      for (var i = 0, l = models.length; i < l; i++) {
        var model = models[i];
        var groupedKey = this.isInverse() ? model.get(this.key('otherKey')) : model.id;
        model.relations[relationName] = this.relatedInstance(grouped[groupedKey]);
      }
      return related;
    },

    // The `models` is an array of models returned from the fetch,
    // after they're `set`... parsing out any of the `_pivot_` items from the
    // join table and assigning them on the pivot model or object as appropriate.
    parsePivot: function(models) {
      var Through = this.throughTarget;
      return _.map(models, function(model) {
        var data = {}, attrs = model.attributes, through;
        if (Through) through = new Through();
        for (var key in attrs) {
          if (key.indexOf('_pivot_') === 0) {
            data[key.slice(7)] = attrs[key];
            delete attrs[key];
          }
        }
        if (!_.isEmpty(data)) {
          model.pivot = through ? through.set(data, {silent: true}) : new M.Model(data, {
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
  };

  // Specific to many-to-many relationships, these methods are mixed
  // into the `belongsToMany` relationships when they are created,
  // providing helpers for attaching and detaching related models.
  var pivotHelpers = {

    // Attach one or more "ids" from a foreign
    // table to the current. Creates & saves a new model
    // and attaches the model with a join table entry.
    attach: function(ids, options) {
      return this._handler('insert', ids, options);
    },

    // Detach related object from their pivot tables.
    // If a model or id is passed, it attempts to remove the
    // pivot table based on that foreign key. If a hash is passed,
    // it attempts to remove the item based on a where clause with
    // these parameters. If no parameters are specified, we assume we will
    // detach all related associations.
    detach: function(ids, options) {
      return this._handler('delete', ids, options);
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
    _handler: function(method, ids, options) {
      var pending = [];
      if (ids == void 0) {
        if (method === 'insert') return when.resolve(this);
        if (method === 'delete') pending.push(this._processPivot(method, null, options));
      }
      if (!_.isArray(ids)) ids = ids ? [ids] : [];
      for (var i = 0, l = ids.length; i < l; i++) {
        pending.push(this._processPivot(method, ids[i], options));
      }
      var collection = this;
      return when.all(pending).then(function() {
        return collection;
      });
    },

    // Handles setting the appropriate constraints and shelling out
    // to either the `insert` or `delete` call for the current model,
    // returning a promise.
    _processPivot: function(method, item, options) {
      var data = {};
      var relatedData = this.relatedData;
      data[relatedData.key('foreignKey')] = relatedData.parentFk;

      // If the item is an object, it's either a model
      // that we're looking to attach to this model, or
      // a hash of attributes to set in the relation.
      if (_.isObject(item)) {
        if (item instanceof M.Model) {
          data[relatedData.key('otherKey')] = item.id;
        } else {
          _.extend(data, item);
        }
      } else if (item) {
        data[relatedData.key('otherKey')] = item;
      }
      var builder = this.builder(relatedData.joinTable());
      if (options && options.transacting) {
        builder.transacting(options.transacting);
      }
      if (method === 'delete') return builder.where(data).del();
      return builder.insert(data);
    }
  };

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

  exports.Relation = Relation;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);