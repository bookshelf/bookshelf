// Collection
// ---------------
var _             = require('lodash');

var Sync          = require('./sync').Sync;
var Helpers       = require('./helpers').Helpers;
var EagerRelation = require('./eager').EagerRelation;

var CollectionBase = require('../base/collection').CollectionBase;
var Promise        = require('../base/promise').Promise;

exports.Collection = CollectionBase.extend({

  // Used to define passthrough relationships - `hasOne`, `hasMany`,
  // `belongsTo` or `belongsToMany`, "through" a `Interim` model or collection.
  through: function(Interim, foreignKey, otherKey) {
    return this.relatedData.through(this, Interim, {throughForeignKey: foreignKey, otherKey: otherKey});
  },

  // Fetch the models for this collection, resetting the models
  // for the query when they arrive.
  fetch: Promise.method(function(options) {
    options = options ? _.clone(options) : {};
    var sync = this.sync(options)
      .select()
      .bind(this)
      .tap(function(response) {
        if (!response || response.length === 0) {
          if (options.require) throw new Error('EmptyResponse');
          return Promise.reject(null);
        }
      })

      // Now, load all of the data onto the collection as necessary.
      .tap(handleResponse);

    // If the "withRelated" is specified, we also need to eager load all of the
    // data on the collection, as a side-effect, before we ultimately jump into the
    // next step of the collection. Since the `columns` are only relevant to the current
    // level, ensure those are omitted from the options.
    if (options.withRelated) {
      sync = sync.tap(handleEager(_.omit(options, 'columns')));
    }

    return sync.tap(function(response) {
      return this.triggerThen('fetched', this, response, options);
    })
    .caught(function(err) {
      if (err !== null) throw err;
      this.reset([], {silent: true});
    })
    .yield(this);
  }),

  // Fetches a single model from the collection, useful on related collections.
  fetchOne: Promise.method(function(options) {
    var model = new this.model;
    model._knex = this.query().clone();
    if (this.relatedData) model.relatedData = this.relatedData;
    return model.fetch(options);
  }),

  // Eager loads relationships onto an already populated `Collection` instance.
  load: Promise.method(function(relations, options) {
    _.isArray(relations) || (relations = [relations]);
    options = _.extend({}, options, {shallow: true, withRelated: relations});
    return new EagerRelation(this.models, this.toJSON(options), new this.model())
      .fetch(options)
      .yield(this);
  }),

  // Shortcut for creating a new model, saving, and adding to the collection.
  // Returns a promise which will resolve with the model added to the collection.
  // If the model is a relation, put the `foreignKey` and `fkValue` from the `relatedData`
  // hash into the inserted model. Also, if the model is a `manyToMany` relation,
  // automatically create the joining model upon insertion.
  create: Promise.method(function(model, options) {
    options = options ? _.clone(options) : {};
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
      .bind(this)
      .then(function() {
        if (relatedData && (relatedData.type === 'belongsToMany' || relatedData.isThrough())) {
          return this.attach(model, options);
        }
      })
      .then(function() {
        this.add(model, options);
        return model;
      });
  }),

  // Reset the query builder, called internally
  // each time a query is run.
  resetQuery: function() {
    this._knex = null;
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

// Handles the response data for the collection, returning from the collection's fetch call.
function handleResponse(response) {
  var relatedData = this.relatedData;
  this.set(response, {silent: true, parse: true}).invoke('_reset');
  if (relatedData && relatedData.isJoined()) {
    relatedData.parsePivot(this.models);
  }
}

// Handle the related data loading on the collection.
function handleEager(options) {
  return function(response) {
    return new EagerRelation(this.models, response, new this.model()).fetch(options);
  };
}