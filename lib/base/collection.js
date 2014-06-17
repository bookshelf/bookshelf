// Base Collection
// ---------------

// All exernal dependencies required in this scope.
var _         = require('lodash');
var Backbone  = require('backbone');

// All components that need to be referenced in this scope.
var Events    = require('./events');
var Promise   = require('./promise');
var ModelBase = require('./model');

var array  = [];
var push   = array.push;
var splice = array.splice;

var CollectionBase = function(models, options) {
  if (options) _.extend(this, _.pick(options, collectionProps));
  this._reset();
  this.initialize.apply(this, arguments);
  if (!_.isFunction(this.model)) {
    throw new Error('A valid `model` constructor must be defined for all collections.');
  }
  if (models) this.reset(models, _.extend({silent: true}, options));
};

// List of attributes attached directly from the constructor's options object.
var collectionProps   = ['model', 'comparator'];

// A list of properties that are omitted from the `Backbone.Model.prototype`, to create
// a generic collection base.
var collectionOmitted = ['model', 'fetch', 'url', 'sync', 'create'];

// Copied over from Backbone.
var setOptions = {add: true, remove: true, merge: true};

_.extend(CollectionBase.prototype, _.omit(Backbone.Collection.prototype, collectionOmitted), Events, {

  // The `tableName` on the associated Model, used in relation building.
  tableName: function() {
    return _.result(this.model.prototype, 'tableName');
  },

  // The `idAttribute` on the associated Model, used in relation building.
  idAttribute: function() {
    return this.model.prototype.idAttribute;
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

  // Prepare a model or hash of attributes to be added to this collection.
  _prepareModel: function(attrs, options) {
    if (attrs instanceof ModelBase) return attrs;
    return new this.model(attrs, options);
  },

  // Run "Promise.map" over the models
  mapThen: function(iterator, context) {
    return Promise.bind(context).thenReturn(this.models).map(iterator);
  },

  // Convenience method for invoke, returning a `Promise.all` promise.
  invokeThen: function() {
    return Promise.all(this.invoke.apply(this, arguments));
  },

  // Run "reduce" over the models in the collection.
  reduceThen: function(iterator, initialValue, context) {
    return Promise.bind(context).thenReturn(this.models).reduce(iterator, initialValue).bind();
  },

  fetch: function() {
    return Promise.rejected('The fetch method has not been implemented');
  }

});

// List of attributes attached directly from the `options` passed to the constructor.
var modelProps = ['tableName', 'hasTimestamps'];

CollectionBase.extend = require('simple-extend');

module.exports = CollectionBase;
