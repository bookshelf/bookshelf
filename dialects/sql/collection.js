(function(define) {

"use strict";

define(function(require, exports) {

  var _ = require('underscore');
  var when = require('when');

  var Sync = require('./sync').Sync;
  var Helpers = require('./helpers').Helpers;
  var EagerRelation = require('./eager').EagerRelation;

  var CollectionBase = require('../base/collection').CollectionBase;

  exports.Collection = CollectionBase.extend({

    // Used to define passthrough relationships - `hasOne`, `hasMany`,
    // `belongsTo` or `belongsToMany`, "through" a `Interim` model or collection.
    through: function(Interim, foreignKey, otherKey) {
      return this.relatedData.through(this, Interim, {throughForeignKey: foreignKey, otherKey: otherKey});
    },

    // Fetch the models for this collection, resetting the models
    // for the query when they arrive.
    fetch: function(options) {
      options = options || {};
      var collection = this, relatedData = this.relatedData;
      return this.sync(options)
        .select()
        .tap(function(response) {
          if (!response || response.length === 0) return when.reject(null);
        })
        .then(function(response) {
          collection.set(response, {silent: true, parse: true}).invoke('_reset');
          if (relatedData && relatedData.isJoined()) relatedData.parsePivot(collection.models);
          if (!options.withRelated) return response;
          return new EagerRelation(collection.models, response, new collection.model())
            .fetch(options)
            .then(function() { return response; });
        })
        .then(function(response) {
          return collection.triggerThen('fetched', collection, response, options);
        })
        .otherwise(function() {
          collection.reset([], {silent: true});
        })
        .yield(this);
    },

    // Fetches a single model from the collection, useful on related collections.
    fetchOne: function(options) {
      var model = new this.model;
      model._knex = this.query().clone();
      if (this.relatedData) model.relatedData = this.relatedData;
      return model.fetch(options);
    },

    // Eager loads relationships onto an already populated `Collection` instance.
    load: function(relations, options) {
      var collection = this;
      _.isArray(relations) || (relations = [relations]);
      options = _.extend({}, options, {shallow: true, withRelated: relations});
      return new EagerRelation(this.models, this.toJSON(options), new this.model())
        .fetch(options)
        .then(function() { return collection; });
    },

    // Shortcut for creating a new model, saving, and adding to the collection.
    // Returns a promise which will resolve with the model added to the collection.
    // If the model is a relation, put the `foreignKey` and `fkValue` from the `relatedData`
    // hash into the inserted model. Also, if the model is a `manyToMany` relation,
    // automatically create the joining model upon insertion.
    create: function(model, options) {
      options = options || {};

      var collection  = this;
      var relatedData = this.relatedData;

      model = this._prepareModel(model, options);

      // If we've already added things on the query chain,
      // these are likely intended for the model.
      if (this._knex) {
        model._knex = this._knex;
        this.resetQuery();
      }

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
    }

  });

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);