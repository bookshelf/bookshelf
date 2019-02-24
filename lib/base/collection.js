// Base Collection
// ---------------
'use strict';

const _ = require('lodash');
const inherits = require('util').inherits;

const Events = require('./events');
const Promise = require('bluebird');
const ModelBase = require('./model');
const extend = require('../extend');

/**
 * @class CollectionBase
 * @extends Events
 * @inheritdoc
 */
function CollectionBase(models, options) {
  if (options) _.extend(this, _.pick(options, collectionProps));
  this._reset();
  this.initialize.apply(this, arguments);
  if (!_.isFunction(this.model)) {
    throw new Error('A valid `model` constructor must be defined for all collections.');
  }
  if (models) this.reset(models, _.extend({silent: true}, options));
}

/**
 * Registers an event listener.
 *
 * @method CollectionBase#on
 * @example
 * const ships = new bookshelf.Collection
 * ships.on('fetched', function(collection) {
 *   // Do something after the data has been fetched from the database
 * })
 * @see Events#on
 */

/**
 * @method CollectionBase#off
 * @example
 *
 * ships.off('fetched') // Remove the 'fetched' event listener
 *
 * @see Events#off
 */

/**
 * @method CollectionBase#trigger
 * @example
 *
 * ships.trigger('fetched')
 *
 * @see Events#trigger
 */
inherits(CollectionBase, Events);

// List of attributes attached directly from the constructor's options object.
//
// RE: 'relatedData'
// It's okay for two `Collection`s to share a `Relation` instance.
// `relatedData` does not mutate itself after declaration. This is only
// here because `clone` needs to duplicate this property. It should not
// be documented as a valid argument for consumer code.
//
// RE: 'attach', 'detach', 'updatePivot', 'withPivot', '_processPivot', '_processPlainPivot', '_processModelPivot'
// It's okay to whitelist also given method references to be copied when cloning
// a collection. These methods are present only when `relatedData` is present and
// its `type` is 'belongsToMany'. So it is safe to put them in the list and use them
// without any additional verification.
// These should not be documented as a valid arguments for consumer code.
const collectionProps = [
  'model',
  'comparator',
  'relatedData',
  // `belongsToMany` pivotal collection properties
  'attach',
  'detach',
  'updatePivot',
  'withPivot',
  '_processPivot',
  '_processPlainPivot',
  '_processModelPivot'
];

// Copied over from Backbone.
const setOptions = {add: true, remove: true, merge: true};
const addOptions = {add: true, remove: false};

/**
 * @member {Number}
 * @default 0
 * @description
 *
 * This is the total number of models in the collection. Note that this may not represent how many
 * models there are in total in the database.
 *
 * @example
 *
 * var vanHalen = new bookshelf.Collection([eddie, alex, stone, roth]);
 * console.log(vanHalen.length) // 4
 */
CollectionBase.prototype.length = 0;

/**
 * @method CollectionBase#initialize
 * @description
 * Called by the {@link Collection Collection constructor} when creating a new instance.
 * Override this function to add custom initialization, such as event listeners.
 * Because plugins may override this method in subclasses, make sure to call
 * your super (extended) class. e.g.
 *
 *     initialize: function() {
 *       this.constructor.__super__.initialize.apply(this, arguments);
 *       // Your initialization code ...
 *     }
 *
 * @see Collection
 */
CollectionBase.prototype.initialize = function() {};

/**
 * @method
 * @private
 * @description
 * The `tableName` on the associated Model, used in relation building.
 * @returns {string} The {@link Model#tableName tableName} of the associated model.
 */
CollectionBase.prototype.tableName = function() {
  return _.result(this.model.prototype, 'tableName');
};

/**
 * @method
 * @private
 * @description
 * The `idAttribute` on the associated Model, used in relation building.
 * @returns {string} The {@link Model#idAttribute idAttribute} of the associated model.
 */
CollectionBase.prototype.idAttribute = function() {
  return this.model.prototype.idAttribute;
};

/**
 * @method
 * @private
 * @description
 * When keying a collection by ID, ensure that it is safe to use as a key
 * @param {any} id
 * @return {string|number} The id safe for using as a key in a collection
 */
CollectionBase.prototype.idKey = function(id) {
  return _.isBuffer(id) ? id.toString('hex') : id;
};

CollectionBase.prototype.toString = function() {
  return '[Object Collection]';
};

/**
 * @method
 * @description
 *
 * Return a raw array of the collection's {@link Model#attributes
 * attributes} for JSON stringification. If the {@link Model models} have any
 * relations defined, this will also call {@link Model#toJSON toJSON} on
 * each of the related objects, and include them on the object unless
 * `{shallow: true}` is passed as an option.
 *
 * `serialize` is called internally by {@link Collection#toJSON toJSON}.
 * Override this function if you want to customize its output.
 *
 * @param {Object=} options
 * @param {Boolean}    [options.shallow=false]   Exclude relations.
 * @param {Boolean}    [options.omitPivot=false] Exclude pivot values.
 * @param {Boolean}    [options.omitNew=false]   Exclude models that return true for isNew.
 * @returns {Object} Serialized model as a plain object.
 */
CollectionBase.prototype.serialize = function(options) {
  return this.invokeMap('toJSON', options).filter(_.negate(_.isNull));
};

/**
 * @method
 * @description
 *
 * Called automatically by {@link
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior
 * `JSON.stringify`}. To customize serialization, override {@link
 * Collection#serialize serialize}.
 *
 * @param {options} Options passed to {@link Collection#serialize}.
 */
CollectionBase.prototype.toJSON = function(options) {
  return this.serialize(options);
};

/**
 * @method
 * @description
 *
 * The set method performs a smart update of the collection with the passed
 * model or list of models by following the following rules:
 * - If a model in the list isn't yet in the collection it will be added
 * - if the model is already in the collection its attributes will be merged
 * - if the collection contains any models that aren't present in the list,
 * they'll be removed.
 *
 * If you'd like to customize the behavior, you can do so with the `add`,
 * `merge` and `remove` options.
 *
 * Since version 0.14.0 if both `remove` and `merge` options are set to
 * `false`, then any duplicate models present will be added to the collection,
 * otherwise they will either be removed or merged, according to the chosen
 * option.
 *
 * @example
 *
 * var vanHalen = new bookshelf.Collection([eddie, alex, stone, roth]);
 * vanHalen.set([eddie, alex, stone, hagar]);
 *
 * @param {Object[]|Model[]|Object|Model} models One or more models or raw
 * attribute objects.
 * @param {Object=} options
 *   Options for controlling how models are added or removed.
 * @param {Boolean=} options.add=true
 *   If set to `true` it will add any new models to the collection, otherwise
 *   any new models will be ignored.
 * @param {Boolean=} options.merge=true
 *   If set to `true` it will merge the attributes of duplicate models with the
 *   attributes of existing models in the collection, otherwise duplicate
 *   models in the list will be ignored.
 * @param {Boolean=} options.remove=true
 *   If set to `true` any models in the collection that are not in the list
 *   will be removed from the collection, otherwise they will be kept.
 * @returns {Collection} Self, this method is chainable.
 */
CollectionBase.prototype.set = function(models, options) {
  options = _.defaults({}, options, setOptions);
  if (!Array.isArray(models)) models = models ? [models] : [];
  if (options.parse) models = this.parse(models, options);
  let i, l, id, model, attrs;
  const at = options.at;
  const targetModel = this.model;
  const toAdd = [];
  const toRemove = [];
  const modelMap = {};
  let order = options.add && options.remove ? [] : false;

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
    const existing = this.get(id);
    if (existing && (options.merge || options.remove)) {
      if (options.remove) {
        modelMap[existing.cid] = true;
      }
      if (options.merge) {
        attrs = attrs === model ? model.attributes : attrs;
        if (options.parse) attrs = existing.parse(attrs, options);
        existing.set(attrs, options);
      }

      // This is a new model, push it to the `toAdd` list.
    } else if (options.add) {
      if (!(model = this._prepareModel(attrs, options))) continue;
      toAdd.push(model);
      this._byId[this.idKey(model.cid)] = model;
      if (model.id != null) this._byId[this.idKey(model.id)] = model;
    }

    if (order && !(existing && order.indexOf(existing) > -1)) order.push(existing || model);
  }

  // Remove nonexistent models if appropriate.
  if (options.remove) {
    for (i = 0, l = this.length; i < l; ++i) {
      if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
    }
    if (toRemove.length) this.remove(toRemove, options);
  }

  // See if sorting is needed, update `length` and splice in new models.
  if (toAdd.length || (order && order.length)) {
    this.length += toAdd.length;
    if (at != null) {
      Array.prototype.splice.apply(this.models, [at, 0].concat(toAdd));
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

/**
 * @method
 * @private
 * @description
 * Prepare a model or hash of attributes to be added to this collection.
 */
CollectionBase.prototype._prepareModel = function(attrs, options) {
  if (attrs instanceof ModelBase) return attrs;
  return new this.model(attrs, options);
};

/**
 * @method
 * @private
 * @description
 * Run "Promise.map" over the models
 */
CollectionBase.prototype.mapThen = function(iterator, context) {
  return Promise.bind(context)
    .thenReturn(this.models)
    .map(iterator);
};

/**
 * @method
 * @description
 * Shortcut for calling `Promise.all` around a {@link Collection#invoke}, this
 * will delegate to the collection's `invoke` method, resolving the promise with
 * an array of responses all async (and sync) behavior has settled. Useful for
 * bulk saving or deleting models:
 *
 *     collection.invokeThen('save', null, options).then(function() {
 *       // ... all models in the collection have been saved
 *     });
 *
 *     collection.invokeThen('destroy', options).then(function() {
 *       // ... all models in the collection have been destroyed
 *     });
 *
 * @param {string} method The {@link Model model} method to invoke.
 * @param {...mixed} arguments Arguments to `method`.
 * @returns {Promise<mixed[]>}
 *   Promise resolving to array of results from invocation.
 */
CollectionBase.prototype.invokeThen = function() {
  return Promise.all(this.invokeMap.apply(this, arguments));
};

/**
 * This iterator is used by the reduceThen method to ietrate over all models in the collection.
 *
 * @callback Collection~reduceThenIterator
 * @param {mixed} acumulator
 * @param {Model} model The current model being iterated over.
 * @param {Number} index
 * @param {Number} length Total number of models being iterated over.
 */

/**
 * @method
 * @description
 * Iterate over all the models in the collection and reduce this array to a single value using the
 * given iterator function.
 * @see {@link http://bluebirdjs.com/docs/api/promise.reduce.html|Bluebird `Promise.reduce` reference}.
 * @param {Collection~reduceThenIterator} iterator
 * @param {mixed} initialValue
 * @param {Object} context Bound to `this` in the `iterator` callback.
 * @returns {Promise<mixed>}
 *   Promise resolving to the single result from the reduction.
 *
 */
CollectionBase.prototype.reduceThen = function(iterator, initialValue, context) {
  return Promise.bind(context)
    .thenReturn(this.models)
    .reduce(iterator, initialValue)
    .bind();
};

CollectionBase.prototype.fetch = function() {
  return Promise.rejected('The fetch method has not been implemented');
};

/**
 * @method
 * @description
 *
 * Add a {@link Model model}, or an array of models, to the collection. You may
 * also pass raw attribute objects, which will be converted to proper models
 * when being added to the collection.
 *
 * You can pass the `{at: index}` option to splice the model into the
 * collection at the specified `index`.
 *
 * By default if you're adding models to the collection that are already
 * present, they'll be ignored, unless you pass `{merge: true}`, in
 * which case their {@link Model#attributes attributes} will be merged with the
 * corresponding models.
 *
 * @example
 *
 * const ships = new bookshelf.Collection;
 *
 * ships.add([
 *   {name: "Flying Dutchman"},
 *   {name: "Black Pearl"}
 * ]);
 *
 * @param {Object[]|Model[]|Object|Model} models
 *   One or more models or raw attribute objects.
 * @param {Object=} options Options for controlling how models are added.
 * @param {Boolean=} options.merge=false
 *   If set to `true` it will merge the attributes of duplicate models with the
 *   attributes of existing models in the collection.
 * @param {Number=} options.at
 *   If set to a number equal to or greater than 0 it will splice the model
 *   into the collection at the specified index number.
 * @returns {Collection} Self, this method is chainable.
 */
CollectionBase.prototype.add = function(models, options) {
  return this.set(models, Object.assign({merge: false}, options, addOptions));
};

/**
 * Remove a {@link Model model}, or an array of models, from the collection. Note that this does not remove the affected
 * models from the database. For that purpose you have to use the model's {@link Model#destroy destroy} method.
 *
 * If you wish to actually remove all the models in a collection from the database you can use this method:
 *
 *     myCollection.invokeThen('destroy').then(() => {
 *       // models have been destroyed
 *     })
 *
 * @param {Model|Model[]} models The model, or models, to be removed.
 * @param {Object} [options] Set of options for the operation.
 * @param {Boolean} [options.silent] If set to `true` will not trigger a `remove` event on the removed model.
 * @returns {Model|Model[]} The same value passed in the `models` argument.
 */
CollectionBase.prototype.remove = function(models, options) {
  const singular = !Array.isArray(models);
  models = singular ? [models] : _.clone(models);
  options = options || {};
  for (let i = 0; i < models.length; i++) {
    const model = (models[i] = this.get(models[i]));
    if (!model) continue;
    delete this._byId[this.idKey(model.id)];
    delete this._byId[model.cid];
    const index = this.indexOf(model);
    this.models.splice(index, 1);
    this.length = this.length - 1;
    if (!options.silent) {
      options.index = index;
      model.trigger('remove', model, this, options);
    }
  }
  return singular ? models[0] : models;
};

/**
 * @method
 * @description
 *
 * Adding and removing models one at a time is all well and good, but sometimes
 * you have so many models to change that you'd rather just update the
 * collection in bulk. Use `reset` to replace a collection with a new list of
 * models (or attribute hashes). Calling `collection.reset()` without passing
 * any models as arguments will empty the entire collection.
 *
 * @param {Object[]|Model[]|Object|Model} models One or more models or raw
 * attribute objects.
 * @param {Object} options See {@link Collection#add add}.
 * @returns {Model[]} Array of models.
 */
CollectionBase.prototype.reset = function(models, options) {
  options = options || {};
  options.previousModels = this.models;
  this._reset();
  models = this.set(models, Object.assign({silent: true}, options));
  if (!options.silent) this.trigger('reset', this, options);
  return models;
};

/**
 * @method
 * @description
 * Add a model to the end of the collection.
 * @param {Object[]|Model[]|Object|Model} model One or more models or raw
 * attribute objects.
 * @returns {Collection} Self, this method is chainable.
 */
CollectionBase.prototype.push = function(model, options) {
  return this.add(model, _.extend({at: this.length}, options));
};

/**
 * @method
 * @description
 * Remove a model from the end of the collection.
 */
CollectionBase.prototype.pop = function(options) {
  const model = this.at(this.length - 1);
  this.remove(model, options);
  return model;
};

/**
 * @method
 * @description
 * Add a model to the beginning of the collection.
 */
CollectionBase.prototype.unshift = function(model, options) {
  return this.add(model, _.extend({at: 0}, options));
};

/**
 * @method
 * @description
 * Remove a model from the beginning of the collection.
 */
CollectionBase.prototype.shift = function(options) {
  const model = this.at(0);
  this.remove(model, options);
  return model;
};

/**
 * @method
 * @description
 * Slice out a sub-array of models from the collection.
 */
CollectionBase.prototype.slice = function() {
  return Array.prototype.slice.apply(this.models, arguments);
};

/**
 * @method
 * @description
 *
 * Get a model from a collection, specified by an {@link Model#id id}, a {@link
 * Model#cid cid}, or by passing in a {@link Model model}.
 *
 * @example
 *
 * const book = library.get(110);
 *
 * @returns {Model} The model, or `undefined` if it is not in the collection.
 */
CollectionBase.prototype.get = function(obj) {
  if (obj == null) return void 0;
  return this._byId[this.idKey(obj.id)] || this._byId[obj.cid] || this._byId[this.idKey(obj)];
};

/**
 * @method
 * @description
 * Get a model from a collection, specified by index. Useful if your collection
 * is sorted, and if your collection isn't sorted, `at` will still retrieve
 * models in insertion order.
 */
CollectionBase.prototype.at = function(index) {
  return this.models[index];
};

/**
 * @method
 * @description
 * Return models with matching attributes. Useful for simple cases of `filter`.
 * @returns {Model[]} Array of matching models.
 */
CollectionBase.prototype.where = function(attrs, first) {
  if (_.isEmpty(attrs)) return first ? void 0 : [];
  return this[first ? 'find' : 'filter'](function(model) {
    for (const key in attrs) {
      if (attrs[key] !== model.get(key)) return false;
    }
    return true;
  });
};

/**
 * @method
 * @description
 * Return the first model with matching attributes. Useful for simple cases of
 * `find`.
 * @returns {Model} The first matching model.
 */
CollectionBase.prototype.findWhere = function(attrs) {
  return this.where(attrs, true);
};

/**
 * @method
 * @private
 * @description
 * Force the collection to re-sort itself, based on a comporator defined on the model.
 */
CollectionBase.prototype.sort = function(options) {
  if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
  options = options || {};

  // Run sort based on type of `comparator`.
  if (_.isString(this.comparator) || this.comparator.length === 1) {
    this.models = this.sortBy(this.comparator, this);
  } else {
    this.models.sort(_.bind(this.comparator, this));
  }

  if (!options.silent) this.trigger('sort', this, options);
  return this;
};

/**
 * @method
 * @description
 * Pluck an attribute from each model in the collection.
 * @returns {mixed[]} An array of attribute values.
 */
CollectionBase.prototype.pluck = function(attr) {
  return this.invokeMap('get', attr);
};

/**
 * @method
 * @description
 * The `parse` method is called whenever a collection's data is returned in a
 * {@link Collection#fetch fetch} call. The function is passed the raw
 * database `response` array, and should return an array to be set on the
 * collection. The default implementation is a no-op, simply passing through
 * the JSON response.
 *
 * @param {Object[]} resp Raw database response array.
 */
CollectionBase.prototype.parse = function(resp) {
  return resp;
};

/**
 * @method
 * @description
 * Create a new collection with an identical list of models as this one.
 */
CollectionBase.prototype.clone = function() {
  // Iterate over the selected list of collection properties and invoke `clone` for
  // each property that has a method for that porpose.
  const clonedProps = _(this)
    .pick(collectionProps)
    .mapValues((val) => {
      return val && typeof val.clone === 'function' ? val.clone() : val;
    })
    .value();
  return new this.constructor(this.models, clonedProps);
};

/**
 * @method
 * @private
 * @description
 * Reset all internal state. Called when the collection is first initialized or reset.
 */
CollectionBase.prototype._reset = function() {
  this.length = 0;
  this.models = [];
  this._byId = Object.create(null);
};

// Make collection iterable in for of loops
CollectionBase.prototype[Symbol.iterator] = function*() {
  yield* this.models;
};

/**
 * @method CollectionBase#forEach
 * @see http://lodash.com/docs/#forEach
 */
/**
 * @method CollectionBase#each
 * @see http://lodash.com/docs/#each
 */
/**
 * @method CollectionBase#map
 * @see http://lodash.com/docs/#map
 */
/**
 * @method CollectionBase#reduce
 * @see http://lodash.com/docs/#reduce
 */
/**
 * @method CollectionBase#reduceRight
 * @see http://lodash.com/docs/#reduceRight
 */
/**
 * @method CollectionBase#find
 * @see http://lodash.com/docs/#find
 */
/**
 * @method CollectionBase#filter
 * @see http://lodash.com/docs/#filter
 */
/**
 * @method CollectionBase#reject
 * @see http://lodash.com/docs/#reject
 */
/**
 * @method CollectionBase#every
 * @see http://lodash.com/docs/#every
 */
/**
 * @method CollectionBase#some
 * @see http://lodash.com/docs/#some
 */
/**
 * @method CollectionBase#includes
 * @see http://lodash.com/docs/#includes
 */
/**
 * @method CollectionBase#invokeMap
 * @see http://lodash.com/docs/#invokeMap
 */
/**
 * @method CollectionBase#max
 * @see http://lodash.com/docs/#max
 */
/**
 * @method CollectionBase#maxBy
 * @see http://lodash.com/docs/#maxBy
 */
/**
 * @method CollectionBase#min
 * @see http://lodash.com/docs/#min
 */
/**
 * @method CollectionBase#minBy
 * @see http://lodash.com/docs/#minBy
 */
/**
 * @method CollectionBase#toArray
 * @see http://lodash.com/docs/#toArray
 */
/**
 * @method CollectionBase#size
 * @see http://lodash.com/docs/#size
 */
/**
 * @method CollectionBase#first
 * @see http://lodash.com/docs/#first
 */
/**
 * @method CollectionBase#head
 * @see http://lodash.com/docs/#head
 */
/**
 * @method CollectionBase#take
 * @see http://lodash.com/docs/#take
 */
/**
 * @method CollectionBase#initial
 * @see http://lodash.com/docs/#initial
 */
/**
 * @method CollectionBase#tail
 * @see http://lodash.com/docs/#tail
 */
/**
 * @method CollectionBase#drop
 * @see http://lodash.com/docs/#drop
 */
/**
 * @method CollectionBase#last
 * @see http://lodash.com/docs/#last
 */
/**
 * @method CollectionBase#without
 * @see http://lodash.com/docs/#without
 */
/**
 * @method CollectionBase#difference
 * @see http://lodash.com/docs/#difference
 */
/**
 * @method CollectionBase#indexOf
 * @see http://lodash.com/docs/#indexOf
 */
/**
 * @method CollectionBase#shuffle
 * @see http://lodash.com/docs/#shuffle
 */
/**
 * @method CollectionBase#lastIndexOf
 * @see http://lodash.com/docs/#lastIndexOf
 */
/**
 * @method CollectionBase#isEmpty
 * @see http://lodash.com/docs/#isEmpty
 */
/**
 * @method CollectionBase#chain
 * @see http://lodash.com/docs/#chain
 */
// Lodash methods that we want to implement on the Collection.
// 90% of the core usefulness of Backbone Collections is actually implemented
// right here:
const methods = [
  'forEach',
  'each',
  'map',
  'reduce',
  'reduceRight',
  'find',
  'filter',
  'every',
  'some',
  'includes',
  'invokeMap',
  'max',
  'min',
  'maxBy',
  'minBy',
  'toArray',
  'size',
  'first',
  'head',
  'take',
  'initial',
  'tail',
  'drop',
  'last',
  'without',
  'difference',
  'indexOf',
  'shuffle',
  'lastIndexOf',
  'isEmpty',
  'chain'
];

// Mix in each Lodash method as a proxy to `Collection#models`.
_.each(methods, function(method) {
  CollectionBase.prototype[method] = function() {
    return _[method].apply(_, [this.models].concat(Array.from(arguments)));
  };
});

/**
 * @method CollectionBase#groupBy
 * @see http://lodash.com/docs/#groupBy
 */
// Underscore methods that we want to implement on the Collection.
/**
 * @method CollectionBase#countBy
 * @see http://lodash.com/docs/#countBy
 */
// Underscore methods that we want to implement on the Collection.
/**
 * @method CollectionBase#sortBy
 * @see http://lodash.com/docs/#sortBy
 */
// Lodash methods that take a property name as an argument.
const attributeMethods = ['groupBy', 'countBy', 'sortBy'];

// Use attributes instead of properties.
_.each(attributeMethods, function(method) {
  CollectionBase.prototype[method] = function(value, context) {
    const iterator = _.isFunction(value)
      ? value
      : function(model) {
          return model.get(value);
        };
    return _[method](this.models, _.bind(iterator, context));
  };
});

/**
 * @method Collection.extend
 * @description
 *
 * To create a {@link Collection} class of your own, extend
 * `Bookshelf.Collection`.
 *
 * @param {Object=} prototypeProperties
 *   Instance methods and properties to be attached to instances of the new
 *   class.
 * @param {Object=} classProperties
 *   Class (ie. static) functions and properties to be attached to the
 *   constructor of the new class.
 * @returns {Function} Constructor for new `Collection` subclass.
 */
CollectionBase.extend = extend;

module.exports = CollectionBase;
