// Base Collection
// ---------------

// All exernal dependencies required in this scope.
var _         = require('lodash');
var inherits  = require('inherits');

// All components that need to be referenced in this scope.
var Events    = require('./events');
var Promise   = require('./promise');
var ModelBase = require('./model');

var array  = [];
var push   = array.push;
var slice  = array.slice;
var splice = array.splice;

function CollectionBase(models, options) {
  if (options) _.extend(this, _.pick(options, collectionProps));
  this._reset();
  if (!_.isFunction(this.model)) {
    throw new Error('A valid `model` constructor must be defined for all collections.');
  }
  if (models) this.reset(models, _.extend({silent: true}, options));
}
inherits(CollectionBase, Events);

// List of attributes attached directly from the constructor's options object.
var collectionProps = ['model', 'Model', 'comparator'];

// Copied over from Backbone.
var setOptions = {add: true, remove: true, merge: true};
var addOptions = {add: true, remove: false};

// The `tableName` on the associated Model, used in relation building.
CollectionBase.prototype.tableName = function() {
  return _.result(this.model.prototype, 'tableName');
};

// The `idAttribute` on the associated Model, used in relation building.
CollectionBase.prototype.idAttribute = function() {
  return this.model.prototype.idAttribute;
};

CollectionBase.prototype.toString = function() {
  return '[Object Collection]';
};

// The JSON representation of a Collection is an array of the
// models' attributes.
CollectionBase.prototype.toJSON = function(options) {
  return this.map(function(model){ return model.toJSON(options); });
};

// A simplified version of Backbone's `Collection#set` method,
// removing the comparator, and getting rid of the temporary model creation,
// since there's *no way* we'll be getting the data in an inconsistent
// form from the database.
CollectionBase.prototype.set = function(models, options) {
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
      if (order) {
        this.models.length = 0;
      } else {
        order = toAdd;
      }
      for (i = 0, l = order.length; i < l; ++i) {
        this.models.push(order[i]);
      }
    }
  }

  if (options.silent) return this;

  // Trigger `add` events.
  for (i = 0, l = toAdd.length; i < l; i++) {
    (model = toAdd[i]).trigger('add', model, this, options);
  }
  return this;
};

// Prepare a model or hash of attributes to be added to this collection.
CollectionBase.prototype._prepareModel = function(attrs, options) {
  if (attrs instanceof ModelBase) return attrs;
  return new this.model(attrs, options);
};

// Run "Promise.map" over the models
CollectionBase.prototype.mapThen = function(iterator, context) {
  return Promise.bind(context).thenReturn(this.models).map(iterator);
};

// Convenience method for invoke, returning a `Promise.all` promise.
CollectionBase.prototype.invokeThen = function() {
  return Promise.all(this.invoke.apply(this, arguments));
};

// Run "reduce" over the models in the collection.
CollectionBase.prototype.reduceThen = function(iterator, initialValue, context) {
  return Promise.bind(context).thenReturn(this.models).reduce(iterator, initialValue).bind();
};

CollectionBase.prototype.fetch = function() {
  return Promise.rejected('The fetch method has not been implemented');
};

// Add a model, or list of models to the set.
CollectionBase.prototype.add = function(models, options) {
  return this.set(models, _.extend({merge: false}, options, addOptions));
};

// Remove a model, or a list of models from the set.
CollectionBase.prototype.remove = function(models, options) {
  var singular = !_.isArray(models);
  models = singular ? [models] : _.clone(models);
  options || (options = {});
  var i, l, index, model;
  for (i = 0, l = models.length; i < l; i++) {
    model = models[i] = this.get(models[i]);
    if (!model) continue;
    delete this._byId[model.id];
    delete this._byId[model.cid];
    index = this.indexOf(model);
    this.models.splice(index, 1);
    this.length--;
    if (!options.silent) {
      options.index = index;
      model.trigger('remove', model, this, options);
    }
    this._removeReference(model);
  }
  return singular ? models[0] : models;
};

// When you have more items than you want to add or remove individually,
// you can reset the entire set with a new list of models, without firing
// any granular `add` or `remove` events. Fires `reset` when finished.
// Useful for bulk operations and optimizations.
CollectionBase.prototype.reset = function(models, options) {
  options = options || {};
  for (var i = 0, l = this.models.length; i < l; i++) {
    this._removeReference(this.models[i]);
  }
  options.previousModels = this.models;
  this._reset();
  models = this.add(models, _.extend({silent: true}, options));
  if (!options.silent) this.trigger('reset', this, options);
  return models;
};

// Add a model to the end of the collection.
CollectionBase.prototype.push = function(model, options) {
  return this.add(model, _.extend({at: this.length}, options));
};

// Remove a model from the end of the collection.
CollectionBase.prototype.pop = function(options) {
  var model = this.at(this.length - 1);
  this.remove(model, options);
  return model;
};

// Add a model to the beginning of the collection.
CollectionBase.prototype.unshift = function(model, options) {
  return this.add(model, _.extend({at: 0}, options));
};

// Remove a model from the beginning of the collection.
CollectionBase.prototype.shift = function(options) {
  var model = this.at(0);
  this.remove(model, options);
  return model;
};

// Slice out a sub-array of models from the collection.
CollectionBase.prototype.slice = function() {
  return slice.apply(this.models, arguments);
};

// Get a model from the set by id.
CollectionBase.prototype.get = function(obj) {
  if (obj == null) return void 0;
  return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
};

// Get the model at the given index.
CollectionBase.prototype.at = function(index) {
  return this.models[index];
};

// Return models with matching attributes. Useful for simple cases of
// `filter`.
CollectionBase.prototype.where = function(attrs, first) {
  if (_.isEmpty(attrs)) return first ? void 0 : [];
  return this[first ? 'find' : 'filter'](function(model) {
    for (var key in attrs) {
      if (attrs[key] !== model.get(key)) return false;
    }
    return true;
  });
};

// Return the first model with matching attributes. Useful for simple cases
// of `find`.
CollectionBase.prototype.findWhere = function(attrs) {
  return this.where(attrs, true);
};

// Force the collection to re-sort itself, based on a comporator defined on the model.
CollectionBase.prototype.sort = function(options) {
  if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
  options || (options = {});

  // Run sort based on type of `comparator`.
  if (_.isString(this.comparator) || this.comparator.length === 1) {
    this.models = this.sortBy(this.comparator, this);
  } else {
    this.models.sort(_.bind(this.comparator, this));
  }

  if (!options.silent) this.trigger('sort', this, options);
  return this;
};

// Pluck an attribute from each model in the collection.
CollectionBase.prototype.pluck = function(attr) {
  return this.invoke('get', attr);
};

// Create a new instance of a model in this collection. Add the model to the
// collection immediately, unless `wait: true` is passed, in which case we
// wait for the server to agree.
CollectionBase.prototype.create = function(model, options) {
  options = options ? _.clone(options) : {};
  if (!(model = this._prepareModel(model, options))) return false;
  if (!options.wait) this.add(model, options);
  var collection = this;
  var success = options.success;
  options.success = function(model, resp, options) {
    if (options.wait) collection.add(model, options);
    if (success) success(model, resp, options);
  };
  model.save(null, options);
  return model;
};

// **parse** converts a response into a list of models to be added to the
// collection. The default implementation is just to pass it through.
CollectionBase.prototype.parse = function(resp, options) {
  return resp;
};

// Create a new collection with an identical list of models as this one.
CollectionBase.prototype.clone = function() {
  return new this.constructor(this.models);
};

// Private method to reset all internal state. Called when the collection
// is first initialized or reset.
CollectionBase.prototype._reset = function() {
  this.length = 0;
  this.models = [];
  this._byId  = Object.create(null);
};

// Internal method to sever a model's ties to a collection.
CollectionBase.prototype._removeReference = function(model) {
  // TODO: Sever from the internal model cache.
};

// Internal method called every time a model in the set fires an event.
// Sets need to update their indexes when models change ids. All other
// events simply proxy through. "add" and "remove" events that originate
// in other collections are ignored.
CollectionBase.prototype._onModelEvent = function(event, model, collection, options) {
  // TOOD: See if we need anything here.
};

// Underscore methods that we want to implement on the Collection.
// 90% of the core usefulness of Backbone Collections is actually implemented
// right here:
var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
  'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
  'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
  'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
  'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
  'lastIndexOf', 'isEmpty', 'chain'];

// Mix in each Underscore method as a proxy to `Collection#models`.
_.each(methods, function(method) {
  CollectionBase.prototype[method] = function() {
    var args = slice.call(arguments);
    args.unshift(this.models);
    return _[method].apply(_, args);
  };
});

// Underscore methods that take a property name as an argument.
var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

// Use attributes instead of properties.
_.each(attributeMethods, function(method) {
  CollectionBase.prototype[method] = function(value, context) {
    var iterator = _.isFunction(value) ? value : function(model) {
      return model.get(value);
    };
    return _[method](this.models, iterator, context);
  };
});


// List of attributes attached directly from the `options` passed to the constructor.
var modelProps = ['tableName', 'hasTimestamps'];

CollectionBase.extend = require('../extend');

module.exports = CollectionBase;
