(function(define) { "use strict";

define(function(require, exports, module) {

  // All external dependencies are referenced through a local module,
  // so that you can modify the `exports` and say... swap out `underscore`
  // for `lodash` if you really wanted to.
  var _        = require('./ext/underscore')._;
  var when     = require('./ext/when').when;

  // ...and the `ModelBase` and `CollectionBase`, for the necessary
  // `instanceof` checks throughout the `Collection`.
  var ModelBase = require('./modelbase').ModelBase;
  var CollectionBase = require('./collectionbase').CollectionBase;

  // Some other shared objects.
  var Events  = require('./events').Events;
  var Helpers = require('./helpers').Helpers;
  var Eager   = require('./eager').Eager;
  var Sync    = require('./sync').Sync;

  // Array helpers.
  var array  = [];
  var splice = array.splice;
  var push   = array.push;

  // Bookshelf.Collection
  // -------------------

  // A Bookshelf Collection contains a number of database rows, represented by
  // models, so they can be easily sorted, serialized, and manipulated.
  var Collection = CollectionBase.extend({

    // Simplified from the `Backbone.Collection`'s constructor, this
    constructor: function(models, options) {
      if (options) _.extend(this, _.pick(options, collectionProps));
      this._reset();
      this.initialize.apply(this, arguments);
      if (models) this.reset(models, _.extend({silent: true}, options));
    },

    // Used to define passthrough relationships - `hasOne`, `hasMany`,
    // `belongsTo` or `belongsToMany`, "through" a `Interim` model or collection.
    through: function(Interim, foreignKey, otherKey) {
      return this.relatedData.through(this, Interim, {throughForeignKey: foreignKey, otherKey: otherKey});
    },

    // A simplified version of Backbone's `Collection#set` method,
    // removing the comparator, and getting rid of the temporary model creation,
    // since there's *no way* we'll be getting the data in an inconsistent
    // form from the database.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      if (!_.isArray(models)) models = models ? [models] : [];
      var i, l, id, model, attrs, existing;
      var at = options.at;
      var targetModel = this.model;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i];
        if (attrs instanceof ModelBase) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) {
            modelMap[existing.cid] = true;
            continue;
          }
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
          }

          // This is a new model, push it to the `toAdd` list.
        } else if (add) {
          if (!(model = this._prepareModel(attrs, options))) continue;
          toAdd.push(model);

          // Listen to added models' events, and index models for lookup by
          // `id` and by `cid`.
          model.on('all', this._onModelEvent, this);
          this._byId[model.cid] = model;
          if (model.id != null) this._byId[model.id] = model;
        }
        if (order) order.push(existing || model);
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        this.length += toAdd.length;
        if (at != null) {
          splice.apply(this.models, [at, 0].concat(toAdd));
        } else {
          if (order) this.models.length = 0;
          push.apply(this.models, order || toAdd);
        }
      }

      if (options.silent) return this;

      // Trigger `add` events.
      for (i = 0, l = toAdd.length; i < l; i++) {
        (model = toAdd[i]).trigger('add', model, this, options);
      }
      return this;
    },

    // Fetch the models for this collection, resetting the models
    // for the query when they arrive.
    fetch: function(options) {
      options || (options = {});
      var collection = this, relatedData = this.relatedData;
      return this.sync(options)
        .select()
        .then(function(response) {
          if (response && response.length > 0) {
            collection.set(response, {silent: true, parse: true}).invoke('_reset');
            if (relatedData && relatedData.isJoined()) relatedData.parsePivot(collection.models);
          } else {
            collection.reset([], {silent: true});
            return [];
          }
          if (!options.withRelated) return response;
          return new Eager(collection.models, response, new collection.model())
            .fetch(options)
            .then(function() { return response; });
        })
        .then(function(response) {
          return collection.triggerThen('fetched', collection, response, options).then(function() {
            return collection;
          });
        });
    },

    // Fetches a single model from the collection, useful on related collections.
    fetchOne: function(options) {
      var model = new this.model;
      if (this.relatedData) model.relatedData = this.relatedData;
      return model.fetch(options);
    },

    // Eager loads relationships onto an already populated `Collection` instance.
    load: function(relations, options) {
      var collection = this;
      _.isArray(relations) || (relations = [relations]);
      options = _.extend({}, options, {shallow: true, withRelated: relations});
      return new Eager(this.models, this.toJSON(options), new this.model())
        .fetch(options)
        .then(function() { return collection; });
    },

    // Shortcut for creating a new model, saving, and adding to the collection.
    // Returns a promise which will resolve with the model added to the collection.
    // If the model is a relation, put the `foreignKey` and `fkValue` from the `relatedData`
    // hash into the inserted model. Also, if the model is a `manyToMany` relation,
    // automatically create the joining model upon insertion.
    create: function(model, options) {
      options || (options = {});

      var collection  = this;
      var relatedData = this.relatedData;

      model = this._prepareModel(model, options);

      return Helpers
        .saveConstraints(model, relatedData)
        .save(null, options)
        .then(function() {
          if (relatedData && (relatedData.type === 'belongsToMany' || relatedData.isThrough())) {
            return collection.attach(model, options);
          }
        })
        .then(function() {
          collection.add(model, options);
          return model;
        });
    },

    // The `tableName` on the associated Model, used in relation building.
    tableName: function() {
      return _.result(this.model.prototype, 'tableName');
    },

    // The `idAttribute` on the associated Model, used in relation building.
    idAttribute: function() {
      return this.model.prototype.idAttribute;
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

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof ModelBase) return attrs;
      return new this.model(attrs, options);
    }

  });

  // List of attributes attached directly from the constructor's options object.
  var collectionProps = ['model', 'comparator'];

  // Copied over from Backbone for the new and improved `set` method.
  var setOptions = {add: true, remove: true, merge: true};

  exports.Collection = Collection;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);