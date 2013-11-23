// Base Collection
// ---------------
(function(define) {

"use strict";

// The `CollectionBase` is an object that takes
define(function(require, exports) {

  // All exernal dependencies required in this scope.
  var _         = require('underscore');
  var when      = require('when');
  var Backbone  = require('backbone');

  // All components that need to be referenced in this scope.
  var Events    = require('./events').Events;
  var Helpers   = require('./helpers').Helpers;
  var ModelBase = require('./model').ModelBase;

  var array  = [];
  var push   = array.push;
  var splice = array.splice;

  var CollectionBase = function(models, options) {
    if (options) _.extend(this, _.pick(options, collectionProps));
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
    _.bindAll(this, '_handleResponse', '_handleEager');
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
          id = Helpers.idValue(attrs, targetModel.prototype.idAttribute);
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
          if (model.id != null) this._byId[Helpers.prepId(model.id)] = model;
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

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[Helpers.prepId(obj.id)] || this._byId[obj.cid] || this._byId[Helpers.prepId(obj)];
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof ModelBase) return attrs;
      return new this.model(attrs, options);
    },

    // Convenience method for map, returning a `when.all` promise.
    mapThen: function(iterator, context) {
      return when.all(this.map(iterator, context));
    },

    // Convenience method for invoke, returning a `when.all` promise.
    invokeThen: function() {
      return when.all(this.invoke.apply(this, arguments));
    },

    fetch: function() {},

    _handleResponse: function() {},

    _handleEager: function() {},

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroyed') this.remove(model, options);
      if (model && event === 'changePk') {
        delete this._byId[Helpers.prepId(model._previousPk)];
        if (model.id != null) this._byId[model.getId()] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // List of attributes attached directly from the `options` passed to the constructor.
  var modelProps = ['tableName', 'hasTimestamps'];

  CollectionBase.extend = Backbone.Collection.extend;

  // Helper to mixin one or more additional items to the current prototype.
  CollectionBase.include = function() {
    _.extend.apply(_, [this.prototype].concat(_.toArray(arguments)));
    return this;
  };

  exports.CollectionBase = CollectionBase;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);