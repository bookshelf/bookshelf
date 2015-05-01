(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("lodash"), require("inflection"), require("bluebird"));
	else if(typeof define === 'function' && define.amd)
		define(["lodash", "inflection", "bluebird"], factory);
	else if(typeof exports === 'object')
		exports["Bookshelf"] = factory(require("lodash"), require("inflection"), require("bluebird"));
	else
		root["Bookshelf"] = factory(root["_"], root["inflection"], root["Promise"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_12__, __WEBPACK_EXTERNAL_MODULE_23__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// Bookshelf.js 0.8.0
	// ---------------

	//     (c) 2014 Tim Griesser
	//     Bookshelf may be freely distributed under the MIT license.
	//     For all details and documentation:
	//     http://bookshelfjs.org
	var _          = __webpack_require__(1);
	var inherits   = __webpack_require__(13);
	var semver     = __webpack_require__(14);
	var helpers    = __webpack_require__(2)

	// We've supplemented `Events` with a `triggerThen`
	// method to allow for asynchronous event handling via promises. We also
	// mix this into the prototypes of the main objects in the library.
	var Events = __webpack_require__(3);

	// All core modules required for the bookshelf instance.
	var BookshelfModel      = __webpack_require__(4);
	var BookshelfCollection = __webpack_require__(5);
	var BookshelfRelation   = __webpack_require__(6);
	var Errors              = __webpack_require__(7);

	function Bookshelf(knex) {
	  var bookshelf  = {
	    VERSION: '0.8.0'
	  };

	  var range = '>=0.6.10 <0.9.0';
	  if (!semver.satisfies(knex.VERSION, range)) {
	    throw new Error('The knex version is ' + knex.VERSION + ' which does not satisfy the Bookshelf\'s requirement ' + range);
	  }

	  var Model = bookshelf.Model = BookshelfModel.extend({
	    
	    _builder: builderFn,

	    // The `Model` constructor is referenced as a property on the `Bookshelf` instance,
	    // mixing in the correct `builder` method, as well as the `relation` method,
	    // passing in the correct `Model` & `Collection` constructors for later reference.
	    _relation: function(type, Target, options) {
	      if (type !== 'morphTo' && !_.isFunction(Target)) {
	        throw new Error('A valid target model must be defined for the ' +
	          _.result(this, 'tableName') + ' ' + type + ' relation');
	      }
	      return new Relation(type, Target, options);
	    }

	  }, {

	    forge: forge,

	    collection: function(rows, options) {
	      return new Collection((rows || []), _.extend({}, options, {model: this}));
	    },

	    fetchAll: function(options) {
	      return this.forge().fetchAll(options); 
	    }
	  })

	  var Collection = bookshelf.Collection = BookshelfCollection.extend({
	    
	    _builder: builderFn
	  
	  }, {
	  
	    forge: forge
	  
	  });

	  // The collection also references the correct `Model`, specified above, for creating
	  // new `Model` instances in the collection.
	  Collection.prototype.model = Model;
	  Model.prototype.Collection = Collection;

	  var Relation = BookshelfRelation.extend({
	    Model: Model,
	    Collection: Collection
	  })

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
	          __webpack_require__(8)("./" + plugin)(this, options);
	        } catch (e) {
	          if (false) {
	            require(plugin)(this, options)  
	          }
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
	  function forge() {
	    var inst = Object.create(this.prototype);
	    var obj = this.apply(inst, arguments);
	    return (Object(obj) === obj ? obj : inst);
	  }

	  function builderFn(tableName) {
	    var builder  = knex(tableName);
	    var instance = this;
	    return builder.on('query', function(data) {
	      instance.trigger('query', data);
	    });
	  }

	  // Attach `where`, `query`, and `fetchAll` as static methods.
	  ['where', 'query'].forEach(function(method) {
	    Model[method] =
	    Collection[method] = function() {
	      var model = this.forge();
	      return model[method].apply(model, arguments);
	    };
	  });
	  
	  return bookshelf;
	}

	// Constructor for a new `Bookshelf` object, it accepts
	// an active `knex` instance and initializes the appropriate
	// `Model` and `Collection` constructors for use in the current instance.
	Bookshelf.initialize = function(knex) {
	  helpers.warn("Bookshelf.initialize is deprecated, pass knex directly: require('bookshelf')(knex)")
	  return new Bookshelf(knex)
	};

	// Finally, export `Bookshelf` to the world.
	module.exports = Bookshelf;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// Helpers
	// ---------------
	var _     = __webpack_require__(1);
	var chalk = __webpack_require__(21)

	var helpers = {

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
	  },

	  error: function(msg) {
	    console.log(chalk.red(msg))
	  },

	  warn: function(msg) {
	    console.log(chalk.yellow(msg))
	  },

	  deprecate: function(a, b) {
	    helpers.warn(a + ' has been deprecated, please use ' + b + ' instead')
	  }

	};


	module.exports = helpers

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// Events
	// ---------------

	var Promise      = __webpack_require__(15);
	var inherits     = __webpack_require__(13);
	var EventEmitter = __webpack_require__(22).EventEmitter;
	var _            = __webpack_require__(1);

	function Events() {
	  EventEmitter.apply(this, arguments);
	}
	inherits(Events, EventEmitter);

	// Regular expression used to split event strings.
	var eventSplitter = /\s+/;
	Events.prototype.on = function(name, handler) {
	  // Handle space separated event names.
	  if (eventSplitter.test(name)) {
	    var names = name.split(eventSplitter);
	    for (var i = 0, l = names.length; i < l; i++) {
	      this.on(names[i], handler);
	    }
	    return this;
	  }
	  return EventEmitter.prototype.on.apply(this, arguments);
	};

	// Add "off", "trigger", and "" method, for parity with Backbone.Events
	Events.prototype.off = function(event, listener) {
	  if (arguments.length === 0) {
	    return this.removeAllListeners();
	  }
	  if (arguments.length === 1) {
	    return this.removeAllListeners(event);
	  }
	  return this.removeListener(event, listener);
	};
	Events.prototype.trigger = function(name) {
	  // Handle space separated event names.
	  if (eventSplitter.test(name)) {
	    var len  = arguments.length;
	    var rest = new Array(len - 1);
	    for (i = 1; i < len; i++) rest[i - 1] = arguments[i];
	    var names = name.split(eventSplitter);
	    for (var i = 0, l = names.length; i < l; i++) {
	      EventEmitter.prototype.emit.apply(this, [names[i]].concat(rest));
	    }
	    return this;
	  }
	  EventEmitter.prototype.emit.apply(this, arguments);
	  return this;
	};

	Events.prototype.triggerThen = function(name) {
	  var i, l, rest, listeners = [];
	  // Handle space separated event names.
	  if (eventSplitter.test(name)) {
	    var names = name.split(eventSplitter);
	    for (i = 0, l = names.length; i < l; i++) {
	      listeners = listeners.concat(this.listeners(names[i]));
	    }
	  } else {
	    listeners = this.listeners(name);
	  }
	  var len = arguments.length;
	  switch (len) {
	    case 1: rest = []; break;
	    case 2: rest = [arguments[1]]; break;
	    case 3: rest = [arguments[1], arguments[2]]; break;
	    default: rest = new Array(len - 1); for (i = 1; i < len; i++) rest[i - 1] = arguments[i];
	  }
	  var events = this
	  return Promise.try(function() {
	    var pending = [];
	    for (i = 0, l = listeners.length; i < l; i++) {
	      pending[i] = listeners[i].apply(events, rest);
	    }
	    return Promise.all(pending);
	  })
	};
	Events.prototype.emitThen = Events.prototype.triggerThen;

	Events.prototype.once = function(name, callback, context) {
	  var self = this;
	  var once = _.once(function() {
	      self.off(name, once);
	      return callback.apply(this, arguments);
	  });
	  once._callback = callback;
	  return this.on(name, once, context);
	};

	module.exports = Events;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// Model
	// ---------------
	var _              = __webpack_require__(1);
	var createError    = __webpack_require__(24)

	var Sync           = __webpack_require__(16);
	var Helpers        = __webpack_require__(2);
	var EagerRelation  = __webpack_require__(17);
	var Errors         = __webpack_require__(7);

	var ModelBase      = __webpack_require__(18);
	var Promise        = __webpack_require__(15);

	var BookshelfModel = ModelBase.extend({

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
	  morphOne: function(Target, name, columnNames, morphValue) {
	    return this._morphOneOrMany(Target, name, columnNames, morphValue, 'morphOne');
	  },

	  // A `morphMany` relation is a polymorphic many-to-one relation from this model
	  // to many another models.
	  morphMany: function(Target, name, columnNames, morphValue) {
	    return this._morphOneOrMany(Target, name, columnNames, morphValue, 'morphMany');
	  },

	  // Defines the opposite end of a `morphOne` or `morphMany` relationship, where
	  // the alternate end of the polymorphic model is defined.
	  morphTo: function(morphName) {
	    var columnNames, remainder;
	    if (!_.isString(morphName)) throw new Error('The `morphTo` name must be specified.');
	    if (_.isArray(arguments[1])) {
	      columnNames = arguments[1];
	      remainder = _.rest(arguments, 2);
	    } else {
	      columnNames = null;
	      remainder = _.rest(arguments);
	    }
	    return this._relation('morphTo', null, {morphName: morphName, columnNames: columnNames, candidates: remainder}).init(this);
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
	          if (options.require) throw new this.constructor.NotFoundError('EmptyResponse');
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
	          if (options.require !== false) {
	            throw new this.constructor.NoRowsUpdatedError('No Rows Updated');
	          }
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
	      if (options.require && resp === 0) {
	        throw new this.constructor.NoRowsDeletedError('No Rows Deleted');
	      }
	      this.clear();
	      return this.triggerThen('destroyed', this, resp, options);
	    }).then(this._reset);
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
	  _morphOneOrMany: function(Target, morphName, columnNames, morphValue, type) {
	    if (!_.isArray(columnNames)) {
	      // Shift by one place
	      morphValue = columnNames;
	      columnNames = null;
	    }
	    if (!morphName || !Target) throw new Error('The polymorphic `name` and `Target` are required.');
	    return this._relation(type, Target, {morphName: morphName, morphValue: morphValue, columnNames: columnNames}).init(this);
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

	}, {

	  extended: function(child) {
	    child.NotFoundError      = createError(this.NotFoundError)
	    child.NoRowsUpdatedError = createError(this.NoRowsUpdatedError)
	    child.NoRowsDeletedError = createError(this.NoRowsDeletedError)
	  }

	});

	BookshelfModel.NotFoundError      = Errors.NotFoundError,
	BookshelfModel.NoRowsUpdatedError = Errors.NoRowsUpdatedError,
	BookshelfModel.NoRowsDeletedError = Errors.NoRowsDeletedError

	module.exports = BookshelfModel;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// Collection
	// ---------------
	var _              = __webpack_require__(1);

	var Sync           = __webpack_require__(16);
	var Helpers        = __webpack_require__(2);
	var EagerRelation  = __webpack_require__(17);
	var Errors         = __webpack_require__(7);

	var CollectionBase = __webpack_require__(19);
	var Promise        = __webpack_require__(15);
	var createError    = __webpack_require__(24);

	var BookshelfCollection = CollectionBase.extend({

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
	          if (options.require) throw new this.constructor.EmptyError('EmptyResponse');
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

	}, {

	  extended: function(child) {
	    child.EmptyError = createError(this.EmptyError)
	  }

	});

	BookshelfCollection.EmptyError = Errors.EmptyError

	module.exports = BookshelfCollection;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// Relation
	// ---------------
	var _          = __webpack_require__(1);
	var inherits   = __webpack_require__(13);
	var inflection = __webpack_require__(12);

	var Helpers      = __webpack_require__(2);
	var ModelBase    = __webpack_require__(18);
	var RelationBase = __webpack_require__(20);
	var Promise      = __webpack_require__(15);

	var push         = [].push;

	var BookshelfRelation = RelationBase.extend({

	  // Assembles the new model or collection we're creating an instance of,
	  // gathering any relevant primitives from the parent object,
	  // without keeping any hard references.
	  init: function(parent) {
	    this.parentId          = parent.id;
	    this.parentTableName   = _.result(parent, 'tableName');
	    this.parentIdAttribute = _.result(parent, 'idAttribute');

	    if (this.isInverse()) {
	      // use formatted attributes so that morphKey and foreignKey will match
	      // attribute keys
	      var attributes = parent.format(_.clone(parent.attributes));

	      // If the parent object is eager loading, and it's a polymorphic `morphTo` relation,
	      // we can't know what the target will be until the models are sorted and matched.
	      if (this.type === 'morphTo' && !parent._isEager) {
	        this.target = Helpers.morphCandidate(this.candidates, attributes[this.key('morphKey')]);
	        this.targetTableName   = _.result(this.target.prototype, 'tableName');
	        this.targetIdAttribute = _.result(this.target.prototype, 'idAttribute');
	      }
	      this.parentFk = attributes[this.key('foreignKey')];
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
	    var idKeyName;
	    if (this[keyName]) return this[keyName];
	    if (keyName === 'otherKey') {
	      return this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
	    }
	    if (keyName === 'throughForeignKey') {
	      return this[keyName] = singularMemo(this.joinTable()) + '_' + this.throughIdAttribute;
	    }
	    if (keyName === 'foreignKey') {
	      if (this.type === 'morphTo') {
	        idKeyName = this.columnNames && this.columnNames[1] ? this.columnNames[1] : this.morphName + '_id';
	        return this[keyName] = idKeyName;
	      }
	      if (this.type === 'belongsTo') return this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
	      if (this.isMorph()) {
	        idKeyName = this.columnNames && this.columnNames[1] ? this.columnNames[1] : this.morphName + '_id';
	        return this[keyName] = idKeyName;
	      }
	      return this[keyName] = singularMemo(this.parentTableName) + '_' + this.parentIdAttribute;
	    }
	    if (keyName === 'morphKey') {
	      var typeKeyName = this.columnNames && this.columnNames[0] ? this.columnNames[0] : this.morphName + '_type';
	      return this[keyName] = typeKeyName;
	    }
	    if (keyName === 'morphValue') return this[keyName] = this.parentTableName || this.targetTableName;
	  },

	  // Injects the necessary `select` constraints into a `knex` query builder.
	  selectConstraints: function(knex, options) {
	    var resp = options.parentResponse;

	    // The `belongsToMany` and `through` relations have joins & pivot columns.
	    if (this.isJoined()) this.joinClauses(knex);

	    // Call the function, if one exists, to constrain the eager loaded query.
	    if (options._beforeFn) options._beforeFn.call(knex, knex);

	    // The base select column
	    if (_.isArray(options.columns)) {
	      knex.columns(options.columns);
	    }

	    var currentColumns = _.findWhere(knex._statements, {grouping: 'columns'});

	    if (!currentColumns || currentColumns.length === 0) {
	      knex.column(this.targetTableName + '.*');
	    }

	    if (this.isJoined()) this.joinColumns(knex);

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
	    return Promise.bind(this).then(function(){
	      return this.triggerThen('attaching', this, ids, options);
	    }).then(function() {
	      return this._handler('insert', ids, options);
	    }).then(function(resp) {
	      return this.triggerThen('attached', this, resp, options);
	    }).then(function() {
	      return this;
	    });
	  },

	  // Detach related object from their pivot tables.
	  // If a model or id is passed, it attempts to remove the
	  // pivot table based on that foreign key. If a hash is passed,
	  // it attempts to remove the item based on a where clause with
	  // these parameters. If no parameters are specified, we assume we will
	  // detach all related associations.
	  detach: function(ids, options) {
	    return Promise.bind(this).then(function(){
	      return this.triggerThen('detaching', this, ids, options);
	    }).then(function() {
	      return this._handler('delete', ids, options);
	    }).then(function(resp) {
	      return this.triggerThen('detached', this, resp, options);
	    });
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
	    return Promise.all(pending).return(this);
	  }),

	  // Handles preparing the appropriate constraints and then delegates
	  // the database interaction to _processPlainPivot for non-.through()
	  // pivot definitions, or _processModelPivot for .through() models.
	  // Returns a promise.
	  _processPivot: Promise.method(function(method, item, options) {
	    var relatedData = this.relatedData
	      , args        = Array.prototype.slice.call(arguments)
	      , fks         = {}
	      , data        = {};

	    fks[relatedData.key('foreignKey')] = relatedData.parentFk;

	    // If the item is an object, it's either a model
	    // that we're looking to attach to this model, or
	    // a hash of attributes to set in the relation.
	    if (_.isObject(item)) {
	      if (item instanceof ModelBase) {
	        fks[relatedData.key('otherKey')] = item.id;
	      } else if (method !== 'update') {
	        _.extend(data, item);
	      }
	    } else if (item) {
	      fks[relatedData.key('otherKey')] = item;
	    }

	    args.push(_.extend(data, fks), fks);

	    if (this.relatedData.throughTarget) {
	      return this._processModelPivot.apply(this, args);
	    }

	    return this._processPlainPivot.apply(this, args);
	  }),

	  // Applies constraints to the knex builder and handles shelling out
	  // to either the `insert` or `delete` call for the current model,
	  // returning a promise.
	  _processPlainPivot: Promise.method(function(method, item, options, data, fks) {
	    var relatedData = this.relatedData;

	    // Grab the `knex` query builder for the current model, and
	    // check if we have any additional constraints for the query.
	    var builder = this._builder(relatedData.joinTable());
	    if (options && options.query) {
	      Helpers.query.call(null, {_knex: builder}, [options.query]);
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
	  }),

	  // Loads or prepares a pivot model based on the constraints and deals with
	  // pivot model changes by calling the appropriate Bookshelf Model API
	  // methods. Returns a promise.
	  _processModelPivot: Promise.method(function(method, item, options, data, fks) {
	    var relatedData = this.relatedData
	      , JoinModel   = relatedData.throughTarget
	      , instance    = new JoinModel;

	    fks = instance.parse(fks);
	    data = instance.parse(data);

	    if (method === 'insert') {
	      return instance.set(data).save(null, options);
	    }

	    return instance.set(fks).fetch({
	      require: true
	    }).then(function (instance) {
	      if (method === 'delete') {
	        return instance.destroy(options);
	      }

	      return instance.save(item, options);
	    });
	  })

	};

	module.exports = BookshelfRelation;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var createError = __webpack_require__(24);

	module.exports = {

	  // Thrown when the model is not found and {require: true} is passed in the fetch options
	  NotFoundError: createError('NotFoundError'),

	  // Thrown when the collection is empty and {require: true} is passed in model.fetchAll or
	  // collection.fetch
	  EmptyError: createError('EmptyError'),

	  // Thrown when an update affects no rows and {require: true} is passed in model.save.
	  NoRowsUpdatedError: createError('NoRowsUpdatedError'),

	  // Thrown when a delete affects no rows and {require: true} is passed in model.destroy.
	  NoRowsDeletedError: createError('NoRowsDeletedError')

	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./registry": 9,
		"./registry.js": 9,
		"./virtuals": 10,
		"./virtuals.js": 10,
		"./visibility": 11,
		"./visibility.js": 11
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 8;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// Registry Plugin -
	// Create a central registry of model/collection constructors to
	// help with the circular reference problem, and for convenience in relations.
	// -----
	module.exports = function (bookshelf) {
	  'use strict';
	  var _ = __webpack_require__(1);

	  function preventOverwrite(store, name) {
	    if (store[name]) throw new Error(name + ' is already defined in the registry');
	  }

	  bookshelf.registry = bookshelf.registry || {};

	  // Set up the methods for storing and retrieving models
	  // on the bookshelf instance.
	  bookshelf.model = function(name, ModelCtor, staticProps) {
	    this._models = this._models || Object.create(null);
	    if (ModelCtor) {
	      preventOverwrite(this._models, name);
	      if (_.isPlainObject(ModelCtor)) {
	        ModelCtor = this.Model.extend(ModelCtor, staticProps);
	      }
	      this._models[name] = ModelCtor;
	    }
	    return (this._models[name] = this._models[name] || bookshelf.resolve(name));
	  };
	  bookshelf.collection = function(name, CollectionCtor, staticProps) {
	    this._collections = this._collections || Object.create(null);
	    if (CollectionCtor) {
	      preventOverwrite(this._collections, name);
	      if (_.isPlainObject(CollectionCtor)) {
	        CollectionCtor = this.Collection.extend(CollectionCtor, staticProps);
	      }
	      this._collections[name] = CollectionCtor;
	    }
	    return (this._collections[name] = this._collections[name] || bookshelf.resolve(name));
	  };

	  // Provide a custom function to resolve the location of a model or collection.
	  bookshelf.resolve = function(name) { return void 0; };

	  // Check the collection or module caches for a Model or Collection constructor,
	  // returning if the input is not an object. Check for a collection first,
	  // since these are potentially used with *-to-many relation. Otherwise, check for a
	  // registered model, throwing an error if none are found.
	  function resolveModel(input) {
	    if (typeof input === 'string') {
	      return bookshelf.collection(input) || bookshelf.model(input) || (function() {
	        throw new Error('The model ' + input + ' could not be resolved from the registry plugin.');
	      })();
	    }
	    return input;
	  }

	  var Model = bookshelf.Model;
	  var Collection = bookshelf.Collection;

	  // Re-implement the `bookshelf.Model` relation methods to include a check for the registered model.
	  _.each(['hasMany', 'hasOne', 'belongsToMany', 'morphOne', 'morphMany', 'belongsTo', 'through'], function(method) {
	    var original = Model.prototype[method];
	    Model.prototype[method] = function(Target) {
	      // The first argument is always a model, so resolve it and call the original method.
	      return original.apply(this, [resolveModel(Target)].concat(_.rest(arguments)));
	    };
	  });

	  // `morphTo` takes the relation name first, and then a variadic set of models so we
	  // can't include it with the rest of the relational methods.
	  var morphTo = Model.prototype.morphTo;
	  Model.prototype.morphTo = function(relationName) {
	    return morphTo.apply(this, [relationName].concat(_.map(_.rest(arguments), function(model) {
	      return resolveModel(model);
	    }, this)));
	  };

	  // The `through` method exists on the Collection as well, for `hasMany` / `belongsToMany` through relations.
	  var collectionThrough = Collection.prototype.through;
	  Collection.prototype.through = function(Target) {
	    return collectionThrough.apply(this, [resolveModel(Target)].concat(_.rest(arguments)));
	  };

	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// Virtuals Plugin
	// Allows getting/setting virtual (computed) properties on model instances.
	// -----
	module.exports = function (Bookshelf) {
	  "use strict";
	  var _         = __webpack_require__(1);
	  var proto     = Bookshelf.Model.prototype;

	  var Model = Bookshelf.Model.extend({
	    outputVirtuals: true,

	    // If virtual properties have been defined they will be created
	    // as simple getters on the model.
	    constructor: function (attributes, options) {
	      proto.constructor.apply(this, arguments);
	      var virtuals = this.virtuals;
	      if (_.isObject(virtuals)) {
	        for (var virtualName in virtuals) {
	          var getter, setter;
	          if (virtuals[virtualName].get) {
	            getter = virtuals[virtualName].get;
	            setter = virtuals[virtualName].set ? virtuals[virtualName].set : undefined;
	          } else {
	            getter = virtuals[virtualName];
	          }
	          Object.defineProperty(this, virtualName, {
	            enumerable: true,
	            get: getter,
	            set: setter
	          });
	        }
	      }
	    },

	    // Passing `{virtuals: true}` or `{virtuals: false}` in the `options`
	    // controls including virtuals on function-level and overrides the
	    // model-level setting
	    toJSON: function(options) {
	      var attrs = proto.toJSON.call(this, options);
	      if (!options || options.virtuals !== false) {
	        if ((options && options.virtuals === true) || this.outputVirtuals) {
	          attrs = _.extend(attrs, getVirtuals(this));
	        }
	      }
	      return attrs;
	    },

	    // Allow virtuals to be fetched like normal properties
	    get: function (attr) {
	      var virtuals = this.virtuals;
	      if (_.isObject(virtuals) && virtuals[attr]) {
	        return getVirtual(this, attr);
	      }
	      return proto.get.apply(this, arguments);
	    },

	    // Allow virtuals to be set like normal properties
	    set: function(key, val, options) {
	      if (key == null) {
	        return this;
	      }
	      if (_.isObject(key)) {
	        return proto.set.call(this, _.omit(key, setVirtual, this), val, options);
	      }
	      if (setVirtual.call(this, val, key)) {
	        return this;
	      }
	      return proto.set.apply(this, arguments);
	    }
	  });

	  // Underscore methods that we want to implement on the Model.
	  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

	  // Mix in each Underscore method as a proxy to `Model#attributes`.
	  _.each(modelMethods, function(method) {
	    Model.prototype[method] = function() {
	      var args = _.toArray(arguments);
	      args.unshift(_.extend({}, this.attributes, getVirtuals(this)));
	      return _[method].apply(_, args);
	    };
	  });

	  function getVirtual(model, virtualName) {
	    var virtuals = model.virtuals;
	    if (_.isObject(virtuals) && virtuals[virtualName]) {
	      return virtuals[virtualName].get ? virtuals[virtualName].get.call(model)
	        : virtuals[virtualName].call(model);
	    }
	  }

	  function getVirtuals(model) {
	    var virtuals, attrs = {};
	    if (virtuals = model.virtuals) {
	      for (var virtualName in virtuals) {
	        attrs[virtualName] = getVirtual(model, virtualName);
	      }
	    }
	    return attrs;
	  }

	  function setVirtual(value, key) {
	    var virtual = this.virtuals && this.virtuals[key];
	    if (virtual) {
	      if (virtual.set) {
	        virtual.set.call(this, value);
	      }
	      return true;
	    }
	  }

	  Bookshelf.Model = Model;
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// Visibility plugin -
	// Useful for hiding/showing particular attributes on `toJSON`.
	// -----
	module.exports = function(Bookshelf) {
	  "use strict";
	  var _      = __webpack_require__(1);
	  var proto  = Bookshelf.Model.prototype;
	  var toJSON = proto.toJSON;

	  var Model = Bookshelf.Model.extend({

	    // Replace with an array of properties to blacklist on `toJSON`.
	    hidden: null,

	    // Replace with an array of properties to whitelist on `toJSON`.
	    visible: null,

	    // If `visible` or `hidden` are specified in the `options` hash,
	    // they're assumed to override whatever is on the model's prototype.
	    constructor: function() {
	      proto.constructor.apply(this, arguments);
	      var options = arguments[1] || {};
	      if (options.visible) {
	        this.visible = _.clone(options.visible);
	      }
	      if (options.hidden) {
	        this.hidden = _.clone(options.hidden);
	      }
	    },

	    // Checks the `visible` and then `hidden` properties to see if there are
	    // any keys we don't want to show when the object is json-ified.
	    toJSON: function() {
	      var json = toJSON.apply(this, arguments);
	      if (this.visible) {
	        json = _.pick.apply(_, [json].concat(this.visible));
	      }
	      if (this.hidden) {
	        json = _.omit.apply(_, [json].concat(this.hidden));
	      }
	      return json;
	    }

	  });

	  Bookshelf.Model = Model;
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	;(function(exports) {

	// export the class if we are in a Node-like system.
	if (typeof module === 'object' && module.exports === exports)
	  exports = module.exports = SemVer;

	// The debug function is excluded entirely from the minified version.

	// Note: this is the semver.org version of the spec that it implements
	// Not necessarily the package version of this code.
	exports.SEMVER_SPEC_VERSION = '2.0.0';

	var MAX_LENGTH = 256;
	var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

	// The actual regexps go on exports.re
	var re = exports.re = [];
	var src = exports.src = [];
	var R = 0;

	// The following Regular Expressions can be used for tokenizing,
	// validating, and parsing SemVer version strings.

	// ## Numeric Identifier
	// A single `0`, or a non-zero digit followed by zero or more digits.

	var NUMERICIDENTIFIER = R++;
	src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
	var NUMERICIDENTIFIERLOOSE = R++;
	src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


	// ## Non-numeric Identifier
	// Zero or more digits, followed by a letter or hyphen, and then zero or
	// more letters, digits, or hyphens.

	var NONNUMERICIDENTIFIER = R++;
	src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


	// ## Main Version
	// Three dot-separated numeric identifiers.

	var MAINVERSION = R++;
	src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
	                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
	                   '(' + src[NUMERICIDENTIFIER] + ')';

	var MAINVERSIONLOOSE = R++;
	src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
	                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
	                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

	// ## Pre-release Version Identifier
	// A numeric identifier, or a non-numeric identifier.

	var PRERELEASEIDENTIFIER = R++;
	src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
	                            '|' + src[NONNUMERICIDENTIFIER] + ')';

	var PRERELEASEIDENTIFIERLOOSE = R++;
	src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
	                                 '|' + src[NONNUMERICIDENTIFIER] + ')';


	// ## Pre-release Version
	// Hyphen, followed by one or more dot-separated pre-release version
	// identifiers.

	var PRERELEASE = R++;
	src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
	                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

	var PRERELEASELOOSE = R++;
	src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
	                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

	// ## Build Metadata Identifier
	// Any combination of digits, letters, or hyphens.

	var BUILDIDENTIFIER = R++;
	src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

	// ## Build Metadata
	// Plus sign, followed by one or more period-separated build metadata
	// identifiers.

	var BUILD = R++;
	src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
	             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


	// ## Full Version String
	// A main version, followed optionally by a pre-release version and
	// build metadata.

	// Note that the only major, minor, patch, and pre-release sections of
	// the version string are capturing groups.  The build metadata is not a
	// capturing group, because it should not ever be used in version
	// comparison.

	var FULL = R++;
	var FULLPLAIN = 'v?' + src[MAINVERSION] +
	                src[PRERELEASE] + '?' +
	                src[BUILD] + '?';

	src[FULL] = '^' + FULLPLAIN + '$';

	// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
	// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
	// common in the npm registry.
	var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
	                 src[PRERELEASELOOSE] + '?' +
	                 src[BUILD] + '?';

	var LOOSE = R++;
	src[LOOSE] = '^' + LOOSEPLAIN + '$';

	var GTLT = R++;
	src[GTLT] = '((?:<|>)?=?)';

	// Something like "2.*" or "1.2.x".
	// Note that "x.x" is a valid xRange identifer, meaning "any version"
	// Only the first item is strictly required.
	var XRANGEIDENTIFIERLOOSE = R++;
	src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
	var XRANGEIDENTIFIER = R++;
	src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

	var XRANGEPLAIN = R++;
	src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
	                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
	                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
	                   '(?:' + src[PRERELEASE] + ')?' +
	                   src[BUILD] + '?' +
	                   ')?)?';

	var XRANGEPLAINLOOSE = R++;
	src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
	                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
	                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
	                        '(?:' + src[PRERELEASELOOSE] + ')?' +
	                        src[BUILD] + '?' +
	                        ')?)?';

	var XRANGE = R++;
	src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
	var XRANGELOOSE = R++;
	src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

	// Tilde ranges.
	// Meaning is "reasonably at or greater than"
	var LONETILDE = R++;
	src[LONETILDE] = '(?:~>?)';

	var TILDETRIM = R++;
	src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
	re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
	var tildeTrimReplace = '$1~';

	var TILDE = R++;
	src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
	var TILDELOOSE = R++;
	src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

	// Caret ranges.
	// Meaning is "at least and backwards compatible with"
	var LONECARET = R++;
	src[LONECARET] = '(?:\\^)';

	var CARETTRIM = R++;
	src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
	re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
	var caretTrimReplace = '$1^';

	var CARET = R++;
	src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
	var CARETLOOSE = R++;
	src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

	// A simple gt/lt/eq thing, or just "" to indicate "any version"
	var COMPARATORLOOSE = R++;
	src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
	var COMPARATOR = R++;
	src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


	// An expression to strip any whitespace between the gtlt and the thing
	// it modifies, so that `> 1.2.3` ==> `>1.2.3`
	var COMPARATORTRIM = R++;
	src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
	                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

	// this one has to use the /g flag
	re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
	var comparatorTrimReplace = '$1$2$3';


	// Something like `1.2.3 - 1.2.4`
	// Note that these all use the loose form, because they'll be
	// checked against either the strict or loose comparator form
	// later.
	var HYPHENRANGE = R++;
	src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
	                   '\\s+-\\s+' +
	                   '(' + src[XRANGEPLAIN] + ')' +
	                   '\\s*$';

	var HYPHENRANGELOOSE = R++;
	src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
	                        '\\s+-\\s+' +
	                        '(' + src[XRANGEPLAINLOOSE] + ')' +
	                        '\\s*$';

	// Star ranges basically just allow anything at all.
	var STAR = R++;
	src[STAR] = '(<|>)?=?\\s*\\*';

	// Compile to actual regexp objects.
	// All are flag-free, unless they were created above with a flag.
	for (var i = 0; i < R; i++) {
	  ;
	  if (!re[i])
	    re[i] = new RegExp(src[i]);
	}

	exports.parse = parse;
	function parse(version, loose) {
	  if (version instanceof SemVer)
	    return version;

	  if (typeof version !== 'string')
	    return null;

	  if (version.length > MAX_LENGTH)
	    return null;

	  var r = loose ? re[LOOSE] : re[FULL];
	  if (!r.test(version))
	    return null;

	  try {
	    return new SemVer(version, loose);
	  } catch (er) {
	    return null;
	  }
	}

	exports.valid = valid;
	function valid(version, loose) {
	  var v = parse(version, loose);
	  return v ? v.version : null;
	}


	exports.clean = clean;
	function clean(version, loose) {
	  var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
	  return s ? s.version : null;
	}

	exports.SemVer = SemVer;

	function SemVer(version, loose) {
	  if (version instanceof SemVer) {
	    if (version.loose === loose)
	      return version;
	    else
	      version = version.version;
	  } else if (typeof version !== 'string') {
	    throw new TypeError('Invalid Version: ' + version);
	  }

	  if (version.length > MAX_LENGTH)
	    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')

	  if (!(this instanceof SemVer))
	    return new SemVer(version, loose);

	  ;
	  this.loose = loose;
	  var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

	  if (!m)
	    throw new TypeError('Invalid Version: ' + version);

	  this.raw = version;

	  // these are actually numbers
	  this.major = +m[1];
	  this.minor = +m[2];
	  this.patch = +m[3];

	  if (this.major > MAX_SAFE_INTEGER || this.major < 0)
	    throw new TypeError('Invalid major version')

	  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
	    throw new TypeError('Invalid minor version')

	  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
	    throw new TypeError('Invalid patch version')

	  // numberify any prerelease numeric ids
	  if (!m[4])
	    this.prerelease = [];
	  else
	    this.prerelease = m[4].split('.').map(function(id) {
	      if (/^[0-9]+$/.test(id)) {
	        var num = +id
	        if (num >= 0 && num < MAX_SAFE_INTEGER)
	          return num
	      }
	      return id;
	    });

	  this.build = m[5] ? m[5].split('.') : [];
	  this.format();
	}

	SemVer.prototype.format = function() {
	  this.version = this.major + '.' + this.minor + '.' + this.patch;
	  if (this.prerelease.length)
	    this.version += '-' + this.prerelease.join('.');
	  return this.version;
	};

	SemVer.prototype.inspect = function() {
	  return '<SemVer "' + this + '">';
	};

	SemVer.prototype.toString = function() {
	  return this.version;
	};

	SemVer.prototype.compare = function(other) {
	  ;
	  if (!(other instanceof SemVer))
	    other = new SemVer(other, this.loose);

	  return this.compareMain(other) || this.comparePre(other);
	};

	SemVer.prototype.compareMain = function(other) {
	  if (!(other instanceof SemVer))
	    other = new SemVer(other, this.loose);

	  return compareIdentifiers(this.major, other.major) ||
	         compareIdentifiers(this.minor, other.minor) ||
	         compareIdentifiers(this.patch, other.patch);
	};

	SemVer.prototype.comparePre = function(other) {
	  if (!(other instanceof SemVer))
	    other = new SemVer(other, this.loose);

	  // NOT having a prerelease is > having one
	  if (this.prerelease.length && !other.prerelease.length)
	    return -1;
	  else if (!this.prerelease.length && other.prerelease.length)
	    return 1;
	  else if (!this.prerelease.length && !other.prerelease.length)
	    return 0;

	  var i = 0;
	  do {
	    var a = this.prerelease[i];
	    var b = other.prerelease[i];
	    ;
	    if (a === undefined && b === undefined)
	      return 0;
	    else if (b === undefined)
	      return 1;
	    else if (a === undefined)
	      return -1;
	    else if (a === b)
	      continue;
	    else
	      return compareIdentifiers(a, b);
	  } while (++i);
	};

	// preminor will bump the version up to the next minor release, and immediately
	// down to pre-release. premajor and prepatch work the same way.
	SemVer.prototype.inc = function(release, identifier) {
	  switch (release) {
	    case 'premajor':
	      this.prerelease.length = 0;
	      this.patch = 0;
	      this.minor = 0;
	      this.major++;
	      this.inc('pre', identifier);
	      break;
	    case 'preminor':
	      this.prerelease.length = 0;
	      this.patch = 0;
	      this.minor++;
	      this.inc('pre', identifier);
	      break;
	    case 'prepatch':
	      // If this is already a prerelease, it will bump to the next version
	      // drop any prereleases that might already exist, since they are not
	      // relevant at this point.
	      this.prerelease.length = 0;
	      this.inc('patch', identifier);
	      this.inc('pre', identifier);
	      break;
	    // If the input is a non-prerelease version, this acts the same as
	    // prepatch.
	    case 'prerelease':
	      if (this.prerelease.length === 0)
	        this.inc('patch', identifier);
	      this.inc('pre', identifier);
	      break;

	    case 'major':
	      // If this is a pre-major version, bump up to the same major version.
	      // Otherwise increment major.
	      // 1.0.0-5 bumps to 1.0.0
	      // 1.1.0 bumps to 2.0.0
	      if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
	        this.major++;
	      this.minor = 0;
	      this.patch = 0;
	      this.prerelease = [];
	      break;
	    case 'minor':
	      // If this is a pre-minor version, bump up to the same minor version.
	      // Otherwise increment minor.
	      // 1.2.0-5 bumps to 1.2.0
	      // 1.2.1 bumps to 1.3.0
	      if (this.patch !== 0 || this.prerelease.length === 0)
	        this.minor++;
	      this.patch = 0;
	      this.prerelease = [];
	      break;
	    case 'patch':
	      // If this is not a pre-release version, it will increment the patch.
	      // If it is a pre-release it will bump up to the same patch version.
	      // 1.2.0-5 patches to 1.2.0
	      // 1.2.0 patches to 1.2.1
	      if (this.prerelease.length === 0)
	        this.patch++;
	      this.prerelease = [];
	      break;
	    // This probably shouldn't be used publicly.
	    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
	    case 'pre':
	      if (this.prerelease.length === 0)
	        this.prerelease = [0];
	      else {
	        var i = this.prerelease.length;
	        while (--i >= 0) {
	          if (typeof this.prerelease[i] === 'number') {
	            this.prerelease[i]++;
	            i = -2;
	          }
	        }
	        if (i === -1) // didn't increment anything
	          this.prerelease.push(0);
	      }
	      if (identifier) {
	        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
	        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
	        if (this.prerelease[0] === identifier) {
	          if (isNaN(this.prerelease[1]))
	            this.prerelease = [identifier, 0];
	        } else
	          this.prerelease = [identifier, 0];
	      }
	      break;

	    default:
	      throw new Error('invalid increment argument: ' + release);
	  }
	  this.format();
	  return this;
	};

	exports.inc = inc;
	function inc(version, release, loose, identifier) {
	  if (typeof(loose) === 'string') {
	    identifier = loose;
	    loose = undefined;
	  }

	  try {
	    return new SemVer(version, loose).inc(release, identifier).version;
	  } catch (er) {
	    return null;
	  }
	}

	exports.diff = diff;
	function diff(version1, version2) {
	  if (eq(version1, version2)) {
	    return null;
	  } else {
	    var v1 = parse(version1);
	    var v2 = parse(version2);
	    if (v1.prerelease.length || v2.prerelease.length) {
	      for (var key in v1) {
	        if (key === 'major' || key === 'minor' || key === 'patch') {
	          if (v1[key] !== v2[key]) {
	            return 'pre'+key;
	          }
	        }
	      }
	      return 'prerelease';
	    }
	    for (var key in v1) {
	      if (key === 'major' || key === 'minor' || key === 'patch') {
	        if (v1[key] !== v2[key]) {
	          return key;
	        }
	      }
	    }
	  }
	}

	exports.compareIdentifiers = compareIdentifiers;

	var numeric = /^[0-9]+$/;
	function compareIdentifiers(a, b) {
	  var anum = numeric.test(a);
	  var bnum = numeric.test(b);

	  if (anum && bnum) {
	    a = +a;
	    b = +b;
	  }

	  return (anum && !bnum) ? -1 :
	         (bnum && !anum) ? 1 :
	         a < b ? -1 :
	         a > b ? 1 :
	         0;
	}

	exports.rcompareIdentifiers = rcompareIdentifiers;
	function rcompareIdentifiers(a, b) {
	  return compareIdentifiers(b, a);
	}

	exports.major = major;
	function major(a, loose) {
	  return new SemVer(a, loose).major;
	}

	exports.minor = minor;
	function minor(a, loose) {
	  return new SemVer(a, loose).minor;
	}

	exports.patch = patch;
	function patch(a, loose) {
	  return new SemVer(a, loose).patch;
	}

	exports.compare = compare;
	function compare(a, b, loose) {
	  return new SemVer(a, loose).compare(b);
	}

	exports.compareLoose = compareLoose;
	function compareLoose(a, b) {
	  return compare(a, b, true);
	}

	exports.rcompare = rcompare;
	function rcompare(a, b, loose) {
	  return compare(b, a, loose);
	}

	exports.sort = sort;
	function sort(list, loose) {
	  return list.sort(function(a, b) {
	    return exports.compare(a, b, loose);
	  });
	}

	exports.rsort = rsort;
	function rsort(list, loose) {
	  return list.sort(function(a, b) {
	    return exports.rcompare(a, b, loose);
	  });
	}

	exports.gt = gt;
	function gt(a, b, loose) {
	  return compare(a, b, loose) > 0;
	}

	exports.lt = lt;
	function lt(a, b, loose) {
	  return compare(a, b, loose) < 0;
	}

	exports.eq = eq;
	function eq(a, b, loose) {
	  return compare(a, b, loose) === 0;
	}

	exports.neq = neq;
	function neq(a, b, loose) {
	  return compare(a, b, loose) !== 0;
	}

	exports.gte = gte;
	function gte(a, b, loose) {
	  return compare(a, b, loose) >= 0;
	}

	exports.lte = lte;
	function lte(a, b, loose) {
	  return compare(a, b, loose) <= 0;
	}

	exports.cmp = cmp;
	function cmp(a, op, b, loose) {
	  var ret;
	  switch (op) {
	    case '===':
	      if (typeof a === 'object') a = a.version;
	      if (typeof b === 'object') b = b.version;
	      ret = a === b;
	      break;
	    case '!==':
	      if (typeof a === 'object') a = a.version;
	      if (typeof b === 'object') b = b.version;
	      ret = a !== b;
	      break;
	    case '': case '=': case '==': ret = eq(a, b, loose); break;
	    case '!=': ret = neq(a, b, loose); break;
	    case '>': ret = gt(a, b, loose); break;
	    case '>=': ret = gte(a, b, loose); break;
	    case '<': ret = lt(a, b, loose); break;
	    case '<=': ret = lte(a, b, loose); break;
	    default: throw new TypeError('Invalid operator: ' + op);
	  }
	  return ret;
	}

	exports.Comparator = Comparator;
	function Comparator(comp, loose) {
	  if (comp instanceof Comparator) {
	    if (comp.loose === loose)
	      return comp;
	    else
	      comp = comp.value;
	  }

	  if (!(this instanceof Comparator))
	    return new Comparator(comp, loose);

	  ;
	  this.loose = loose;
	  this.parse(comp);

	  if (this.semver === ANY)
	    this.value = '';
	  else
	    this.value = this.operator + this.semver.version;

	  ;
	}

	var ANY = {};
	Comparator.prototype.parse = function(comp) {
	  var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
	  var m = comp.match(r);

	  if (!m)
	    throw new TypeError('Invalid comparator: ' + comp);

	  this.operator = m[1];
	  if (this.operator === '=')
	    this.operator = '';

	  // if it literally is just '>' or '' then allow anything.
	  if (!m[2])
	    this.semver = ANY;
	  else
	    this.semver = new SemVer(m[2], this.loose);
	};

	Comparator.prototype.inspect = function() {
	  return '<SemVer Comparator "' + this + '">';
	};

	Comparator.prototype.toString = function() {
	  return this.value;
	};

	Comparator.prototype.test = function(version) {
	  ;

	  if (this.semver === ANY)
	    return true;

	  if (typeof version === 'string')
	    version = new SemVer(version, this.loose);

	  return cmp(version, this.operator, this.semver, this.loose);
	};


	exports.Range = Range;
	function Range(range, loose) {
	  if ((range instanceof Range) && range.loose === loose)
	    return range;

	  if (!(this instanceof Range))
	    return new Range(range, loose);

	  this.loose = loose;

	  // First, split based on boolean or ||
	  this.raw = range;
	  this.set = range.split(/\s*\|\|\s*/).map(function(range) {
	    return this.parseRange(range.trim());
	  }, this).filter(function(c) {
	    // throw out any that are not relevant for whatever reason
	    return c.length;
	  });

	  if (!this.set.length) {
	    throw new TypeError('Invalid SemVer Range: ' + range);
	  }

	  this.format();
	}

	Range.prototype.inspect = function() {
	  return '<SemVer Range "' + this.range + '">';
	};

	Range.prototype.format = function() {
	  this.range = this.set.map(function(comps) {
	    return comps.join(' ').trim();
	  }).join('||').trim();
	  return this.range;
	};

	Range.prototype.toString = function() {
	  return this.range;
	};

	Range.prototype.parseRange = function(range) {
	  var loose = this.loose;
	  range = range.trim();
	  ;
	  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
	  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
	  range = range.replace(hr, hyphenReplace);
	  ;
	  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
	  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
	  ;

	  // `~ 1.2.3` => `~1.2.3`
	  range = range.replace(re[TILDETRIM], tildeTrimReplace);

	  // `^ 1.2.3` => `^1.2.3`
	  range = range.replace(re[CARETTRIM], caretTrimReplace);

	  // normalize spaces
	  range = range.split(/\s+/).join(' ');

	  // At this point, the range is completely trimmed and
	  // ready to be split into comparators.

	  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
	  var set = range.split(' ').map(function(comp) {
	    return parseComparator(comp, loose);
	  }).join(' ').split(/\s+/);
	  if (this.loose) {
	    // in loose mode, throw out any that are not valid comparators
	    set = set.filter(function(comp) {
	      return !!comp.match(compRe);
	    });
	  }
	  set = set.map(function(comp) {
	    return new Comparator(comp, loose);
	  });

	  return set;
	};

	// Mostly just for testing and legacy API reasons
	exports.toComparators = toComparators;
	function toComparators(range, loose) {
	  return new Range(range, loose).set.map(function(comp) {
	    return comp.map(function(c) {
	      return c.value;
	    }).join(' ').trim().split(' ');
	  });
	}

	// comprised of xranges, tildes, stars, and gtlt's at this point.
	// already replaced the hyphen ranges
	// turn into a set of JUST comparators.
	function parseComparator(comp, loose) {
	  ;
	  comp = replaceCarets(comp, loose);
	  ;
	  comp = replaceTildes(comp, loose);
	  ;
	  comp = replaceXRanges(comp, loose);
	  ;
	  comp = replaceStars(comp, loose);
	  ;
	  return comp;
	}

	function isX(id) {
	  return !id || id.toLowerCase() === 'x' || id === '*';
	}

	// ~, ~> --> * (any, kinda silly)
	// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
	// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
	// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
	// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
	// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
	function replaceTildes(comp, loose) {
	  return comp.trim().split(/\s+/).map(function(comp) {
	    return replaceTilde(comp, loose);
	  }).join(' ');
	}

	function replaceTilde(comp, loose) {
	  var r = loose ? re[TILDELOOSE] : re[TILDE];
	  return comp.replace(r, function(_, M, m, p, pr) {
	    ;
	    var ret;

	    if (isX(M))
	      ret = '';
	    else if (isX(m))
	      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
	    else if (isX(p))
	      // ~1.2 == >=1.2.0- <1.3.0-
	      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
	    else if (pr) {
	      ;
	      if (pr.charAt(0) !== '-')
	        pr = '-' + pr;
	      ret = '>=' + M + '.' + m + '.' + p + pr +
	            ' <' + M + '.' + (+m + 1) + '.0';
	    } else
	      // ~1.2.3 == >=1.2.3 <1.3.0
	      ret = '>=' + M + '.' + m + '.' + p +
	            ' <' + M + '.' + (+m + 1) + '.0';

	    ;
	    return ret;
	  });
	}

	// ^ --> * (any, kinda silly)
	// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
	// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
	// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
	// ^1.2.3 --> >=1.2.3 <2.0.0
	// ^1.2.0 --> >=1.2.0 <2.0.0
	function replaceCarets(comp, loose) {
	  return comp.trim().split(/\s+/).map(function(comp) {
	    return replaceCaret(comp, loose);
	  }).join(' ');
	}

	function replaceCaret(comp, loose) {
	  ;
	  var r = loose ? re[CARETLOOSE] : re[CARET];
	  return comp.replace(r, function(_, M, m, p, pr) {
	    ;
	    var ret;

	    if (isX(M))
	      ret = '';
	    else if (isX(m))
	      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
	    else if (isX(p)) {
	      if (M === '0')
	        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
	      else
	        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
	    } else if (pr) {
	      ;
	      if (pr.charAt(0) !== '-')
	        pr = '-' + pr;
	      if (M === '0') {
	        if (m === '0')
	          ret = '>=' + M + '.' + m + '.' + p + pr +
	                ' <' + M + '.' + m + '.' + (+p + 1);
	        else
	          ret = '>=' + M + '.' + m + '.' + p + pr +
	                ' <' + M + '.' + (+m + 1) + '.0';
	      } else
	        ret = '>=' + M + '.' + m + '.' + p + pr +
	              ' <' + (+M + 1) + '.0.0';
	    } else {
	      ;
	      if (M === '0') {
	        if (m === '0')
	          ret = '>=' + M + '.' + m + '.' + p +
	                ' <' + M + '.' + m + '.' + (+p + 1);
	        else
	          ret = '>=' + M + '.' + m + '.' + p +
	                ' <' + M + '.' + (+m + 1) + '.0';
	      } else
	        ret = '>=' + M + '.' + m + '.' + p +
	              ' <' + (+M + 1) + '.0.0';
	    }

	    ;
	    return ret;
	  });
	}

	function replaceXRanges(comp, loose) {
	  ;
	  return comp.split(/\s+/).map(function(comp) {
	    return replaceXRange(comp, loose);
	  }).join(' ');
	}

	function replaceXRange(comp, loose) {
	  comp = comp.trim();
	  var r = loose ? re[XRANGELOOSE] : re[XRANGE];
	  return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
	    ;
	    var xM = isX(M);
	    var xm = xM || isX(m);
	    var xp = xm || isX(p);
	    var anyX = xp;

	    if (gtlt === '=' && anyX)
	      gtlt = '';

	    if (xM) {
	      if (gtlt === '>' || gtlt === '<') {
	        // nothing is allowed
	        ret = '<0.0.0';
	      } else {
	        // nothing is forbidden
	        ret = '*';
	      }
	    } else if (gtlt && anyX) {
	      // replace X with 0
	      if (xm)
	        m = 0;
	      if (xp)
	        p = 0;

	      if (gtlt === '>') {
	        // >1 => >=2.0.0
	        // >1.2 => >=1.3.0
	        // >1.2.3 => >= 1.2.4
	        gtlt = '>=';
	        if (xm) {
	          M = +M + 1;
	          m = 0;
	          p = 0;
	        } else if (xp) {
	          m = +m + 1;
	          p = 0;
	        }
	      } else if (gtlt === '<=') {
	        // <=0.7.x is actually <0.8.0, since any 0.7.x should
	        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
	        gtlt = '<'
	        if (xm)
	          M = +M + 1
	        else
	          m = +m + 1
	      }

	      ret = gtlt + M + '.' + m + '.' + p;
	    } else if (xm) {
	      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
	    } else if (xp) {
	      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
	    }

	    ;

	    return ret;
	  });
	}

	// Because * is AND-ed with everything else in the comparator,
	// and '' means "any version", just remove the *s entirely.
	function replaceStars(comp, loose) {
	  ;
	  // Looseness is ignored here.  star is always as loose as it gets!
	  return comp.trim().replace(re[STAR], '');
	}

	// This function is passed to string.replace(re[HYPHENRANGE])
	// M, m, patch, prerelease, build
	// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
	// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
	// 1.2 - 3.4 => >=1.2.0 <3.5.0
	function hyphenReplace($0,
	                       from, fM, fm, fp, fpr, fb,
	                       to, tM, tm, tp, tpr, tb) {

	  if (isX(fM))
	    from = '';
	  else if (isX(fm))
	    from = '>=' + fM + '.0.0';
	  else if (isX(fp))
	    from = '>=' + fM + '.' + fm + '.0';
	  else
	    from = '>=' + from;

	  if (isX(tM))
	    to = '';
	  else if (isX(tm))
	    to = '<' + (+tM + 1) + '.0.0';
	  else if (isX(tp))
	    to = '<' + tM + '.' + (+tm + 1) + '.0';
	  else if (tpr)
	    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
	  else
	    to = '<=' + to;

	  return (from + ' ' + to).trim();
	}


	// if ANY of the sets match ALL of its comparators, then pass
	Range.prototype.test = function(version) {
	  if (!version)
	    return false;

	  if (typeof version === 'string')
	    version = new SemVer(version, this.loose);

	  for (var i = 0; i < this.set.length; i++) {
	    if (testSet(this.set[i], version))
	      return true;
	  }
	  return false;
	};

	function testSet(set, version) {
	  for (var i = 0; i < set.length; i++) {
	    if (!set[i].test(version))
	      return false;
	  }

	  if (version.prerelease.length) {
	    // Find the set of versions that are allowed to have prereleases
	    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
	    // That should allow `1.2.3-pr.2` to pass.
	    // However, `1.2.4-alpha.notready` should NOT be allowed,
	    // even though it's within the range set by the comparators.
	    for (var i = 0; i < set.length; i++) {
	      ;
	      if (set[i].semver === ANY)
	        return true;

	      if (set[i].semver.prerelease.length > 0) {
	        var allowed = set[i].semver;
	        if (allowed.major === version.major &&
	            allowed.minor === version.minor &&
	            allowed.patch === version.patch)
	          return true;
	      }
	    }

	    // Version has a -pre, but it's not one of the ones we like.
	    return false;
	  }

	  return true;
	}

	exports.satisfies = satisfies;
	function satisfies(version, range, loose) {
	  try {
	    range = new Range(range, loose);
	  } catch (er) {
	    return false;
	  }
	  return range.test(version);
	}

	exports.maxSatisfying = maxSatisfying;
	function maxSatisfying(versions, range, loose) {
	  return versions.filter(function(version) {
	    return satisfies(version, range, loose);
	  }).sort(function(a, b) {
	    return rcompare(a, b, loose);
	  })[0] || null;
	}

	exports.validRange = validRange;
	function validRange(range, loose) {
	  try {
	    // Return '*' instead of '' so that truthiness works.
	    // This will throw if it's invalid anyway
	    return new Range(range, loose).range || '*';
	  } catch (er) {
	    return null;
	  }
	}

	// Determine if version is less than all the versions possible in the range
	exports.ltr = ltr;
	function ltr(version, range, loose) {
	  return outside(version, range, '<', loose);
	}

	// Determine if version is greater than all the versions possible in the range.
	exports.gtr = gtr;
	function gtr(version, range, loose) {
	  return outside(version, range, '>', loose);
	}

	exports.outside = outside;
	function outside(version, range, hilo, loose) {
	  version = new SemVer(version, loose);
	  range = new Range(range, loose);

	  var gtfn, ltefn, ltfn, comp, ecomp;
	  switch (hilo) {
	    case '>':
	      gtfn = gt;
	      ltefn = lte;
	      ltfn = lt;
	      comp = '>';
	      ecomp = '>=';
	      break;
	    case '<':
	      gtfn = lt;
	      ltefn = gte;
	      ltfn = gt;
	      comp = '<';
	      ecomp = '<=';
	      break;
	    default:
	      throw new TypeError('Must provide a hilo val of "<" or ">"');
	  }

	  // If it satisifes the range it is not outside
	  if (satisfies(version, range, loose)) {
	    return false;
	  }

	  // From now on, variable terms are as if we're in "gtr" mode.
	  // but note that everything is flipped for the "ltr" function.

	  for (var i = 0; i < range.set.length; ++i) {
	    var comparators = range.set[i];

	    var high = null;
	    var low = null;

	    comparators.forEach(function(comparator) {
	      high = high || comparator;
	      low = low || comparator;
	      if (gtfn(comparator.semver, high.semver, loose)) {
	        high = comparator;
	      } else if (ltfn(comparator.semver, low.semver, loose)) {
	        low = comparator;
	      }
	    });

	    // If the edge version comparator has a operator then our version
	    // isn't outside it
	    if (high.operator === comp || high.operator === ecomp) {
	      return false;
	    }

	    // If the lowest version comparator has an operator and our version
	    // is less than it then it isn't higher than the range
	    if ((!low.operator || low.operator === comp) &&
	        ltefn(version, low.semver)) {
	      return false;
	    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
	      return false;
	    }
	  }
	  return true;
	}

	// Use the define() function if we're in AMD land
	if (false)
	  define(exports);

	})(
	  true ? exports :
	  typeof define === 'function' && define.amd ? {} :
	  semver = {}
	);


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(23)
	var helpers = __webpack_require__(2)

	Promise.prototype.yield = function() {
	  helpers.deprecate('.yield', '.return')
	  return this.return.apply(this, arguments);
	}
	Promise.prototype.ensure = function() {
	  helpers.deprecate('.ensure', '.finally')
	  return this.finally.apply(this, arguments);
	}
	Promise.prototype.otherwise = function() {
	  helpers.deprecate('.otherwise', '.catch')
	  return this.catch.apply(this, arguments);
	}
	Promise.prototype.exec = function() {
	  helpers.deprecate('bookshelf.exec', 'bookshelf.asCallback')
	  return this.nodeify.apply(this, arguments);
	};

	module.exports = Promise

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// Sync
	// ---------------
	var _       = __webpack_require__(1);
	var Promise = __webpack_require__(15);

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
	    var knex           = this.query
	      , options        = this.options
	      , relatedData    = this.syncing.relatedData
	      , columnsInQuery = _.some(knex._statements, {grouping:'columns'})
	      , columns;

	    if (!relatedData) {
	      columns = options.columns;
	      // Call the function, if one exists, to constrain the eager loaded query.
	      if (options._beforeFn) options._beforeFn.call(knex, knex);
	      if (!_.isArray(columns)) {
	        columns = columns ? [columns] :
	          // if columns have been selected in a query closure, use them.
	          // any user who does this is responsible for prefixing each
	          // selected column with the correct table name. this will also
	          // break withRelated queries if the dependent fkey fields are not
	          // manually included. this is a temporary hack which will be
	          // replaced by an upcoming rewrite.
	          columnsInQuery ? [] : [_.result(this.syncing, 'tableName') + '.*'];
	      }
	    }

	    // Set the query builder on the options, in-case we need to
	    // access in the `fetching` event handlers.
	    options.query = knex;

	    return Promise.bind(this).then(function () {
	      var fks = {}
	        , through;

	      // Inject all appropriate select costraints dealing with the relation
	      // into the `knex` query builder for the current instance.
	      if (relatedData) {
	        if (relatedData.throughTarget) {
	          fks[relatedData.key('foreignKey')] = relatedData.parentFk;
	          through = new relatedData.throughTarget(fks);
	          return through.triggerThen('fetching', through, relatedData.pivotColumns, options)
	            .then(function () {
	              relatedData.pivotColumns = through.parse(relatedData.pivotColumns);
	              relatedData.selectConstraints(knex, options);
	            });
	        } else {
	          relatedData.selectConstraints(knex, options);
	        }
	      }
	    }).then(function () {
	      return this.syncing.triggerThen('fetching', this.syncing, columns, options);
	    }).then(function() {
	      return knex.select(columns);
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


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	// EagerRelation
	// ---------------
	var _         = __webpack_require__(1);
	var inherits  = __webpack_require__(13);

	var Helpers   = __webpack_require__(2);
	var Promise   = __webpack_require__(15);
	var EagerBase = __webpack_require__(25);

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
	      var typeKeyName = relatedData.columnNames && relatedData.columnNames[0] ? relatedData.columnNames[0] : relatedData.morphName + '_type';
	      return m.get(typeKeyName);
	    });
	    var pending = _.reduce(groups, function(memo, val, group) {
	      var Target = Helpers.morphCandidate(relatedData.candidates, group);
	      var target = new Target();
	      var idKeyName = relatedData.columnNames && relatedData.columnNames[1] ? relatedData.columnNames[1] : relatedData.morphName + '_id';
	      memo.push(target
	        .query('whereIn',
	          _.result(target, 'idAttribute'),
	          _.uniq(_.invoke(groups[group], 'get', idKeyName))
	        )
	        .sync(options)
	        .select()
	        .bind(this)
	        .tap(function(response) {
	          return this._eagerLoadHelper(response, relationName, {
	            relatedData: relatedData.instance('morphTo', Target, {morphName: relatedData.morphName, columnNames: relatedData.columnNames})
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


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// Base Model
	// ---------------
	var _        = __webpack_require__(1);
	var inherits = __webpack_require__(13);

	var Events   = __webpack_require__(3);
	var Promise  = __webpack_require__(15);
	var Errors   = __webpack_require__(7);
	var slice    = Array.prototype.slice

	// List of attributes attached directly from the `options` passed to the constructor.
	var modelProps = ['tableName', 'hasTimestamps'];

	// The "ModelBase" is similar to the 'Active Model' in Rails,
	// it defines a standard interface from which other objects may inherit.
	function ModelBase(attributes, options) {
	  var attrs = attributes || {};
	  options   = options    || {};
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
	}
	inherits(ModelBase, Events);

	ModelBase.prototype.initialize = function() {};

	// The default value for the "id" attribute.
	ModelBase.prototype.idAttribute = 'id';

	// Get the value of an attribute.
	ModelBase.prototype.get = function(attr) {
	  return this.attributes[attr];
	};

	// Set a property.
	ModelBase.prototype.set = function(key, val, options) {
	  if (key == null) return this;
	  var attrs;

	  // Handle both `"key", value` and `{key: value}` -style arguments.
	  if (typeof key === 'object') {
	    attrs = key;
	    options = val;
	  } else {
	    (attrs = {})[key] = val;
	  }
	  options = _.clone(options) || {};

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
	  return this;
	};

	// A model is new if it has never been persisted, which we assume if it lacks an id.
	ModelBase.prototype.isNew = function() {
	  return this.id == null;
	};

	// Returns an object containing a shallow copy of the model attributes,
	// along with the `toJSON` value of any relations,
	// unless `{shallow: true}` is passed in the `options`.
	ModelBase.prototype.toJSON = function(options) {
	  var attrs = _.clone(this.attributes);
	  if (options && options.shallow) return attrs;
	  var relations = this.relations;
	  for (var key in relations) {
	    var relation = relations[key];
	    attrs[key] = relation.toJSON ? relation.toJSON(options) : relation;
	  }
	  if (this.pivot) {
	    var pivot = this.pivot.attributes;
	    for (key in pivot) {
	      attrs['_pivot_' + key] = pivot[key];
	    }
	  }
	  return attrs;
	};

	// Returns the string representation of the object.
	ModelBase.prototype.toString = function() {
	  return '[Object Model]';
	};

	// Get the HTML-escaped value of an attribute.
	ModelBase.prototype.escape = function(key) {
	  return _.escape(this.get(key));
	};

	// Returns `true` if the attribute contains a value that is not null
	// or undefined.
	ModelBase.prototype.has = function(attr) {
	  return this.get(attr) != null;
	};

	// **parse** converts a response into the hash of attributes to be `set` on
	// the model. The default implementation is just to pass the response along.
	ModelBase.prototype.parse = function(resp, options) {
	  return resp;
	};

	// Remove an attribute from the model, firing `"change"`. `unset` is a noop
	// if the attribute doesn't exist.
	ModelBase.prototype.unset = function(attr, options) {
	  return this.set(attr, void 0, _.extend({}, options, {unset: true}));
	};

	// Clear all attributes on the model, firing `"change"`.
	ModelBase.prototype.clear = function(options) {
	  var attrs = {};
	  for (var key in this.attributes) attrs[key] = void 0;
	  return this.set(attrs, _.extend({}, options, {unset: true}));
	};

	// **format** converts a model into the values that should be saved into
	// the database table. The default implementation is just to pass the data along.
	ModelBase.prototype.format = function(attrs, options) {
	  return attrs;
	};

	// Returns the related item, or creates a new
	// related item by creating a new model or collection.
	ModelBase.prototype.related = function(name) {
	  return this.relations[name] || (this[name] ? this.relations[name] = this[name]() : void 0);
	};

	// Create a new model with identical attributes to this one,
	// including any relations on the current model.
	ModelBase.prototype.clone = function(options) {
	  var model = new this.constructor(this.attributes);
	  var relations = this.relations;
	  for (var key in relations) {
	    model.relations[key] = relations[key].clone();
	  }
	  model._previousAttributes = _.clone(this._previousAttributes);
	  model.changed = setProps(Object.create(null), this.changed);
	  return model;
	};

	// Sets the timestamps before saving the model.
	ModelBase.prototype.timestamp = function(options) {
	  var d = new Date();
	  var keys = (_.isArray(this.hasTimestamps) ? this.hasTimestamps : ['created_at', 'updated_at']);
	  var vals = {};
	  if (keys[1]) vals[keys[1]] = d;
	  if (this.isNew(options) && keys[0] && (!options || options.method !== 'update')) vals[keys[0]] = d;
	  return vals;
	};

	// Determine if the model has changed since the last `"change"` event.
	// If you specify an attribute name, determine if that attribute has changed.
	ModelBase.prototype.hasChanged = function(attr) {
	  if (attr == null) return !_.isEmpty(this.changed);
	  return _.has(this.changed, attr);
	};

	// Get the previous value of an attribute, recorded at the time the last
	// `"change"` event was fired.
	ModelBase.prototype.previous = function(attr) {
	  if (attr == null || !this._previousAttributes) return null;
	  return this._previousAttributes[attr];
	};

	// Get all of the attributes of the model at the time of the previous
	// `"change"` event.
	ModelBase.prototype.previousAttributes = function() {
	  return _.clone(this._previousAttributes);
	};

	// Resets the `_previousAttributes` and `changed` hash for the model.
	// Typically called after a `sync` action (save, fetch, delete) -
	ModelBase.prototype._reset = function() {
	  this._previousAttributes = _.clone(this.attributes);
	  this.changed = Object.create(null);
	  return this;
	};

	// Set the changed properties on the object.
	function setProps(obj, hash) {
	  var i = -1, keys = Object.keys(hash);
	  while (++i < hash.length) {
	    var key = hash[i]
	    obj[key] = hash[key];
	  }
	}

	// "_" methods that we want to implement on the Model.
	var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

	// Mix in each "_" method as a proxy to `Model#attributes`.
	_.each(modelMethods, function(method) {
	  ModelBase.prototype[method] = function() {
	    var args = slice.call(arguments);
	    args.unshift(this.attributes);
	    return _[method].apply(_, args);
	  };
	});

	ModelBase.extend = __webpack_require__(26);

	module.exports = ModelBase;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// Base Collection
	// ---------------

	// All exernal dependencies required in this scope.
	var _         = __webpack_require__(1);
	var inherits  = __webpack_require__(13);

	// All components that need to be referenced in this scope.
	var Events    = __webpack_require__(3);
	var Promise   = __webpack_require__(15);
	var ModelBase = __webpack_require__(18);

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

	CollectionBase.extend = __webpack_require__(26);

	module.exports = CollectionBase;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// Base Relation
	// ---------------

	var _              = __webpack_require__(1);
	var CollectionBase = __webpack_require__(19);

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

	RelationBase.extend = __webpack_require__(26);

	module.exports = RelationBase;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	var escapeStringRegexp = __webpack_require__(28);
	var ansiStyles = __webpack_require__(29);
	var stripAnsi = __webpack_require__(30);
	var hasAnsi = __webpack_require__(31);
	var supportsColor = __webpack_require__(32);
	var defineProps = Object.defineProperties;

	function Chalk(options) {
		// detect mode if not set manually
		this.enabled = !options || options.enabled === undefined ? supportsColor : options.enabled;
	}

	// use bright blue on Windows as the normal blue color is illegible
	if (process.platform === 'win32') {
		ansiStyles.blue.open = '\u001b[94m';
	}

	function build(_styles) {
		var builder = function builder() {
			return applyStyle.apply(builder, arguments);
		};
		builder._styles = _styles;
		builder.enabled = this.enabled;
		// __proto__ is used because we must return a function, but there is
		// no way to create a function with a different prototype.
		builder.__proto__ = proto;
		return builder;
	}

	var styles = (function () {
		var ret = {};

		Object.keys(ansiStyles).forEach(function (key) {
			ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

			ret[key] = {
				get: function () {
					return build.call(this, this._styles.concat(key));
				}
			};
		});

		return ret;
	})();

	var proto = defineProps(function chalk() {}, styles);

	function applyStyle() {
		// support varags, but simply cast to string in case there's only one arg
		var args = arguments;
		var argsLen = args.length;
		var str = argsLen !== 0 && String(arguments[0]);
		if (argsLen > 1) {
			// don't slice `arguments`, it prevents v8 optimizations
			for (var a = 1; a < argsLen; a++) {
				str += ' ' + args[a];
			}
		}

		if (!this.enabled || !str) {
			return str;
		}

		/*jshint validthis: true */
		var nestedStyles = this._styles;

		var i = nestedStyles.length;
		while (i--) {
			var code = ansiStyles[nestedStyles[i]];
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			str = code.open + str.replace(code.closeRe, code.open) + code.close;
		}

		return str;
	}

	function init() {
		var ret = {};

		Object.keys(styles).forEach(function (name) {
			ret[name] = {
				get: function () {
					return build.call(this, [name]);
				}
			};
		});

		return ret;
	}

	defineProps(Chalk.prototype, init());

	module.exports = new Chalk();
	module.exports.styles = ansiStyles;
	module.exports.hasColor = hasAnsi;
	module.exports.stripColor = stripAnsi;
	module.exports.supportsColor = supportsColor;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)))

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        len = arguments.length;
	        args = new Array(len - 1);
	        for (i = 1; i < len; i++)
	          args[i - 1] = arguments[i];
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++)
	      args[i - 1] = arguments[i];

	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    var m;
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  var ret;
	  if (!emitter._events || !emitter._events[type])
	    ret = 0;
	  else if (isFunction(emitter._events[type]))
	    ret = 1;
	  else
	    ret = emitter._events[type].length;
	  return ret;
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_23__;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	//     create-error.js 0.3.1
	//     (c) 2013 Tim Griesser
	//     This source may be freely distributed under the MIT license.
	(function(factory) {

	"use strict";

	// A simple utility for subclassing the "Error"
	// object in multiple environments, while maintaining
	// relevant stack traces, messages, and prototypes.
	factory(function() {

	var toString = Object.prototype.toString;

	// Creates an new error type with a "name",
	// and any additional properties that should be set
	// on the error instance.
	return function() {
	  var args = new Array(arguments.length);
	  for (var i = 0; i < args.length; ++i) {
	    args[i] = arguments[i];
	  }
	  var name       = getName(args);
	  var target     = getTarget(args);
	  var properties = getProps(args);
	  function ErrorCtor(message, obj) {
	    attachProps(this, properties);
	    attachProps(this, obj);
	    this.message = (message || this.message);
	    if (message instanceof Error) {
	      this.message = message.message;
	      this.stack = message.stack;
	    } else if (Error.captureStackTrace) {
	      Error.captureStackTrace(this, this.constructor);
	    }
	  }
	  function Err() { this.constructor = ErrorCtor; }
	  Err.prototype = target['prototype'];
	  ErrorCtor.prototype = new Err();
	  ErrorCtor.prototype.name = ('' + name) || 'CustomError';
	  return ErrorCtor;
	};

	// Just a few helpers to clean up the function above
	// https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
	function getName(args) {
	  if (args.length === 0) return '';
	  return isError(args[0]) ? (args[1] || '') : args[0];
	}
	function getTarget(args) {
	  if (args.length === 0) return Error;
	  return isError(args[0]) ? args[0] : Error;
	}
	function getProps(args) {
	  if (args.length === 0) return null;
	  return isError(args[0]) ? args[2] : args[1];
	}
	function inheritedKeys(obj) {
	  var ret = [];
	  for (var key in obj) {
	    ret.push(key);
	  }
	  return ret;
	}

	// Right now we're just assuming that a function in the first argument is an error.
	function isError(obj) {
	  return (typeof obj === "function");
	}

	// We don't need the full underscore check here, since it should either be
	// an object-literal, or nothing at all.
	function isObject(obj) {
	  return (obj && typeof obj === "object" && toString.call(obj) === "[object Object]");
	}

	// Used to attach attributes to the error object in the constructor.
	function attachProps(context, target) {
	  if (isObject(target)) {
	    var keys = inheritedKeys(target);
	    for (var i = 0, l = keys.length; i < l; ++i) {
	      context[keys[i]] = clone(target[keys[i]]);
	    }
	  }
	}

	// Don't need the full-out "clone" mechanism here, since if you're
	// trying to set things other than empty arrays/objects on your
	// sub-classed `Error` object, you're probably doing it wrong.
	function clone(target) {
	  if (target == null || typeof target !== "object") return target;
	  var cloned = target.constructor ? target.constructor() : Object.create(null);
	  for (var attr in target) {
	    if (target.hasOwnProperty(attr)) {
	      cloned[attr] = target[attr];
	    }
	  }
	  return cloned;
	}

	});

	// Boilerplate UMD definition block...
	})(function(createErrorLib) {
	  if (false) {
	    define(createErrorLib);
	  } else if (true) {
	    module.exports = createErrorLib();
	  } else {
	    var root = this;
	    var lastcreateError = root.createError;
	    var createError = root.createError = createErrorLib();
	    createError.noConflict = function() {
	      root.createError = lastcreateError;
	      return createError;
	    };
	  }
	});


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// Eager Base
	// ---------------

	// The EagerBase provides a scaffold for handling with eager relation
	// pairing, by queueing the appropriate related method calls with
	// a database specific `eagerFetch` method, which then may utilize
	// `pushModels` for pairing the models depending on the database need.

	var _         = __webpack_require__(1);
	var Promise   = __webpack_require__(15);

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
	        _beforeFn: withRelated[relationName] || noop
	      })));
	    }

	    // Return a deferred handler for all of the nested object sync
	    // returning the original response when these syncs & pairings are complete.
	    return Promise.all(pendingDeferred).return(this.parentResponse);
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

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	
	// Uses a hash of prototype properties and class properties to be extended.
	module.exports = function(protoProps, staticProps) {
	  var parent = this;
	  var child;

	  // The constructor function for the new subclass is either defined by you
	  // (the "constructor" property in your `extend` definition), or defaulted
	  // by us to simply call the parent's constructor.
	  if (protoProps && protoProps.hasOwnProperty('constructor')) {
	    child = protoProps.constructor;
	  } else {
	    child = function(){ parent.apply(this, arguments); };
	  }

	  // Set the prototype chain to inherit from `Parent`
	  child.prototype = Object.create(parent.prototype)

	  if (protoProps) {
	    var i = -1, keys = Object.keys(protoProps)
	    while (++i < keys.length) {
	      var key = keys[i]
	      child.prototype[key] = protoProps[key]
	    }    
	  }

	  if (staticProps) {
	    keys = Object.keys(staticProps)
	    i = -1
	    while (++i < keys.length) {
	      var key = keys[i]
	      child[key] = staticProps[key]
	    }
	  }

	  // Correctly set child's `prototype.constructor`.
	  child.prototype.constructor = child;

	  // Add static properties to the constructor function, if supplied.
	  child.__proto__ = parent

	  // If there is an "extended" function set on the parent,
	  // call it with the extended child object.
	  if (typeof parent.extended === "function") parent.extended(child);

	  return child;
	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    draining = true;
	    var currentQueue;
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        var i = -1;
	        while (++i < len) {
	            currentQueue[i]();
	        }
	        len = queue.length;
	    }
	    draining = false;
	}
	process.nextTick = function (fun) {
	    queue.push(fun);
	    if (!draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

	module.exports = function (str) {
		if (typeof str !== 'string') {
			throw new TypeError('Expected a string');
		}

		return str.replace(matchOperatorsRe,  '\\$&');
	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var styles = module.exports = {
		modifiers: {
			reset: [0, 0],
			bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		colors: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39]
		},
		bgColors: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49]
		}
	};

	// fix humans
	styles.colors.grey = styles.colors.gray;

	Object.keys(styles).forEach(function (groupName) {
		var group = styles[groupName];

		Object.keys(group).forEach(function (styleName) {
			var style = group[styleName];

			styles[styleName] = group[styleName] = {
				open: '\u001b[' + style[0] + 'm',
				close: '\u001b[' + style[1] + 'm'
			};
		});

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	});


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ansiRegex = __webpack_require__(33)();

	module.exports = function (str) {
		return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
	};


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ansiRegex = __webpack_require__(34);
	var re = new RegExp(ansiRegex().source); // remove the `g` flag
	module.exports = re.test.bind(re);


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	var argv = process.argv;

	module.exports = (function () {
		if ('FORCE_COLOR' in process.env) {
			return true;
		}

		if (argv.indexOf('--no-color') !== -1 ||
			argv.indexOf('--no-colors') !== -1 ||
			argv.indexOf('--color=false') !== -1) {
			return false;
		}

		if (argv.indexOf('--color') !== -1 ||
			argv.indexOf('--colors') !== -1 ||
			argv.indexOf('--color=true') !== -1 ||
			argv.indexOf('--color=always') !== -1) {
			return true;
		}

		if (process.stdout && !process.stdout.isTTY) {
			return false;
		}

		if (process.platform === 'win32') {
			return true;
		}

		if ('COLORTERM' in process.env) {
			return true;
		}

		if (process.env.TERM === 'dumb') {
			return false;
		}

		if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
			return true;
		}

		return false;
	})();

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)))

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	module.exports = function () {
		return /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/g;
	};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	module.exports = function () {
		return /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/g;
	};


/***/ }
/******/ ])
});
;