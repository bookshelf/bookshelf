!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Bookshelf=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// Bookshelf.js 0.7.7
// ---------------

//     (c) 2013 Tim Griesser
//     Bookshelf may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://bookshelfjs.org

var Bookshelf = function() {
  return Bookshelf.initialize.apply(null, arguments);
};

// Constructor for a new `Bookshelf` object, it accepts
// an active `knex` instance and initializes the appropriate
// `Model` and `Collection` constructors for use in the current instance.
Bookshelf.initialize = function(knex) {
  var bookshelf  = {
    VERSION: '0.7.7'
  };

  var _          = _dereq_('lodash');
  var inherits   = _dereq_('inherits');
  var semver     = _dereq_('semver');

  // We've supplemented `Events` with a `triggerThen`
  // method to allow for asynchronous event handling via promises. We also
  // mix this into the prototypes of the main objects in the library.
  var Events = _dereq_('./lib/base/events');

  // All core modules required for the bookshelf instance.
  var BookshelfModel      = _dereq_('./lib/model');
  var BookshelfCollection = _dereq_('./lib/collection');
  var BookshelfRelation   = _dereq_('./lib/relation');
  var Errors              = _dereq_('./lib/errors');

  // If the knex isn't a `Knex` instance, we'll assume it's
  // a compatible config object and pass it through to create a new instance.
  // This behavior is now deprecated.
  if (_.isPlainObject(knex)) {
    console.warn('Initializing Bookshelf with a config object is deprecated, please pass an initialized knex.js instance.');
    knex = _dereq_('knex')(knex);
  }

  var range = '>=0.6.10';
  if (!semver.satisfies(knex.VERSION, range)) {
    throw new Error('The knex version is ' + knex.VERSION + ' which does not satisfy the Bookshelf\'s requirement ' + range);
  }

  var Model = bookshelf.Model = function() {
    BookshelfModel.apply(this, arguments);
  };
  var Collection = bookshelf.Collection = function() {
    BookshelfCollection.apply(this, arguments);
  };
  inherits(Model, BookshelfModel);
  inherits(Collection, BookshelfCollection);

  _.extend(Model, BookshelfModel);
  _.extend(Collection, BookshelfCollection);

  Model.prototype._builder =
  Collection.prototype._builder = function(tableName) {
    var builder  = knex(tableName);
    var instance = this;
    return builder.on('query', function(data) {
      instance.trigger('query', data);
    });
  };

  // The collection also references the correct `Model`, specified above, for creating
  // new `Model` instances in the collection.
  Collection.prototype.model = Model;
  Model.prototype.Collection = Collection;

  function Relation() {
    BookshelfRelation.apply(this, arguments);
  }
  inherits(Relation, BookshelfRelation);
  Relation.prototype.Model = Model;
  Relation.prototype.Collection = Collection;

  // The `Model` constructor is referenced as a property on the `Bookshelf` instance,
  // mixing in the correct `builder` method, as well as the `relation` method,
  // passing in the correct `Model` & `Collection` constructors for later reference.
  Model.prototype._relation = function(type, Target, options) {
    if (type !== 'morphTo' && !_.isFunction(Target)) {
      throw new Error('A valid target model must be defined for the ' +
        _.result(this, 'tableName') + ' ' + type + ' relation');
    }
    return new Relation(type, Target, options);
  };

  // Shortcut for creating a new collection with the current collection.
  Model.collection = function(rows, options) {
    return new Collection((rows || []), _.extend({}, options, {model: this}));
  };

  // A `Bookshelf` instance may be used as a top-level pub-sub bus, as it mixes in the
  // `Events` object. It also contains the version number, and a `Transaction` method
  // referencing the correct version of `knex` passed into the object.
  _.extend(bookshelf, Events, Errors, {

    // Helper method to wrap a series of Bookshelf actions in a `knex` transaction block;
    transaction: function() {
      return this.knex.transaction.apply(this, arguments);
    },

    // Provides a nice, tested, standardized way of adding plugins to a `Bookshelf` instance,
    // injecting the current instance into the plugin, which should be a module.exports.
    plugin: function(plugin, options) {
      if (_.isString(plugin)) {
        try {
          _dereq_('./plugins/' + plugin)(this, options);
        } catch (e) {
          _dereq_(plugin)(this, options);
        }
      } else if (_.isArray(plugin)) {
        _.each(plugin, function (plugin) {
          this.plugin(plugin, options);
        }, this);
      } else {
        plugin(this, options);
      }
      return this;
    }

  });

  // Grab a reference to the `knex` instance passed (or created) in this constructor,
  // for convenience.
  bookshelf.knex = knex;

  // The `forge` function properly instantiates a new Model or Collection
  // without needing the `new` operator... to make object creation cleaner
  // and more chainable.
  Model.forge = Collection.forge = function() {
    var inst = Object.create(this.prototype);
    var obj = this.apply(inst, arguments);
    return (Object(obj) === obj ? obj : inst);
  };

  // Attach `where`, `query`, and `fetchAll` as static methods.
  ['where', 'query'].forEach(function(method) {
    Model[method] =
    Collection[method] = function() {
      var model = this.forge();
      return model[method].apply(model, arguments);
    };
  });
  Model.fetchAll = function(options) { return this.forge().fetchAll(options); };

  Model.extend = Collection.extend = _dereq_('simple-extend');

  return bookshelf;
};

// Finally, export `Bookshelf` to the world.
module.exports = Bookshelf;
},{"./lib/base/events":4,"./lib/collection":8,"./lib/errors":10,"./lib/model":12,"./lib/relation":13,"inherits":"oxw+vU","knex":"+7L5HO","lodash":"K2RcUv","semver":"OpuoOF","simple-extend":"vZYVcT"}],2:[function(_dereq_,module,exports){
// Base Collection
// ---------------

// All exernal dependencies required in this scope.
var _         = _dereq_('lodash');
var Backbone  = _dereq_('backbone');

// All components that need to be referenced in this scope.
var Events    = _dereq_('./events');
var Promise   = _dereq_('./promise');
var ModelBase = _dereq_('./model');

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

CollectionBase.extend = _dereq_('simple-extend');

module.exports = CollectionBase;

},{"./events":4,"./model":5,"./promise":6,"backbone":"5kFNoY","lodash":"K2RcUv","simple-extend":"vZYVcT"}],3:[function(_dereq_,module,exports){
// Eager Base
// ---------------

// The EagerBase provides a scaffold for handling with eager relation
// pairing, by queueing the appropriate related method calls with
// a database specific `eagerFetch` method, which then may utilize
// `pushModels` for pairing the models depending on the database need.

var _         = _dereq_('lodash');
var Backbone  = _dereq_('backbone');
var Promise   = _dereq_('./promise');

function EagerBase(parent, parentResponse, target) {
  this.parent = parent;
  this.parentResponse = parentResponse;
  this.target = target;
}

_.extend(EagerBase.prototype, {

  // This helper function is used internally to determine which relations
  // are necessary for fetching based on the `model.load` or `withRelated` option.
  fetch: Promise.method(function(options) {
    var relationName, related, relation;
    var target      = this.target;
    var handled     = this.handled = {};
    var withRelated = this.prepWithRelated(options.withRelated);
    var subRelated  = {};

    // Internal flag to determine whether to set the ctor(s) on the `Relation` object.
    target._isEager = true;

    // Eager load each of the `withRelated` relation item, splitting on '.'
    // which indicates a nested eager load.
    for (var key in withRelated) {

      related = key.split('.');
      relationName = related[0];

      // Add additional eager items to an array, to load at the next level in the query.
      if (related.length > 1) {
        var relatedObj = {};
        subRelated[relationName] || (subRelated[relationName] = []);
        relatedObj[related.slice(1).join('.')] = withRelated[key];
        subRelated[relationName].push(relatedObj);
      }

      // Only allow one of a certain nested type per-level.
      if (handled[relationName]) continue;

      relation = target[relationName]();

      if (!relation) throw new Error(relationName + ' is not defined on the model.');

      handled[relationName] = relation;
    }

    // Delete the internal flag from the model.
    delete target._isEager;

    // Fetch all eager loaded models, loading them onto
    // an array of pending deferred objects, which will handle
    // all necessary pairing with parent objects, etc.
    var pendingDeferred = [];
    for (relationName in handled) {
      pendingDeferred.push(this.eagerFetch(relationName, handled[relationName], _.extend({}, options, {
        isEager: true,
        withRelated: subRelated[relationName],
        beforeFn: withRelated[relationName] || noop
      })));
    }

    // Return a deferred handler for all of the nested object sync
    // returning the original response when these syncs & pairings are complete.
    return Promise.all(pendingDeferred).yield(this.parentResponse);
  }),

  // Prep the `withRelated` object, to normalize into an object where each
  // has a function that is called when running the query.
  prepWithRelated: function(withRelated) {
    if (!_.isArray(withRelated)) withRelated = [withRelated];
    var obj = {};
    for (var i = 0, l = withRelated.length; i < l; i++) {
      var related = withRelated[i];
      _.isString(related) ? obj[related] = noop : _.extend(obj, related);
    }
    return obj;
  },

  // Pushes each of the incoming models onto a new `related` array,
  // which is used to correcly pair additional nested relations.
  pushModels: function(relationName, handled, resp) {
    var models      = this.parent;
    var relatedData = handled.relatedData;
    var related     = [];
    for (var i = 0, l = resp.length; i < l; i++) {
      related.push(relatedData.createModel(resp[i]));
    }
    return relatedData.eagerPair(relationName, related, models);
  }

});

var noop = function() {};

module.exports = EagerBase;
},{"./promise":6,"backbone":"5kFNoY","lodash":"K2RcUv"}],4:[function(_dereq_,module,exports){
// Events
// ---------------

var Promise     = _dereq_('./promise');
var Backbone    = _dereq_('backbone');
var triggerThen = _dereq_('trigger-then');

// Mixin the `triggerThen` function into all relevant Backbone objects,
// so we can have event driven async validations, functions, etc.
triggerThen(Backbone, Promise);

module.exports = Backbone.Events;
},{"./promise":6,"backbone":"5kFNoY","trigger-then":"LriLt6"}],5:[function(_dereq_,module,exports){
// Base Model
// ---------------
var _        = _dereq_('lodash');
var Backbone = _dereq_('backbone');

var Events   = _dereq_('./events');
var Promise  = _dereq_('./promise');

// A list of properties that are omitted from the `Backbone.Model.prototype`, to create
// a generic model base.
var modelOmitted = [
  'changedAttributes', 'isValid', 'validationError',
  'save', 'sync', 'fetch', 'destroy', 'url',
  'urlRoot', '_validate'
];

// List of attributes attached directly from the `options` passed to the constructor.
var modelProps = ['tableName', 'hasTimestamps'];

// The "ModelBase" is similar to the 'Active Model' in Rails,
// it defines a standard interface from which other objects may
// inherit.
var ModelBase = function(attributes, options) {
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
};

_.extend(ModelBase.prototype, _.omit(Backbone.Model.prototype, modelOmitted), Events, {

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

  // Returns an object containing a shallow copy of the model attributes,
  // along with the `toJSON` value of any relations,
  // unless `{shallow: true}` is passed in the `options`.
  // Also includes _pivot_ keys for relations unless `{omitPivot: true}` 
  // is passed in `options`.
  toJSON: function(options) {
    var attrs = _.extend({}, this.attributes);
    if (options && options.shallow) return attrs;
    var relations = this.relations;
    for (var key in relations) {
      var relation = relations[key];
      attrs[key] = relation.toJSON ? relation.toJSON(options) : relation;
    }
    if (options && options.omitPivot) return attrs;
    if (this.pivot) {
      var pivot = this.pivot.attributes;
      for (key in pivot) {
        attrs['_pivot_' + key] = pivot[key];
      }
    }
    return attrs;
  },

  // **parse** converts a response into the hash of attributes to be `set` on
  // the model. The default implementation is just to pass the response along.
  parse: function(resp, options) {
    return resp;
  },

  // **format** converts a model into the values that should be saved into
  // the database table. The default implementation is just to pass the data along.
  format: function(attrs, options) {
    return attrs;
  },

  // Returns the related item, or creates a new
  // related item by creating a new model or collection.
  related: function(name) {
    return this.relations[name] || (this[name] ? this.relations[name] = this[name]() : void 0);
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

  // Sets the timestamps before saving the model.
  timestamp: function(options) {
    var d = new Date();
    var keys = (_.isArray(this.hasTimestamps) ? this.hasTimestamps : ['created_at', 'updated_at']);
    var vals = {};
    if (keys[1]) vals[keys[1]] = d;
    if (this.isNew(options) && keys[0] && (!options || options.method !== 'update')) vals[keys[0]] = d;
    return vals;
  },

  // Called after a `sync` action (save, fetch, delete) -
  // resets the `_previousAttributes` and `changed` hash for the model.
  _reset: function() {
    this._previousAttributes = _.extend(Object.create(null), this.attributes);
    this.changed = Object.create(null);
    return this;
  },

  fetch: function() {},

  save: function() {},

  // Destroy a model, calling a "delete" based on its `idAttribute`.
  // A "destroying" and "destroyed" are triggered on the model before
  // and after the model is destroyed, respectively. If an error is thrown
  // during the "destroying" event, the model will not be destroyed.
  destroy: Promise.method(function(options) {
    options = options ? _.clone(options) : {};
    var sync = this.sync(options);
    options.query = sync.query;
    return Promise.bind(this).then(function() {
      return this.triggerThen('destroying', this, options);
    }).then(function() {
      return sync.del();
    }).then(function(resp) {
      this.clear();
      return this.triggerThen('destroyed', this, resp, options);
    }).then(this._reset);
  })

});

ModelBase.extend = _dereq_('simple-extend');

module.exports = ModelBase;

},{"./events":4,"./promise":6,"backbone":"5kFNoY","lodash":"K2RcUv","simple-extend":"vZYVcT"}],6:[function(_dereq_,module,exports){
var Promise = _dereq_('bluebird');

Promise.prototype.yield = Promise.prototype.return;
Promise.prototype.ensure = Promise.prototype.lastly;
Promise.prototype.otherwise = Promise.prototype.caught;
Promise.prototype.exec = Promise.prototype.nodeify;

Promise.resolve = Promise.fulfilled;
Promise.reject  = Promise.rejected;

module.exports = Promise;
},{"bluebird":"EjIH/G"}],7:[function(_dereq_,module,exports){
// Base Relation
// ---------------

var _              = _dereq_('lodash');
var Backbone       = _dereq_('backbone');
var CollectionBase = _dereq_('./collection');

// Used internally, the `Relation` helps in simplifying the relationship building,
// centralizing all logic dealing with type & option handling.
function RelationBase(type, Target, options) {
  this.type = type;
  if (this.target = Target) {
    this.targetTableName   = _.result(Target.prototype, 'tableName');
    this.targetIdAttribute = _.result(Target.prototype, 'idAttribute');
  }
  _.extend(this, options);
}

_.extend(RelationBase.prototype, {

  // Creates a new relation instance, used by the `Eager` relation in
  // dealing with `morphTo` cases, where the same relation is targeting multiple models.
  instance: function(type, Target, options) {
    return new this.constructor(type, Target, options);
  },

  // Creates a new, unparsed model, used internally in the eager fetch helper
  // methods. (Parsing may mutate information necessary for eager pairing.)
  createModel: function(data) {
    if (this.target.prototype instanceof CollectionBase) {
      return new this.target.prototype.model(data)._reset();
    }
    return new this.target(data)._reset();
  },

  // Eager pair the models.
  eagerPair: function() {}

});

RelationBase.extend = Backbone.Model.extend;

module.exports = RelationBase;
},{"./collection":2,"backbone":"5kFNoY","lodash":"K2RcUv"}],8:[function(_dereq_,module,exports){
// Collection
// ---------------
var _              = _dereq_('lodash');
var inherits       = _dereq_('inherits');

var Sync           = _dereq_('./sync');
var Helpers        = _dereq_('./helpers');
var EagerRelation  = _dereq_('./eager');
var Errors         = _dereq_('./errors');

var CollectionBase = _dereq_('./base/collection');
var Promise        = _dereq_('./base/promise');

function BookshelfCollection() {
  CollectionBase.apply(this, arguments);
}
inherits(BookshelfCollection, CollectionBase);

BookshelfCollection.EmptyError = Errors.EmptyError;

_.extend(BookshelfCollection.prototype, {

  // Used to define passthrough relationships - `hasOne`, `hasMany`,
  // `belongsTo` or `belongsToMany`, "through" a `Interim` model or collection.
  through: function(Interim, foreignKey, otherKey) {
    return this.relatedData.through(this, Interim, {throughForeignKey: foreignKey, otherKey: otherKey});
  },

  // Fetch the models for this collection, resetting the models
  // for the query when they arrive.
  fetch: Promise.method(function(options) {
    options = options ? _.clone(options) : {};
    return this.sync(options)
      .select()
      .bind(this)
      .tap(function(response) {
        if (!response || response.length === 0) {
          if (options.require) throw new Errors.EmptyError('EmptyResponse');
          return Promise.reject(null);
        }
      })

      // Now, load all of the data onto the collection as necessary.
      .tap(this._handleResponse)

      // If the "withRelated" is specified, we also need to eager load all of the
      // data on the collection, as a side-effect, before we ultimately jump into the
      // next step of the collection. Since the `columns` are only relevant to the current
      // level, ensure those are omitted from the options.
      .tap(function(response) {
        if (options.withRelated) {
          return this._handleEager(response, _.omit(options, 'columns'));
        }
      })
      .tap(function(response) {
        return this.triggerThen('fetched', this, response, options);
      })
      .catch(function(err) {
        if (err !== null) throw err;
        this.reset([], {silent: true});
      })
      .return(this);
  }),

  // Fetches a single model from the collection, useful on related collections.
  fetchOne: Promise.method(function(options) {
    var model = new this.model;
    model._knex = this.query().clone();
    this.resetQuery();
    if (this.relatedData) model.relatedData = this.relatedData;
    return model.fetch(options);
  }),

  // Eager loads relationships onto an already populated `Collection` instance.
  load: Promise.method(function(relations, options) {
    _.isArray(relations) || (relations = [relations]);
    options = _.extend({}, options, {shallow: true, withRelated: relations});
    return new EagerRelation(this.models, this.toJSON(options), new this.model())
      .fetch(options)
      .return(this);
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
          return this.attach(model, _.omit(options, 'query'));
        }
      })
      .then(function() { this.add(model, options); })
      .return(model);
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
  },

  // Handles the response data for the collection, returning from the collection's fetch call.
  _handleResponse: function(response) {
    var relatedData = this.relatedData;
    this.set(response, {silent: true, parse: true}).invoke('_reset');
    if (relatedData && relatedData.isJoined()) {
      relatedData.parsePivot(this.models);
    }
  },

  // Handle the related data loading on the collection.
  _handleEager: function(response, options) {
    return new EagerRelation(this.models, response, new this.model()).fetch(options);
  }

});

module.exports = BookshelfCollection;
},{"./base/collection":2,"./base/promise":6,"./eager":9,"./errors":10,"./helpers":11,"./sync":14,"inherits":"oxw+vU","lodash":"K2RcUv"}],9:[function(_dereq_,module,exports){
// EagerRelation
// ---------------
var _         = _dereq_('lodash');
var inherits  = _dereq_('inherits');

var Helpers   = _dereq_('./helpers');
var Promise   = _dereq_('./base/promise');
var EagerBase = _dereq_('./base/eager');

// An `EagerRelation` object temporarily stores the models from an eager load,
// and handles matching eager loaded objects with their parent(s). The `tempModel`
// is only used to retrieve the value of the relation method, to know the constrains
// for the eager query.
function EagerRelation() {
  EagerBase.apply(this, arguments);
}
inherits(EagerRelation, EagerBase);

_.extend(EagerRelation.prototype, {

  // Handles an eager loaded fetch, passing the name of the item we're fetching for,
  // and any options needed for the current fetch.
  eagerFetch: Promise.method(function(relationName, handled, options) {
    var relatedData = handled.relatedData;

    // skip eager loading for rows where the foreign key isn't set
    if (relatedData.parentFk === null) return;

    if (relatedData.type === 'morphTo') return this.morphToFetch(relationName, relatedData, options);

    // Call the function, if one exists, to constrain the eager loaded query.
    options.beforeFn.call(handled, handled.query());
    return handled
      .sync(_.extend(options, {parentResponse: this.parentResponse}))
      .select()
      .bind(this)
      .tap(function(response) {
        return this._eagerLoadHelper(response, relationName, handled, _.omit(options, 'parentResponse'));
      });
  }),

  // Special handler for the eager loaded morph-to relations, this handles
  // the fact that there are several potential models that we need to be fetching against.
  // pairing them up onto a single response for the eager loading.
  morphToFetch: Promise.method(function(relationName, relatedData, options) {
    var groups = _.groupBy(this.parent, function(m) {
      return m.get(relatedData.morphName + '_type');
    });
    var pending = _.reduce(groups, function(memo, val, group) {
      var Target = Helpers.morphCandidate(relatedData.candidates, group);
      var target = new Target();
      memo.push(target
        .query('whereIn',
          _.result(target, 'idAttribute'),
          _.uniq(_.invoke(groups[group], 'get', relatedData.morphName + '_id'))
        )
        .sync(options)
        .select()
        .bind(this)
        .tap(function(response) {
          return this._eagerLoadHelper(response, relationName, {
            relatedData: relatedData.instance('morphTo', Target, {morphName: relatedData.morphName})
          }, options);
        }));
        return memo;
    }, [], this);
    return Promise.all(pending).then(function(resps) {
      return _.flatten(resps);
    });
  }),

  // Handles the eager load for both the `morphTo` and regular cases.
  _eagerLoadHelper: function(response, relationName, handled, options) {
    var relatedModels = this.pushModels(relationName, handled, response);
    var relatedData   = handled.relatedData;

    // If there is a response, fetch additional nested eager relations, if any.
    if (response.length > 0 && options.withRelated) {
      var relatedModel = relatedData.createModel();

      // If this is a `morphTo` relation, we need to do additional processing
      // to ensure we don't try to load any relations that don't look to exist.
      if (relatedData.type === 'morphTo') {
        var withRelated = this._filterRelated(relatedModel, options);
        if (withRelated.length === 0) return;
        options = _.extend({}, options, {withRelated: withRelated});
      }
      return new EagerRelation(relatedModels, response, relatedModel).fetch(options).return(response);
    }
  },

  // Filters the `withRelated` on a `morphTo` relation, to ensure that only valid
  // relations are attempted for loading.
  _filterRelated: function(relatedModel, options) {

    // By this point, all withRelated should be turned into a hash, so it should
    // be fairly simple to process by splitting on the dots.
    return _.reduce(options.withRelated, function(memo, val) {
      for (var key in val) {
        var seg = key.split('.')[0];
        if (_.isFunction(relatedModel[seg])) memo.push(val);
      }
      return memo;
    }, []);
  }

});

module.exports = EagerRelation;
},{"./base/eager":3,"./base/promise":6,"./helpers":11,"inherits":"oxw+vU","lodash":"K2RcUv"}],10:[function(_dereq_,module,exports){
var createError = _dereq_('create-error');

module.exports = {

  // Thrown when the model is not found and {require: true} is passed in the fetch options
  NotFoundError: createError('NotFoundError'),

  // Thrown when the collection is empty and {require: true} is passed in model.fetchAll or
  // collection.fetch
  EmptyError: createError('EmptyError')

};
},{"create-error":"f/LBa2"}],11:[function(_dereq_,module,exports){
// Helpers
// ---------------
var _ = _dereq_('lodash');

module.exports = {

  // Sets the constraints necessary during a `model.save` call.
  saveConstraints: function(model, relatedData) {
    var data = {};
    if (relatedData && relatedData.type && relatedData.type !== 'belongsToMany' && relatedData.type !== 'belongsTo') {
      data[relatedData.key('foreignKey')] = relatedData.parentFk || model.get(relatedData.key('foreignKey'));
      if (relatedData.isMorph()) data[relatedData.key('morphKey')] = relatedData.key('morphValue');
    }
    return model.set(data);
  },

  // Finds the specific `morphTo` table we should be working with, or throws
  // an error if none is matched.
  morphCandidate: function(candidates, foreignTable) {
    var Target = _.find(candidates, function(Candidate) {
      return (_.result(Candidate.prototype, 'tableName') === foreignTable);
    });
    if (!Target) {
      throw new Error('The target polymorphic model was not found');
    }
    return Target;
  },

  // If there are no arguments, return the current object's
  // query builder (or create and return a new one). If there are arguments,
  // call the query builder with the first argument, applying the rest.
  // If the first argument is an object, assume the keys are query builder
  // methods, and the values are the arguments for the query.
  query: function(obj, args) {
    obj._knex = obj._knex || obj._builder(_.result(obj, 'tableName'));
    if (args.length === 0) return obj._knex;
    var method = args[0];
    if (_.isFunction(method)) {
      method.call(obj._knex, obj._knex);
    } else if (_.isObject(method)) {
      for (var key in method) {
        var target = _.isArray(method[key]) ?  method[key] : [method[key]];
        obj._knex[key].apply(obj._knex, target);
      }
    } else {
      obj._knex[method].apply(obj._knex, args.slice(1));
    }
    return obj;
  }

};

},{"lodash":"K2RcUv"}],12:[function(_dereq_,module,exports){
// Model
// ---------------
var _              = _dereq_('lodash');
var inherits       = _dereq_('inherits');

var Sync           = _dereq_('./sync');
var Helpers        = _dereq_('./helpers');
var EagerRelation  = _dereq_('./eager');
var Errors         = _dereq_('./errors');

var ModelBase      = _dereq_('./base/model');
var Promise        = _dereq_('./base/promise');

function BookshelfModel() {
  ModelBase.apply(this, arguments);
}
inherits(BookshelfModel, ModelBase);

BookshelfModel.NotFoundError = Errors.NotFoundError;

_.extend(BookshelfModel.prototype, {

  // The `hasOne` relation specifies that this table has exactly one of another type of object,
  // specified by a foreign key in the other table. The foreign key is assumed to be the singular of this
  // object's `tableName` with an `_id` suffix, but a custom `foreignKey` attribute may also be specified.
  hasOne: function(Target, foreignKey) {
    return this._relation('hasOne', Target, {foreignKey: foreignKey}).init(this);
  },

  // The `hasMany` relation specifies that this object has one or more rows in another table which
  // match on this object's primary key. The foreign key is assumed to be the singular of this object's
  // `tableName` with an `_id` suffix, but a custom `foreignKey` attribute may also be specified.
  hasMany: function(Target, foreignKey) {
    return this._relation('hasMany', Target, {foreignKey: foreignKey}).init(this);
  },

  // A reverse `hasOne` relation, the `belongsTo`, where the specified key in this table
  // matches the primary `idAttribute` of another table.
  belongsTo: function(Target, foreignKey) {
    return this._relation('belongsTo', Target, {foreignKey: foreignKey}).init(this);
  },

  // A `belongsToMany` relation is when there are many-to-many relation
  // between two models, with a joining table.
  belongsToMany: function(Target, joinTableName, foreignKey, otherKey) {
    return this._relation('belongsToMany', Target, {
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
    return this._relation('morphTo', null, {morphName: morphName, candidates: _.rest(arguments)}).init(this);
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
  fetch: Promise.method(function(options) {
    options = options ? _.clone(options) : {};

    // Run the `first` call on the `sync` object to fetch a single model.
    return this.sync(options)
      .first()
      .bind(this)

      // Jump the rest of the chain if the response doesn't exist...
      .tap(function(response) {
        if (!response || response.length === 0) {
          if (options.require) throw new Errors.NotFoundError('EmptyResponse');
          return Promise.reject(null);
        }
      })

      // Now, load all of the data into the model as necessary.
      .tap(this._handleResponse)

      // If the "withRelated" is specified, we also need to eager load all of the
      // data on the model, as a side-effect, before we ultimately jump into the
      // next step of the model. Since the `columns` are only relevant to the current
      // level, ensure those are omitted from the options.
      .tap(function(response) {
        if (options.withRelated) {
          return this._handleEager(response, _.omit(options, 'columns'));
        }
      })

      .tap(function(response) {
        return this.triggerThen('fetched', this, response, options);
      })
      .return(this)
      .catch(function(err) {
        if (err === null) return err;
        throw err;
      });
  }),

  // Shortcut for creating a collection and fetching the associated models.
  fetchAll: function(options) {
    var collection = this.constructor.collection();
    collection._knex = this.query().clone();
    this.resetQuery();
    if (this.relatedData) collection.relatedData = this.relatedData;
    var model = this;
    return collection
      .on('fetching', function(collection, columns, options) {
        return model.triggerThen('fetching:collection', collection, columns, options);
      })
      .on('fetched', function(collection, resp, options) {
        return model.triggerThen('fetched:collection', collection, resp, options);
      })
      .fetch(options);
  },

  // Eager loads relationships onto an already populated `Model` instance.
  load: Promise.method(function(relations, options) {
    return Promise.bind(this)
      .then(function() {
        return [this.format(_.extend(Object.create(null), this.attributes))];
      })
      .then(function(response) {
        return this._handleEager(response, _.extend({}, options, {
          shallow: true,
          withRelated: _.isArray(relations) ? relations : [relations]
        }));
      })
      .return(this);
  }),

  // Sets and saves the hash of model attributes, triggering
  // a "creating" or "updating" event on the model, as well as a "saving" event,
  // to bind listeners for any necessary validation, logging, etc.
  // If an error is thrown during these events, the model will not be saved.
  save: Promise.method(function(key, val, options) {
    var attrs;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (key == null || typeof key === "object") {
      attrs = key || {};
      options = _.clone(val) || {};
    } else {
      (attrs = {})[key] = val;
      options = options ? _.clone(options) : {};
    }

    return Promise.bind(this).then(function() {
      return this.isNew(options);
    }).then(function(isNew) {

      // If the model has timestamp columns,
      // set them as attributes on the model, even
      // if the "patch" option is specified.
      if (this.hasTimestamps) _.extend(attrs, this.timestamp(options));

      // Determine whether the model is new, based on whether the model has an `idAttribute` or not.
      options.method = (options.method || (isNew ? 'insert' : 'update')).toLowerCase();
      var method = options.method;
      var vals = attrs;

      // If the object is being created, we merge any defaults here
      // rather than during object creation.
      if (method === 'insert' || options.defaults) {
        var defaults = _.result(this, 'defaults');
        if (defaults) {
          vals = _.extend({}, defaults, this.attributes, vals);
        }
      }

      // Set the attributes on the model.
      this.set(vals, {silent: true});

      // If there are any save constraints, set them on the model.
      if (this.relatedData && this.relatedData.type !== 'morphTo') {
        Helpers.saveConstraints(this, this.relatedData);
      }

      // Gives access to the `query` object in the `options`, in case we need it
      // in any event handlers.
      var sync = this.sync(options);
      options.query = sync.query;

      return this.triggerThen((method === 'insert' ? 'creating saving' : 'updating saving'), this, attrs, options)
      .bind(this)
      .then(function() {
        return sync[options.method](method === 'update' && options.patch ? attrs : this.attributes);
      })
      .then(function(resp) {

        // After a successful database save, the id is updated if the model was created
        if (method === 'insert' && this.id == null) {
          this.attributes[this.idAttribute] = this.id = resp[0];
        } else if (method === 'update' && resp === 0) {
          throw new Error('No rows were affected in the update, did you mean to pass the {method: "insert"} option?');
        }

        // In case we need to reference the `previousAttributes` for the this
        // in the following event handlers.
        options.previousAttributes = this._previousAttributes;

        this._reset();

        return this.triggerThen((method === 'insert' ? 'created saved' : 'updated saved'), this, resp, options);
      });

    })
    .return(this);
  }),

  // Reset the query builder, called internally
  // each time a query is run.
  resetQuery: function() {
    this._knex = null;
    return this;
  },

  // Tap into the "query chain" for this model.
  query: function() {
    return Helpers.query(this, _.toArray(arguments));
  },

  // Add the most common conditional directly to the model, everything else
  // can be accessed with the `query` method.
  where: function() {
    var args = _.toArray(arguments);
    return this.query.apply(this, ['where'].concat(args));
  },

  // Creates and returns a new `Sync` instance.
  sync: function(options) {
    return new Sync(this, options);
  },

  // Helper for setting up the `morphOne` or `morphMany` relations.
  _morphOneOrMany: function(Target, morphName, morphValue, type) {
    if (!morphName || !Target) throw new Error('The polymorphic `name` and `Target` are required.');
    return this._relation(type, Target, {morphName: morphName, morphValue: morphValue}).init(this);
  },

  // Handles the response data for the model, returning from the model's fetch call.
  // Todo: {silent: true, parse: true}, for parity with collection#set
  // need to check on Backbone's status there, ticket #2636
  _handleResponse: function(response) {
    var relatedData = this.relatedData;
    this.set(this.parse(response[0]), {silent: true})._reset();
    if (relatedData && relatedData.isJoined()) {
      relatedData.parsePivot([this]);
    }
  },

  // Handle the related data loading on the model.
  _handleEager: function(response, options) {
    return new EagerRelation([this], response, this).fetch(options);
  }

});

module.exports = BookshelfModel;
},{"./base/model":5,"./base/promise":6,"./eager":9,"./errors":10,"./helpers":11,"./sync":14,"inherits":"oxw+vU","lodash":"K2RcUv"}],13:[function(_dereq_,module,exports){
// Relation
// ---------------
var _          = _dereq_('lodash');
var inherits   = _dereq_('inherits');
var inflection = _dereq_('inflection');

var Helpers      = _dereq_('./helpers');
var ModelBase    = _dereq_('./base/model');
var RelationBase = _dereq_('./base/relation');
var Promise      = _dereq_('./base/promise');

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
      // If the parent object is eager loading, and it's a polymorphic `morphTo` relation,
      // we can't know what the target will be until the models are sorted and matched.
      if (this.type === 'morphTo' && !parent._isEager) {
        parent.attributes = parent.format(parent.attributes);
        this.target = Helpers.morphCandidate(this.candidates, parent.get(this.key('morphKey')));
        this.targetTableName   = _.result(this.target.prototype, 'tableName');
        this.targetIdAttribute = _.result(this.target.prototype, 'idAttribute');
      }
      this.parentFk = parent.get(this.key('foreignKey'));
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
    if (this[keyName]) return this[keyName];
    if (keyName === 'otherKey') {
      return this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
    }
    if (keyName === 'throughForeignKey') {
      return this[keyName] = singularMemo(this.joinTable()) + '_' + this.throughIdAttribute;
    }
    if (keyName === 'foreignKey') {
      if (this.type === 'morphTo') return this[keyName] = this.morphName + '_id';
      if (this.type === 'belongsTo') return this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
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
    if (_.isArray(options.columns)) {
      knex.columns(options.columns);
    }

    var currentColumns = _.findWhere(knex._statements, {grouping: 'columns'});

    if (!currentColumns || currentColumns.length === 0) {
      knex.column(this.targetTableName + '.*');
    }

    // The `belongsToMany` and `through` relations have joins & pivot columns.
    if (this.isJoined()) {
      this.joinClauses(knex);
      this.joinColumns(knex);
    }

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
},{"./base/model":5,"./base/promise":6,"./base/relation":7,"./helpers":11,"inflection":"ccvB8p","inherits":"oxw+vU","lodash":"K2RcUv"}],14:[function(_dereq_,module,exports){
// Sync
// ---------------
var _       = _dereq_('lodash');
var Promise = _dereq_('./base/promise');

// Sync is the dispatcher for any database queries,
// taking the "syncing" `model` or `collection` being queried, along with
// a hash of options that are used in the various query methods.
// If the `transacting` option is set, the query is assumed to be
// part of a transaction, and this information is passed along to `Knex`.
var Sync = function(syncing, options) {
  options = options || {};
  this.query   = syncing.query();
  this.syncing = syncing.resetQuery();
  this.options = options;
  if (options.debug) this.query.debug();
  if (options.transacting) this.query.transacting(options.transacting);
};

_.extend(Sync.prototype, {

  // Prefix all keys of the passed in object with the
  // current table name
  prefixFields: function(fields) {
    var tableName = this.syncing.tableName;
    var prefixed = {};
    for (var key in fields) {
      prefixed[tableName + '.' + key] = fields[key];
    }
    return prefixed;
  },

  // Select the first item from the database - only used by models.
  first: Promise.method(function() {
    this.query.where(this.prefixFields(this.syncing.format(
      _.extend(Object.create(null), this.syncing.attributes)
    ))).limit(1);
    return this.select();
  }),

  // Runs a `select` query on the database, adding any necessary relational
  // constraints, resetting the query when complete. If there are results and
  // eager loaded relations, those are fetched and returned on the model before
  // the promise is resolved. Any `success` handler passed in the
  // options will be called - used by both models & collections.
  select: Promise.method(function() {
    var columns, sync = this,
      options = this.options, relatedData = this.syncing.relatedData;

    // Inject all appropriate select costraints dealing with the relation
    // into the `knex` query builder for the current instance.
    if (relatedData) {
      relatedData.selectConstraints(this.query, options);
    } else {
      columns = options.columns;
      if (!_.isArray(columns)) columns = columns ? [columns] : [_.result(this.syncing, 'tableName') + '.*'];
    }

    // Set the query builder on the options, in-case we need to
    // access in the `fetching` event handlers.
    options.query = this.query;

    // Trigger a `fetching` event on the model, and then select the appropriate columns.
    return Promise.bind(this).then(function() {
      return this.syncing.triggerThen('fetching', this.syncing, columns, options);
    }).then(function() {
      return this.query.select(columns);
    });
  }),

  // Issues an `insert` command on the query - only used by models.
  insert: Promise.method(function() {
    var syncing = this.syncing;
    return this.query.insert(syncing.format(_.extend(Object.create(null), syncing.attributes)), syncing.idAttribute);
  }),

  // Issues an `update` command on the query - only used by models.
  update: Promise.method(function(attrs) {
    var syncing = this.syncing, query = this.query;
    if (syncing.id != null) query.where(syncing.idAttribute, syncing.id);
    if (_.where(query._statements, {grouping: 'where'}).length === 0) {
      throw new Error('A model cannot be updated without a "where" clause or an idAttribute.');
    }
    return query.update(syncing.format(_.extend(Object.create(null), attrs)));
  }),

  // Issues a `delete` command on the query.
  del: Promise.method(function() {
    var query = this.query, syncing = this.syncing;
    if (syncing.id != null) query.where(syncing.idAttribute, syncing.id);
    if (_.where(query._statements, {grouping: 'where'}).length === 0) {
      throw new Error('A model cannot be destroyed without a "where" clause or an idAttribute.');
    }
    return this.query.del();
  })

});

module.exports = Sync;
},{"./base/promise":6,"lodash":"K2RcUv"}]},{},[1])
(1)
});