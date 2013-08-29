(function(define) { "use strict";

define(function(require, exports, module) {

  // All external dependencies are referenced through a local module,
  // so that you can modify the `exports` and say... swap out `underscore`
  // for `lodash` if you really wanted to.
  var _         = require('./ext/underscore')._;
  var when      = require('./ext/when').when;

  var ModelBase = require('./modelbase').ModelBase;
  var Helpers   = require('./helpers').Helpers;
  var Eager     = require('./eager').Eager;
  var Sync      = require('./sync').Sync;

  // Bookshelf.Model
  // -------------------

  // A Bookshelf Model represents an individual row in the database table --
  // It has a similar implementation to the `Backbone.Model`
  // constructor, except that defaults are not set until the
  // object is persisted, and the collection property is not used.

  // A unique `cid` property is also added to each created model, similar to
  // `Backbone` models, and is useful checking the identity of two models.
  var Model = ModelBase.extend({

    constructor: function(attributes, options) {
      var attrs = attributes || {};
      options || (options = {});
      this.attributes = Object.create(null);
      this._reset();
      this.relations = {};
      this.cid  = _.uniqueId('c');
      if (options) {
        _.extend(this, _.pick(options, modelProps));
        if (options.parse) attrs = this.parse(attrs, options) || {};
      }
      this.set(attrs, options);
      this.initialize.apply(this, arguments);
    },

    // The `hasOne` relation specifies that this table has exactly one of another type of object,
    // specified by a foreign key in the other table. The foreign key is assumed to be the singular of this
    // object's `tableName` with an `_id` suffix, but a custom `foreignKey` attribute may also be specified.
    hasOne: function(Target, foreignKey) {
      return this.relation('hasOne', Target, {foreignKey: foreignKey}).init(this);
    },

    // The `hasMany` relation specifies that this object has one or more rows in another table which
    // match on this object's primary key. The foreign key is assumed to be the singular of this object's
    // `tableName` with an `_id` suffix, but a custom `foreignKey` attribute may also be specified.
    hasMany: function(Target, foreignKey) {
      return this.relation('hasMany', Target, {foreignKey: foreignKey}).init(this);
    },

    // A reverse `hasOne` relation, the `belongsTo`, where the specified key in this table
    // matches the primary `idAttribute` of another table.
    belongsTo: function(Target, otherKey) {
      return this.relation('belongsTo', Target, {otherKey: otherKey}).init(this);
    },

    // A `belongsToMany` relation is when there are many-to-many relation
    // between two models, with a joining table.
    belongsToMany: function(Target, joinTableName, foreignKey, otherKey) {
      return this.relation('belongsToMany', Target, {
        joinTableName: joinTableName, foreignKey: foreignKey, otherKey: otherKey
      }).init(this);
    },

    // A `morphOne` relation is a one-to-one polymorphic association from this model
    // to another model.
    morphOne: function(Target, name, morphValue) {
      return this._morphOneOrMany(Target, name, morphValue, 'morphOne');
    },

    // A `morphMany` relation is a polymorphic many-to-one relation from this model
    // to many another models.
    morphMany: function(Target, name, morphValue) {
      return this._morphOneOrMany(Target, name, morphValue, 'morphMany');
    },

    // Defines the opposite end of a `morphOne` or `morphMany` relationship, where
    // the alternate end of the polymorphic model is defined.
    morphTo: function(morphName) {
      if (!_.isString(morphName)) throw new Error('The `morphTo` name must be specified.');
      return this.relation('morphTo', null, {morphName: morphName, candidates: _.rest(arguments)}).init(this);
    },

    // Used to define passthrough relationships - `hasOne`, `hasMany`,
    // `belongsTo` or `belongsToMany`, "through" a `Interim` model or collection.
    through: function(Interim, foreignKey, otherKey) {
      return this.relatedData.through(this, Interim, {throughForeignKey: foreignKey, otherKey: otherKey});
    },

    // Fetch a model based on the currently set attributes,
    // returning a model to the callback, along with any options.
    // Returns a deferred promise through the `Bookshelf.Sync`.
    // If `{require: true}` is set as an option, the fetch is considered
    // a failure if the model comes up blank.
    fetch: function(options) {
      options || (options = {});
      var model = this, relatedData = this.relatedData;
      return this.sync(options)
        .first()
        .then(function(response) {
          if (response && response.length > 0) {
            // Todo: {silent: true, parse: true}, for parity with collection#set
            // need to check on Backbone's status there, ticket #2636
            model.set(model.parse(response[0]), {silent: true})._reset();

            if (relatedData && relatedData.isJoined()) {
              relatedData.parsePivot([model]);
            }

            if (!options.withRelated) return response;
            return new Eager([model], response, model)
              .fetch(options)
              .then(function() { return response; });
          }
          if (options.require) return when.reject(new Error('EmptyResponse'));
        })
        .then(function(response) {
          if (response && response.length > 0) {
            return model.triggerThen('fetched', model, response, options).then(function() {
              return model;
            });
          }
          return null;
        });
    },

    // Eager loads relationships onto an already populated `Model` instance.
    load: function(relations, options) {
      var model = this;
      _.isArray(relations) || (relations = [relations]);
      options = _.extend({}, options, {shallow: true, withRelated: relations});
      return new Eager([this], [this.toJSON(options)], this)
        .fetch(options)
        .then(function() { return model; });
    },

    // Similar to the standard `Backbone` set method, but without individual
    // change events, and adding different meaning to `changed` and `previousAttributes`
    // defined as the last "sync"'ed state of the model.
    set: function(key, val, options) {
      if (key == null) return this;
      var attrs;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }
      options || (options = {});

      // Extract attributes and options.
      var hasChanged = false;
      var unset   = options.unset;
      var current = this.attributes;
      var prev    = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (var attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
          if (!_.isEqual(current[attr], val)) hasChanged = true;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      if (hasChanged && !options.silent) this.trigger('change', this, options);
      return this;
    },

    // Sets and saves the hash of model attributes, triggering
    // a "creating" or "updating" event on the model, as well as a "saving" event,
    // to bind listeners for any necessary validation, logging, etc.
    // If an error is thrown during these events, the model will not be saved.
    save: function(key, val, options) {
      var attrs;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === "object") {
        attrs = key || {};
        options = val || {};
      } else {
        options || (options = {});
        (attrs = {})[key] = val;
      }

      // If the model has timestamp columns,
      // set them as attributes on the model, even
      // if the "patch" option is specified.
      if (this.hasTimestamps) _.extend(attrs, this.timestamp(options));

      // Determine whether the model is new, based on whether the model has an `idAttribute` or not.
      var method = options.method || (options.method = this.isNew(options) ? 'insert' : 'update');
      var vals = attrs;

      // If the object is being created, we merge any defaults here
      // rather than during object creation.
      if (method === 'insert' || options.defaults) {
        var defaults = _.result(this, 'defaults');
        if (defaults) {
          vals = _.extend({}, defaults, this.attributes, vals);
        }
      }

      // Set the attributes on the model, and maintain a reference to use below.
      var model = this.set(vals, {silent: true});

      // If there are any save constraints, set them on the model.
      if (this.relatedData) Helpers.saveConstraints(this, this.relatedData);

      var sync = this.sync(options);

      // Gives access to the `query` object in the `options`, in case we need it.
      options.query = sync.query;

      return when.all([
        model.triggerThen((method === 'insert' ? 'creating' : 'updating'), model, attrs, options),
        model.triggerThen('saving', model, attrs, options)
      ])
      .then(function() {
        return sync[options.method](method === 'update' && options.patch ? attrs : model.attributes);
      })
      .then(function(resp) {

        // After a successful database save, the id is updated if the model was created
        if (method === 'insert' && resp) {
          model.attributes[model.idAttribute] = model[model.idAttribute] = resp[0];
        }

        // In case we need to reference the `previousAttributes` for the model
        // in the following event handlers.
        options.previousAttributes = model._previousAttributes;

        model._reset();

        return when.all([
          model.triggerThen((method === 'insert' ? 'created' : 'updated'), model, resp, options),
          model.triggerThen('saved', model, resp, options)
        ]);

      }).then(function() {
        return model;
      });
    },

    // Destroy a model, calling a "delete" based on its `idAttribute`.
    // A "destroying" and "destroyed" are triggered on the model before
    // and after the model is destroyed, respectively. If an error is thrown
    // during the "destroying" event, the model will not be destroyed.
    destroy: function(options) {
      options || (options = {});
      var model = this;
      return model.triggerThen('destroying', model, options)
      .then(function() { return model.sync(options).del(); })
      .then(function(resp) {
        model.clear();
        return model.triggerThen('destroyed', model, resp, options).then(function() {
          return model._reset();
        });
      });
    },

    // **format** converts a model into the values that should be saved into
    // the database table. The default implementation is just to pass the response along.
    format: function(attrs, options) {
      return attrs;
    },

    // Returns an object containing a shallow copy of the model attributes,
    // along with the `toJSON` value of any relations,
    // unless `{shallow: true}` is passed in the `options`.
    toJSON: function(options) {
      var attrs = _.extend({}, this.attributes);
      if (options && options.shallow) return attrs;
      var relations = this.relations;
      for (var key in relations) {
        var relation = relations[key];
        attrs[key] = relation.toJSON ? relation.toJSON() : relation;
      }
      if (this.pivot) {
        var pivot = this.pivot.attributes;
        for (key in pivot) {
          attrs['_pivot_' + key] = pivot[key];
        }
      }
      return attrs;
    },

    // Sets the timestamps before saving the model.
    timestamp: function(options) {
      var d = new Date();
      var keys = (_.isArray(this.hasTimestamps) ? this.hasTimestamps : ['created_at', 'updated_at']);
      var vals = {};
      vals[keys[1]] = d;
      if (this.isNew(options) && (!options || options.method !== 'update')) vals[keys[0]] = d;
      return vals;
    },

    // Create a new model with identical attributes to this one,
    // including any relations on the current model.
    clone: function() {
      var model = new this.constructor(this.attributes);
      var relations = this.relations;
      for (var key in relations) {
        model.relations[key] = relations[key].clone();
      }
      model._previousAttributes = _.clone(this._previousAttributes);
      model.changed = _.clone(this.changed);
      return model;
    },

    // Returns the related item, or creates a new
    // related item by creating a new model or collection.
    related: function(name) {
      return this.relations[name] || (this[name] ? this.relations[name] = this[name]() : void 0);
    },

    // Reset the query builder, called internally
    // each time a query is run.
    resetQuery: function() {
      delete this._knex;
      return this;
    },

    // Returns an instance of the query builder.
    query: function() {
      return Helpers.query(this, _.toArray(arguments));
    },

    // Creates and returns a new `Bookshelf.Sync` instance.
    sync: function(options) {
      return new Sync(this, options);
    },

    // Helper for setting up the `morphOne` or `morphMany` relations.
    _morphOneOrMany: function(Target, morphName, morphValue, type) {
      if (!morphName || !Target) throw new Error('The polymorphic `name` and `Target` are required.');
      return this.relation(type, Target, {morphName: morphName, morphValue: morphValue}).init(this);
    },

    // Called after a `sync` action (save, fetch, delete) -
    // resets the `_previousAttributes` and `changed` hash for the model.
    _reset: function() {
      this._previousAttributes = _.extend(Object.create(null), this.attributes);
      this.changed = Object.create(null);
      return this;
    }

  });

  // List of attributes attached directly from the `options` passed to the constructor.
  var modelProps = ['tableName', 'hasTimestamps'];

  exports.Model = Model;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);