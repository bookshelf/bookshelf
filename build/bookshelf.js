(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("lodash"), require("inflection"), require("bluebird"));
	else if(typeof define === 'function' && define.amd)
		define(["lodash", "inflection", "bluebird"], factory);
	else if(typeof exports === 'object')
		exports["Bookshelf"] = factory(require("lodash"), require("inflection"), require("bluebird"));
	else
		root["Bookshelf"] = factory(root["_"], root["inflection"], root["Promise"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_40__) {
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

	__webpack_require__(3);

	/**
	 * (c) 2014 Tim Griesser
	 * Bookshelf may be freely distributed under the MIT license.
	 * For all details and documentation:
	 * http://bookshelfjs.org
	 *
	 * version 0.9.1
	 *
	 */
	module.exports = __webpack_require__(1).default;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _lodash = __webpack_require__(2);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _helpers = __webpack_require__(4);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _events = __webpack_require__(5);

	var _events2 = _interopRequireDefault(_events);

	var _model = __webpack_require__(6);

	var _model2 = _interopRequireDefault(_model);

	var _collection = __webpack_require__(7);

	var _collection2 = _interopRequireDefault(_collection);

	var _relation2 = __webpack_require__(8);

	var _relation3 = _interopRequireDefault(_relation2);

	var _errors = __webpack_require__(9);

	var _errors2 = _interopRequireDefault(_errors);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @class Bookshelf
	 * @classdesc
	 *
	 * The Bookshelf library is initialized by passing an initialized Knex client
	 * instance. The knex documentation provides a number of examples for different
	 * databases.
	 *
	 * @constructor
	 * @param {Knex} knex Knex instance.
	 */

	// All core modules required for the bookshelf instance.
	function Bookshelf(knex) {
	  var bookshelf = {
	    VERSION: '0.9.1'
	  };

	  var Model = bookshelf.Model = _model2.default.extend({

	    _builder: builderFn,

	    // The `Model` constructor is referenced as a property on the `Bookshelf` instance,
	    // mixing in the correct `builder` method, as well as the `relation` method,
	    // passing in the correct `Model` & `Collection` constructors for later reference.
	    _relation: function _relation(type, Target, options) {
	      if (type !== 'morphTo' && !_lodash2.default.isFunction(Target)) {
	        throw new Error('A valid target model must be defined for the ' + _lodash2.default.result(this, 'tableName') + ' ' + type + ' relation');
	      }
	      return new Relation(type, Target, options);
	    }
	  }, {

	    /**
	     * @method Model.forge
	     * @belongsTo Model
	     * @description
	     *
	     * A simple helper function to instantiate a new Model without needing `new`.
	     *
	     * @param {Object=} attributes Initial values for this model's attributes.
	     * @param {Object=}  options               Hash of options.
	     * @param {string=}  options.tableName     Initial value for {@linkcode Model#tableName tableName}.
	     * @param {boolean=} [options.hasTimestamps=false]
	     *
	     *   Initial value for {@linkcode Model#hasTimestamps hasTimestamps}.
	     *
	     * @param {boolean} [options.parse=false]
	     *
	     *   Convert attributes by {@linkcode Model#parse parse} before being
	     *   {@linkcode Model#set set} on the `model`.
	     */
	    forge: forge,

	    /**
	     * @method Model.collection
	     * @belongsTo Model
	     * @description
	     *
	     * A simple static helper to instantiate a new {@link Collection}, setting
	     * the current `model` as the collection's target.
	     *
	     * @example
	     *
	     * Customer.collection().fetch().then(function(collection) {
	     *   // ...
	     * })
	     *
	     * @param {(Model[])=} models
	     * @param {Object=} options
	     * @returns {Collection}
	     */
	    collection: function collection(models, options) {
	      return new bookshelf.Collection(models || [], _lodash2.default.extend({}, options, { model: this }));
	    },

	    /**
	     * @method Model.count
	     * @belongsTo Model
	     * @since 0.8.2
	     * @description
	     *
	     * Gets the number of matching records in the database, respecting any
	     * previous calls to {@link Model#query query}. If a `column` is provided,
	     * records with a null value in that column will be excluded from the count.
	     *
	     * @param {string} [column='*']
	     *   Specify a column to count - rows with null values in this column will be excluded.
	     * @param {Object=} options
	     *   Hash of options.
	     * @returns {Promise<Number>}
	     *   A promise resolving to the number of matching rows.
	     */
	    count: function count(column, options) {
	      return this.forge().count(column, options);
	    },

	    /**
	     * @method Model.fetchAll
	     * @belongsTo Model
	     * @description
	     *
	     * Simple helper function for retrieving all instances of the given model.
	     *
	     * @see Model#fetchAll
	     * @returns {Promise<Collection>}
	     */
	    fetchAll: function fetchAll(options) {
	      return this.forge().fetchAll(options);
	    }
	  });

	  var Collection = bookshelf.Collection = _collection2.default.extend({

	    _builder: builderFn

	  }, {

	    /**
	     * @method Collection.forge
	     * @belongsTo Collection
	     * @description
	     *
	     * A simple helper function to instantiate a new Collection without needing
	     * new.
	     *
	     * @param {(Object[]|Model[])=} [models]
	     *   Set of models (or attribute hashes) with which to initialize the
	     *   collection.
	     * @param {Object} options Hash of options.
	     *
	     * @example
	     *
	     * var Promise = require('bluebird');
	     * var Accounts = bookshelf.Collection.extend({
	     *   model: Account
	     * });
	     *
	     * var accounts = Accounts.forge([
	     *   {name: 'Person1'},
	     *   {name: 'Person2'}
	     * ])
	     *
	     * Promise.all(accounts.invoke('save')).then(function() {
	     *   // collection models should now be saved...
	     * });
	     */
	    forge: forge

	  });

	  // The collection also references the correct `Model`, specified above, for creating
	  // new `Model` instances in the collection.
	  Collection.prototype.model = Model;
	  Model.prototype.Collection = Collection;

	  var Relation = _relation3.default.extend({
	    Model: Model, Collection: Collection
	  });

	  // A `Bookshelf` instance may be used as a top-level pub-sub bus, as it mixes in the
	  // `Events` object. It also contains the version number, and a `Transaction` method
	  // referencing the correct version of `knex` passed into the object.
	  _lodash2.default.extend(bookshelf, _events2.default, _errors2.default, {

	    /**
	     * @method Bookshelf#transaction
	     * @memberOf Bookshelf
	     * @description
	     *
	     * An alias to `{@link http://knexjs.org/#Transactions
	     * Knex#transaction}`, the `transaction` object must be passed along in the
	     * options of any relevant Bookshelf calls, to ensure all queries are on the
	     * same connection. The entire transaction block is a promise that will
	     * resolve when the transaction is committed, or fail if the transaction is
	     * rolled back.
	     *
	     *     var Promise = require('bluebird');
	     *     
	     *     Bookshelf.transaction(function(t) {
	     *       return new Library({name: 'Old Books'})
	     *         .save(null, {transacting: t})
	     *         .tap(function(model) {
	     *           return Promise.map([
	     *             {title: 'Canterbury Tales'},
	     *             {title: 'Moby Dick'},
	     *             {title: 'Hamlet'}
	     *           ], function(info) {
	     *     
	     *             // Some validation could take place here.
	     *             return new Book(info).save({'shelf_id': model.id}, {transacting: t});
	     *           });
	     *         });
	     *     }).then(function(library) {
	     *       console.log(library.related('books').pluck('title'));
	     *     }).catch(function(err) {
	     *       console.error(err);
	     *     });
	     *
	     * @param {Bookshelf~transactionCallback} transactionCallback
	     *    Callback containing transaction logic. The callback should return a
	     *    promise.
	     *
	     * @returns {Promise<mixed>}
	     *    A promise resolving to the value returned from {@link
	     *    Bookshelf~transactionCallback transactionCallback}.
	     */

	    transaction: function transaction() {
	      return this.knex.transaction.apply(this, arguments);
	    },

	    /**
	     * @callback Bookshelf~transactionCallback
	     * @description
	     *
	     * A transaction block to be provided to {@link Bookshelf#transaction}.
	     *
	     * @see {@link http://knexjs.org/#Transactions Knex#transaction}
	     * @see Bookshelf#transaction
	     *
	     * @param {Transaction} transaction
	     * @returns {Promise<mixed>}
	     */

	    // Provides a nice, tested, standardized way of adding plugins to a `Bookshelf` instance,
	    // injecting the current instance into the plugin, which should be a module.exports.
	    plugin: function plugin(_plugin, options) {
	      var _this = this;

	      if (_lodash2.default.isString(_plugin)) {
	        try {
	          __webpack_require__(10)("./" + _plugin)(this, options);
	        } catch (e) {
	          if (e.code !== 'MODULE_NOT_FOUND') {
	            throw e;
	          }
	          if (false) {
	            require(_plugin)(this, options);
	          }
	        }
	      } else if (_lodash2.default.isArray(_plugin)) {
	        _lodash2.default.each(_plugin, function (p) {
	          _this.plugin(p, options);
	        });
	      } else {
	        _plugin(this, options);
	      }
	      return this;
	    }
	  });

	  /**
	   * @member Bookshelf#knex
	   * @memberOf Bookshelf
	   * @type {Knex}
	   * @description
	   * A reference to the {@link http://knexjs.org Knex.js} instance being used by Bookshelf.
	   */
	  bookshelf.knex = knex;

	  // The `forge` function properly instantiates a new Model or Collection
	  // without needing the `new` operator... to make object creation cleaner
	  // and more chainable.
	  function forge() {
	    var inst = Object.create(this.prototype);
	    var obj = this.apply(inst, arguments);
	    return Object(obj) === obj ? obj : inst;
	  }

	  function builderFn(tableNameOrBuilder) {
	    var _this2 = this;

	    var builder = null;

	    if (_lodash2.default.isString(tableNameOrBuilder)) {
	      builder = knex(tableNameOrBuilder);
	    } else if (tableNameOrBuilder == null) {
	      builder = knex.queryBuilder();
	    } else {
	      // Assuming here that `tableNameOrBuilder` is a QueryBuilder instance. Not
	      // aware of a way to check that this is the case (ie. using
	      // `Knex.isQueryBuilder` or equivalent).
	      builder = tableNameOrBuilder;
	    }

	    return builder.on('query', function (data) {
	      return _this2.trigger('query', data);
	    });
	  }

	  // Attach `where`, `query`, and `fetchAll` as static methods.
	  ['where', 'query'].forEach(function (method) {
	    Model[method] = Collection[method] = function () {
	      var model = this.forge();
	      return model[method].apply(model, arguments);
	    };
	  });

	  return bookshelf;
	}

	// Constructor for a new `Bookshelf` object, it accepts
	// an active `knex` instance and initializes the appropriate
	// `Model` and `Collection` constructors for use in the current instance.

	// We've supplemented `Events` with a `triggerThen`
	// method to allow for asynchronous event handling via promises. We also
	// mix this into the prototypes of the main objects in the library.
	Bookshelf.initialize = function (knex) {
	  _helpers2.default.warn("Bookshelf.initialize is deprecated, pass knex directly: require('bookshelf')(knex)");
	  return new Bookshelf(knex);
	};

	// Finally, export `Bookshelf` to the world.
	exports.default = Bookshelf;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var $              = __webpack_require__(15)
	  , global         = __webpack_require__(16)
	  , has            = __webpack_require__(17)
	  , DESCRIPTORS    = __webpack_require__(18)
	  , $def           = __webpack_require__(19)
	  , $redef         = __webpack_require__(20)
	  , $fails         = __webpack_require__(21)
	  , shared         = __webpack_require__(22)
	  , setToStringTag = __webpack_require__(23)
	  , uid            = __webpack_require__(24)
	  , wks            = __webpack_require__(25)
	  , keyOf          = __webpack_require__(26)
	  , $names         = __webpack_require__(27)
	  , enumKeys       = __webpack_require__(28)
	  , isArray        = __webpack_require__(29)
	  , anObject       = __webpack_require__(30)
	  , toIObject      = __webpack_require__(31)
	  , createDesc     = __webpack_require__(32)
	  , getDesc        = $.getDesc
	  , setDesc        = $.setDesc
	  , _create        = $.create
	  , getNames       = $names.get
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , setter         = false
	  , HIDDEN         = wks('_hidden')
	  , isEnum         = $.isEnum
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , useNative      = typeof $Symbol == 'function'
	  , ObjectProto    = Object.prototype;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(setDesc({}, 'a', {
	    get: function(){ return setDesc(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = getDesc(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  setDesc(it, key, D);
	  if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
	} : setDesc;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol.prototype);
	  sym._k = tag;
	  DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
	    configurable: true,
	    set: function(value){
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    }
	  });
	  return sym;
	};

	var isSymbol = function(it){
	  return typeof it == 'symbol';
	};

	var $defineProperty = function defineProperty(it, key, D){
	  if(D && has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))setDesc(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return setDesc(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key);
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
	    ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  var D = getDesc(it = toIObject(it), key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
	  return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
	  return result;
	};
	var $stringify = function stringify(it){
	  if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	  var args = [it]
	    , i    = 1
	    , $$   = arguments
	    , replacer, $replacer;
	  while($$.length > i)args.push($$[i++]);
	  replacer = args[1];
	  if(typeof replacer == 'function')$replacer = replacer;
	  if($replacer || !isArray(replacer))replacer = function(key, value){
	    if($replacer)value = $replacer.call(this, key, value);
	    if(!isSymbol(value))return value;
	  };
	  args[1] = replacer;
	  return _stringify.apply($JSON, args);
	};
	var buggyJSON = $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	});

	// 19.4.1.1 Symbol([description])
	if(!useNative){
	  $Symbol = function Symbol(){
	    if(isSymbol(this))throw TypeError('Symbol is not a constructor');
	    return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
	  };
	  $redef($Symbol.prototype, 'toString', function toString(){
	    return this._k;
	  });

	  isSymbol = function(it){
	    return it instanceof $Symbol;
	  };

	  $.create     = $create;
	  $.isEnum     = $propertyIsEnumerable;
	  $.getDesc    = $getOwnPropertyDescriptor;
	  $.setDesc    = $defineProperty;
	  $.setDescs   = $defineProperties;
	  $.getNames   = $names.get = $getOwnPropertyNames;
	  $.getSymbols = $getOwnPropertySymbols;

	  if(DESCRIPTORS && !__webpack_require__(33)){
	    $redef(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	}

	var symbolStatics = {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    return keyOf(SymbolRegistry, key);
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	};
	// 19.4.2.2 Symbol.hasInstance
	// 19.4.2.3 Symbol.isConcatSpreadable
	// 19.4.2.4 Symbol.iterator
	// 19.4.2.6 Symbol.match
	// 19.4.2.8 Symbol.replace
	// 19.4.2.9 Symbol.search
	// 19.4.2.10 Symbol.species
	// 19.4.2.11 Symbol.split
	// 19.4.2.12 Symbol.toPrimitive
	// 19.4.2.13 Symbol.toStringTag
	// 19.4.2.14 Symbol.unscopables
	$.each.call((
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
	  'species,split,toPrimitive,toStringTag,unscopables'
	).split(','), function(it){
	  var sym = wks(it);
	  symbolStatics[it] = useNative ? sym : wrap(sym);
	});

	setter = true;

	$def($def.G + $def.W, {Symbol: $Symbol});

	$def($def.S, 'Symbol', symbolStatics);

	$def($def.S + $def.F * !useNative, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $def($def.S + $def.F * (!useNative || buggyJSON), 'JSON', {stringify: $stringify});

	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Helpers
	// ---------------
	var _ = __webpack_require__(2);
	var chalk = __webpack_require__(41);

	var helpers = {

	  // Sets the constraints necessary during a `model.save` call.
	  saveConstraints: function saveConstraints(model, relatedData) {
	    var data = {};
	    if (relatedData && !relatedData.isThrough() && relatedData.type !== 'belongsToMany' && relatedData.type !== 'belongsTo') {
	      data[relatedData.key('foreignKey')] = relatedData.parentFk || model.get(relatedData.key('foreignKey'));
	      if (relatedData.isMorph()) data[relatedData.key('morphKey')] = relatedData.key('morphValue');
	    }
	    return model.set(model.parse(data));
	  },

	  // Finds the specific `morphTo` table we should be working with, or throws
	  // an error if none is matched.
	  morphCandidate: function morphCandidate(candidates, foreignTable) {
	    var Target = _.find(candidates, function (Candidate) {
	      return _.result(Candidate.prototype, 'tableName') === foreignTable;
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
	  query: function query(obj, args) {

	    // Ensure the object has a query builder.
	    if (!obj._knex) {
	      var tableName = _.result(obj, 'tableName');
	      obj._knex = obj._builder(tableName);
	    }

	    // If there are no arguments, return the query builder.
	    if (args.length === 0) return obj._knex;

	    var method = args[0];

	    if (_.isFunction(method)) {

	      // `method` is a query builder callback. Call it on the query builder
	      // object.
	      method.call(obj._knex, obj._knex);
	    } else if (_.isObject(method)) {

	      // `method` is an object. Use keys as methods and values as arguments to
	      // the query builder.
	      for (var key in method) {
	        var target = _.isArray(method[key]) ? method[key] : [method[key]];
	        obj._knex[key].apply(obj._knex, target);
	      }
	    } else {

	      // Otherwise assume that the `method` is string name of a query builder
	      // method, and use the remaining args as arguments to that method.
	      obj._knex[method].apply(obj._knex, args.slice(1));
	    }
	    return obj;
	  },

	  error: function error(msg) {
	    console.log(chalk.red(msg));
	  },

	  warn: function warn(msg) {
	    console.log(chalk.yellow(msg));
	  },

	  deprecate: function deprecate(a, b) {
	    helpers.warn(a + ' has been deprecated, please use ' + b + ' instead');
	  }

	};

	module.exports = helpers;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Events
	// ---------------

	var Promise = __webpack_require__(34);
	var inherits = __webpack_require__(49);
	var EventEmitter = __webpack_require__(42).EventEmitter;
	var _ = __webpack_require__(2);

	/**
	 * @class Events
	 * @class
	 *
	 * Bookshelf includes events based on those provided by
	 * [Backbone](http://backbonejs.org/).
	 *
	 */
	function Events() {
	  EventEmitter.apply(this, arguments);
	}
	inherits(Events, EventEmitter);

	// Regular expression used to split event strings.
	var eventSplitter = /\s+/;

	/**
	 * @method Events#on
	 * @description
	 * Register an event listener.
	 * @see {@link http://backbonejs.org/#Events-on Backbone.js `Events#on`}
	 */
	Events.prototype.on = function (name, handler) {
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

	/**
	 * @method Events#off
	 * @description
	 * Deregister an event listener.
	 * @see {@link http://backbonejs.org/#Events-off Backbone.js `Events#off`}
	 */
	Events.prototype.off = function (event, listener) {
	  if (arguments.length === 0) {
	    return this.removeAllListeners();
	  }
	  // Handle space separated event names.
	  if (eventSplitter.test(event)) {
	    var events = event.split(eventSplitter);
	    for (var i = 0, l = events.length; i < l; i++) {
	      if (arguments.length === 1) {
	        this.off(events[i]);
	      } else {
	        this.off(events[i], listener);
	      }
	    }
	    return this;
	  }
	  if (arguments.length === 1) {
	    return this.removeAllListeners(event);
	  }
	  return this.removeListener(event, listener);
	};

	/**
	 * @method Events#trigger
	 * @description
	 * Deregister an event listener.
	 * @see {@link http://backbonejs.org/#Events-trigger Backbone.js `Events#trigger`}
	 */
	Events.prototype.trigger = function (name) {
	  // Handle space separated event names.
	  if (eventSplitter.test(name)) {
	    var len = arguments.length;
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

	/**
	 * @method Events#triggerThen
	 * @description
	 * A promise version of {@link Events#trigger}, returning a promise which
	 * resolves with all return values from triggered event handlers. If any of the
	 * event handlers throw an `Error` or return a rejected promise, the promise
	 * will be rejected. Used internally on the {@link Model#creating "creating"},
	 * {@link Model#updating "updating"}, {@link Model#saving "saving"}, and {@link
	 * Model@destroying "destroying"} events, and can be helpful when needing async
	 * event handlers (for validations, etc).
	 *
	 * @param {string} name
	 *   The event name, or a whitespace-separated list of event names, to be
	 *   triggered.
	 * @param {...mixed} args
	 *   Arguments to be passed to any registered event handlers.
	 * @returns Promise<mixed[]>
	 *   A promise resolving the the resolved return values of any triggered handlers.
	 */
	Events.prototype.triggerThen = function (name) {
	  var i,
	      l,
	      rest,
	      listeners = [];
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
	    case 1:
	      rest = [];break;
	    case 2:
	      rest = [arguments[1]];break;
	    case 3:
	      rest = [arguments[1], arguments[2]];break;
	    default:
	      rest = new Array(len - 1);for (i = 1; i < len; i++) rest[i - 1] = arguments[i];
	  }
	  var events = this;
	  return Promise.try(function () {
	    var pending = [];
	    for (i = 0, l = listeners.length; i < l; i++) {
	      pending[i] = listeners[i].apply(events, rest);
	    }
	    return Promise.all(pending);
	  });
	};
	Events.prototype.emitThen = Events.prototype.triggerThen;

	/**
	 * @method Events#once
	 * @description
	 * Register a one-off event handler.
	 * @see {@link http://backbonejs.org/#Events-once Backbone.js `Events#once`}
	 */
	Events.prototype.once = function (name, callback, context) {
	  var self = this;
	  var once = _.once(function () {
	    self.off(name, once);
	    return callback.apply(this, arguments);
	  });
	  once._callback = callback;
	  return this.on(name, once, context);
	};

	module.exports = Events;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _lodash = __webpack_require__(2);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _createError = __webpack_require__(50);

	var _createError2 = _interopRequireDefault(_createError);

	var _sync = __webpack_require__(35);

	var _sync2 = _interopRequireDefault(_sync);

	var _helpers = __webpack_require__(4);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _eager = __webpack_require__(36);

	var _eager2 = _interopRequireDefault(_eager);

	var _errors = __webpack_require__(9);

	var _errors2 = _interopRequireDefault(_errors);

	var _model = __webpack_require__(37);

	var _model2 = _interopRequireDefault(_model);

	var _promise = __webpack_require__(34);

	var _promise2 = _interopRequireDefault(_promise);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	/**
	 * @class Model
	 * @extends ModelBase
	 * @inheritdoc
	 * @classdesc
	 *
	 * Models are simple objects representing individual database rows, specifying
	 * the tableName and any relations to other models. They can be extended with
	 * any domain-specific methods, which can handle components such as validations,
	 * computed properties, and access control.
	 *
	 * @constructor
	 * @description
	 *
	 * When creating an instance of a model, you can pass in the initial values of
	 * the attributes, which will be {@link Model#set set} on the
	 * model. If you define an {@link initialize} function, it will be invoked
	 * when the model is created.
	 *
	 *     new Book({
	 *       title: "One Thousand and One Nights",
	 *       author: "Scheherazade"
	 *     });
	 *
	 * In rare cases, if you're looking to get fancy, you may want to override
	 * {@link Model#constructor constructor}, which allows you to replace the
	 * actual constructor function for your model.
	 *
	 *     let Books = bookshelf.Model.extend({
	 *       tableName: 'documents',
	 *       constructor: function() {
	 *         bookshelf.Model.apply(this, arguments);
	 *         this.on('saving', function(model, attrs, options) {
	 *           options.query.where('type', '=', 'book');
	 *         });
	 *       }
	 *     });
	 *
	 * @param {Object}   attributes            Initial values for this model's attributes.
	 * @param {Object=}  options               Hash of options.
	 * @param {string=}  options.tableName     Initial value for {@link Model#tableName tableName}.
	 * @param {boolean=} [options.hasTimestamps=false]
	 *
	 *   Initial value for {@link Model#hasTimestamps hasTimestamps}.
	 *
	 * @param {boolean} [options.parse=false]
	 *
	 *   Convert attributes by {@link Model#parse parse} before being {@link
	 *   Model#set set} on the model.
	 *
	 */
	var BookshelfModel = _model2.default.extend({

	  /**
	   * The `hasOne` relation specifies that this table has exactly one of another
	   * type of object, specified by a foreign key in the other table.
	   *
	   *     let Record = bookshelf.Model.extend({
	   *       tableName: 'health_records'
	   *     });
	   *
	   *     let Patient = bookshelf.Model.extend({
	   *       tableName: 'patients',
	   *       record: function() {
	   *         return this.hasOne(Record);
	   *       }
	   *     });
	   *
	   *     // select * from `health_records` where `patient_id` = 1;
	   *     new Patient({id: 1}).related('record').fetch().then(function(model) {
	   *       ...
	   *     });
	   *
	   *     // alternatively, if you don't need the relation loaded on the patient's relations hash:
	   *     new Patient({id: 1}).record().fetch().then(function(model) {
	   *       ...
	   *     });
	   *
	   * @method Model#hasOne
	   *
	   * @param {Model} Target
	   *
	   *   Constructor of {@link Model} targeted by join.
	   *
	   * @param {string=} foreignKey
	   *
	   *   ForeignKey in the `Target` model. By default, the `foreignKey` is assumed to
	   *   be the singular form of this model's {@link Model#tableName tableName},
	   *   followed by `_id` / `_{{{@link Model#idAttribute idAttribute}}}`.
	   *
	   * @returns {Model}
	   */

	  hasOne: function hasOne(Target, foreignKey) {
	    return this._relation('hasOne', Target, { foreignKey: foreignKey }).init(this);
	  },

	  /**
	   * The `hasMany` relation specifies that this model has one or more rows in
	   * another table which match on this model's primary key.
	   *
	   *     let Author = bookshelf.Model.extend({
	   *       tableName: 'authors',
	   *       books: function() {
	   *         return this.hasMany(Book);
	   *       }
	   *     });
	   *
	   *     // select * from `authors` where id = 1
	   *     // select * from `books` where author_id = 1
	   *     Author.where({id: 1}).fetch({withRelated: ['books']}).then(function(author) {
	   *       console.log(JSON.stringify(author.related('books')));
	   *     });
	   *
	   * @method Model#hasMany
	   *
	   * @param {Model} Target
	   *
	   *   Constructor of {@link Model} targeted by join.
	   *
	   * @param {string=} foreignKey
	   *
	   *   ForeignKey in the `Target` model. By default, the foreignKey is assumed to
	   *   be the singular form of this model's tableName, followed by `_id` /
	   *   `_{{{@link Model#idAttribute idAttribute}}}`.
	   *
	   * @returns {Collection}
	   */
	  hasMany: function hasMany(Target, foreignKey) {
	    return this._relation('hasMany', Target, { foreignKey: foreignKey }).init(this);
	  },

	  /**
	   * The `belongsTo` relationship is used when a model is a member of
	   * another `Target` model.
	   *
	   * It can be used in a {@linkplain one-to-one} associations as the inverse
	   * of a {@link Model#hasOne hasOne}. It can also used in {@linkplain
	   * one-to-many} associations as the inverse of a {@link Model#hasMany hasMany}
	   * (and is the one side of that association). In both cases, the {@link
	   * Model#belongsTo belongsTo} relationship is used for a model that is a
	   * member of another Target model, referenced by the foreignKey in the current
	   * model.
	   *
	   *     let Book = bookshelf.Model.extend({
	   *       tableName: 'books',
	   *       author: function() {
	   *         return this.belongsTo(Author);
	   *       }
	   *     });
	   * 
	   *     // select * from `books` where id = 1
	   *     // select * from `authors` where id = book.author_id
	   *     Book.where({id: 1}).fetch({withRelated: ['author']}).then(function(book) {
	   *       console.log(JSON.stringify(book.related('author')));
	   *     });
	   * 
	   * @method Model#belongsTo
	   *
	   * @param {Model} Target
	   *
	   *   Constructor of {@link Model} targeted by join.
	   *
	   * @param {string=} foreignKey
	   *
	   *   ForeignKey in this model. By default, the foreignKey is assumed to
	   *   be the singular form of the `Target` model's tableName, followed by `_id` /
	   *   `_{{{@link Model#idAttribute idAttribute}}}`.
	   *
	   * @returns {Model}
	   */
	  belongsTo: function belongsTo(Target, foreignKey) {
	    return this._relation('belongsTo', Target, { foreignKey: foreignKey }).init(this);
	  },

	  /**
	   * Defines a many-to-many relation, where the current model is joined to one
	   * or more of a `Target` model through another table. The default name for
	   * the joining table is the two table names, joined by an underscore, ordered
	   * alphabetically. For example, a `users` table and an `accounts` table would have
	   * a joining table of accounts_users.
	   *
	   *     let Account = bookshelf.Model.extend({
	   *       tableName: 'accounts'
	   *     });
	   *
	   *     let User = bookshelf.Model.extend({
	   *       tableName: 'users',
	   *       allAccounts: function () {
	   *         return this.belongsToMany(Account);
	   *       },
	   *       adminAccounts: function() {
	   *         return this.belongsToMany(Account).query({where: {access: 'admin'}});
	   *       },
	   *       viewAccounts: function() {
	   *         return this.belongsToMany(Account).query({where: {access: 'readonly'}});
	   *       }
	   *     });  
	   *
	   *  The default key names in the joining table are the singular versions of the
	   *  model table names, followed by `_id` /
	   *  _{{{@link Model#idAttribute idAttribute}}}. So in the above case, the
	   *  columns in the joining table
	   *  would be `user_id`, `account_id`, and `access`, which is used as an
	   *  example of how dynamic relations can be formed using different contexts.
	   *  To customize the keys used in, or the {@link Model#tableName tableName}
	   *  used for the join table, you may specify them like so:
	   *
	   *      this.belongsToMany(Account, 'users_accounts', 'userid', 'accountid');
	   *
	   * If you wish to create a {@link Model#belongsToMany belongsToMany}
	   * association where the joining table has a primary key, and more information
	   * about the model, you may create a {@link Model#belongsToMany belongsToMany}
	   * {@link Relation#through through} relation:
	   *
	   *     let Doctor = bookshelf.Model.extend({
	   *       patients: function() {
	   *         return this.belongsToMany(Patient).through(Appointment);
	   *       }
	   *     });
	   *     
	   *     let Appointment = bookshelf.Model.extend({
	   *       patient: function() {
	   *         return this.belongsTo(Patient);
	   *       },
	   *       doctor: function() {
	   *         return this.belongsTo(Doctor);
	   *       }
	   *     });
	   *     
	   *     let Patient = bookshelf.Model.extend({
	   *       doctors: function() {
	   *         return this.belongsToMany(Doctor).through(Appointment);
	   *       }
	   *     });
	   *
	   * Collections returned by a `belongsToMany` relation are decorated with
	   * several pivot helper methods. See {@link Collection#attach attach},
	   * {@link Collection#detach detach}, {@link Collection#updatePivot
	   * updatePivot} and {@link Collection#withPivot withPivot} for more
	   * information.
	   *
	   * @belongsTo Model
	   * @method  Model#belongsToMany
	   * @param {Model} Target
	   *
	   *   Constructor of {@link Model} targeted by join.
	   * 
	   * @param {string=} table
	   *
	   *   Name of the joining table. Defaults to the two table names, joined by an
	   *   underscore, ordered alphabetically.
	   *
	   * @param {string=} foreignKey
	   *
	   *   Foreign key in this model. By default, the `foreignKey` is assumed to
	   *   be the singular form of the `Target` model's tableName, followed by `_id` /
	   *   `_{{{@link Model#idAttribute idAttribute}}}`.
	   *
	   * @param {string=} otherKey
	   *
	   *   Foreign key in the `Target` model. By default, the `otherKey` is assumed to
	   *   be the singular form of this model's tableName, followed by `_id` /
	   *   `_{{{@link Model#idAttribute idAttribute}}}`.
	   *
	   * @returns {Collection}
	   */
	  belongsToMany: function belongsToMany(Target, joinTableName, foreignKey, otherKey) {
	    return this._relation('belongsToMany', Target, {
	      joinTableName: joinTableName, foreignKey: foreignKey, otherKey: otherKey
	    }).init(this);
	  },

	  /**
	   * The {@link Model#morphOne morphOne} is used to signify a {@link oneToOne
	   * one-to-one} {@link polymorphicRelation polymorphic relation} with
	   * another `Target` model, where the `name` of the model is used to determine
	   * which database table keys are used. The naming convention requires the
	   * `name` prefix an `_id` and `_type` field in the database. So for the case
	   * below the table names would be `imageable_type` and `imageable_id`. The
	   * `morphValue` may be optionally set to store/retrieve a different value in
	   * the `_type` column than the {@link Model#tableName}.
	   *
	   *     let Site = bookshelf.Model.extend({
	   *       tableName: 'sites',
	   *       photo: function() {
	   *         return this.morphOne(Photo, 'imageable');
	   *       }
	   *     });
	   *
	   * And with custom `columnNames`:
	   *
	   *     let Site = bookshelf.Model.extend({
	   *       tableName: 'sites',
	   *       photo: function() {
	   *         return this.morphOne(Photo, 'imageable', ["ImageableType", "ImageableId"]);
	   *       }
	   *     });
	   *
	   * Note that both `columnNames` and `morphValue` are optional arguments. How
	   * your argument is treated when only one is specified, depends on the type.
	   * If your argument is an array, it will be assumed to contain custom
	   * `columnNames`. If it's not, it will be assumed to indicate a `morphValue`.
	   *
	   * @method Model#morphOne
	   *
	   * @param {Model}     Target      Constructor of {@link Model} targeted by join.
	   * @param {string=}   name        Prefix for `_id` and `_type` columns.
	   * @param {(string[])=}  columnNames
	   *
	   *   Array containing two column names, the first is the `_type`, the second
	   *   is the `_id`.
	   *
	   * @param {string=} [morphValue=Target#{@link Model#tableName tableName}]
	   *
	   *   The string value associated with this relationship. Stored in the `_type`
	   *   column of the polymorphic table. Defaults to `Target#{@link
	   *   Model#tableName tableName}`.
	   *
	   * @returns {Model} The related model.
	   */
	  morphOne: function morphOne(Target, name, columnNames, morphValue) {
	    return this._morphOneOrMany(Target, name, columnNames, morphValue, 'morphOne');
	  },

	  /**
	   * {@link Model#morphMany morphMany} is essentially the same as a {@link
	   * Model#morphOne morphOne}, but creating a {@link Collection collection}
	   * rather than a {@link Model model} (similar to a {@link Model#hasOne
	   * hasOne} vs. {@link Model#hasMany hasMany} relation).
	   *  
	   * {@link Model#morphMany morphMany} is used to signify a {@link oneToMany
	   * one-to-many} or {@link manyToMany many-to-many} {@link polymorphicRelation
	   * polymorphic relation} with another `Target` model, where the `name` of the
	   * model is used to determine which database table keys are used. The naming
	   * convention requires the `name` prefix an `_id` and `_type` field in the
	   * database. So for the case below the table names would be `imageable_type`
	   * and `imageable_id`. The `morphValue` may be optionally set to
	   * store/retrieve a different value in the `_type` column than the `Target`'s
	   * {@link Model#tableName tableName}.
	   *
	   *     let Post = bookshelf.Model.extend({
	   *       tableName: 'posts',
	   *       photos: function() {
	   *         return this.morphMany(Photo, 'imageable');
	   *       }
	   *     });
	   *
	   * And with custom columnNames:
	   *
	   *     let Post = bookshelf.Model.extend({
	   *       tableName: 'posts',
	   *       photos: function() {
	   *         return this.morphMany(Photo, 'imageable', ["ImageableType", "ImageableId"]);
	   *       }
	   *     });
	   *
	   * @method Model#morphMany
	   *
	   * @param {Model}     Target      Constructor of {@link Model} targeted by join.
	   * @param {string=}   name        Prefix for `_id` and `_type` columns.
	   * @param {(string[])=}  columnNames
	   *
	   *   Array containing two column names, the first is the `_type`, the second is the `_id`.
	   *
	   * @param {string=} [morphValue=Target#{@link Model#tableName tablename}]
	   *
	   *   The string value associated with this relationship. Stored in the `_type`
	   *   column of the polymorphic table. Defaults to `Target`#{@link Model#tableName
	   *   tablename}.
	   *
	   * @returns {Collection} A collection of related models.
	   */
	  morphMany: function morphMany(Target, name, columnNames, morphValue) {
	    return this._morphOneOrMany(Target, name, columnNames, morphValue, 'morphMany');
	  },

	  /**
	   * The {@link Model#morphTo morphTo} relation is used to specify the inverse
	   * of the {@link Model#morphOne morphOne} or {@link Model#morphMany
	   * morphMany} relations, where the `targets` must be passed to signify which
	   * {@link Model models} are the potential opposite end of the {@link
	   * polymorphicRelation polymorphic relation}.
	   *
	   *     let Photo = bookshelf.Model.extend({
	   *       tableName: 'photos',
	   *       imageable: function() {
	   *         return this.morphTo('imageable', Site, Post);
	   *       }
	   *     });
	   *
	   * And with custom columnNames:
	   *
	   *     let Photo = bookshelf.Model.extend({
	   *       tableName: 'photos',
	   *       imageable: function() {
	   *         return this.morphTo('imageable', ["ImageableType", "ImageableId"], Site, Post);
	   *       }
	   *     });
	   * 
	   * @method Model#morphTo
	   *
	   * @param {string}      name        Prefix for `_id` and `_type` columns.
	   * @param {(string[])=} columnNames
	   *
	   *   Array containing two column names, the first is the `_type`, the second is the `_id`.
	   *
	   * @param {...Model} Target Constructor of {@link Model} targeted by join.
	   *
	   * @returns {Model}
	   */
	  morphTo: function morphTo(morphName) {
	    if (!_lodash2.default.isString(morphName)) throw new Error('The `morphTo` name must be specified.');
	    var columnNames = undefined,
	        candidates = undefined;
	    if (_lodash2.default.isArray(arguments[1])) {
	      columnNames = arguments[1];
	      candidates = _lodash2.default.rest(arguments, 2);
	    } else {
	      columnNames = null;
	      candidates = _lodash2.default.rest(arguments);
	    }
	    return this._relation('morphTo', null, { morphName: morphName, columnNames: columnNames, candidates: candidates }).init(this);
	  },

	  /**
	   * Helps to create dynamic relations between {@link Model models} and {@link
	   * Collection collections}, where a {@link Model#hasOne hasOne}, {@link
	   * Model#hasMany hasMany}, {@link Model#belongsTo belongsTo}, or {@link
	   * Model#belongsToMany belongsToMany} relation may run through a `JoinModel`.  
	   *
	   * A good example of where this would be useful is if a book {@link
	   * Model#hasMany hasMany} paragraphs through chapters. Consider the following examples:
	   *
	   *
	   *     let Book = bookshelf.Model.extend({
	   *     
	   *       tableName: 'books',
	   *     
	   *       // Find all paragraphs associated with this book, by
	   *       // passing through the "Chapter" model.
	   *       paragraphs: function() {
	   *         return this.hasMany(Paragraph).through(Chapter);
	   *       },
	   *     
	   *       chapters: function() {
	   *         return this.hasMany(Chapter);
	   *       }
	   *     
	   *     });
	   *     
	   *     let Chapter = bookshelf.Model.extend({
	   *     
	   *       tableName: 'chapters',
	   *     
	   *       paragraphs: function() {
	   *         return this.hasMany(Paragraph);
	   *       }
	   *     
	   *     });
	   *     
	   *     let Paragraph = bookshelf.Model.extend({
	   *     
	   *       tableName: 'paragraphs',
	   *     
	   *       chapter: function() {
	   *         return this.belongsTo(Chapter);
	   *       },
	   *     
	   *       // A reverse relation, where we can get the book from the chapter.
	   *       book: function() {
	   *         return this.belongsTo(Book).through(Chapter);
	   *       }
	   *     
	   *     });
	   *
	   * The "through" table creates a pivot model, which it assigns to {@link
	   * Model#pivot model.pivot} after it is created. On {@link Model#toJSON
	   * toJSON}, the pivot model is flattened to values prefixed with
	   * `_pivot_`.
	   *
	   * @method Model#through
	   * @param {Model} Interim Pivot model.
	   * @param {string=} throughForeignKey
	   *
	   *   Foreign key in this model. By default, the `foreignKey` is assumed to
	   *   be the singular form of the `Target` model's tableName, followed by `_id` /
	   *   `_{{{@link Model#idAttribute idAttribute}}}`.
	   *
	   * @param {string=} otherKey
	   *
	   *   Foreign key in the `Interim` model. By default, the `otherKey` is assumed to
	   *   be the singular form of this model's tableName, followed by `_id` /
	   *   `_{{{@link Model#idAttribute idAttribute}}}`.
	   *
	   * @returns {Collection}
	   */
	  through: function through(Interim, throughForeignKey, otherKey) {
	    return this.relatedData.through(this, Interim, { throughForeignKey: throughForeignKey, otherKey: otherKey });
	  },

	  /**
	   * @method Model#refresh
	   * @since 0.8.2
	   * @description
	   *
	   * Update the attributes of a model, fetching it by its primary key. If no
	   * attribute matches its {@link Model#idAttribute idAttribute}, then fetch by
	   * all available fields.
	   *
	   * @param {Object} options
	   *   A hash of options. See {@link Model#fetch} for details.
	   * @returns {Promise<Model>}
	   *   A promise resolving to this model.
	   */
	  refresh: function refresh(options) {

	    // If this is new, we use all its attributes. Otherwise we just grab the
	    // primary key.
	    var attributes = this.isNew() ? this.attributes : _lodash2.default.pick(this.attributes, this.idAttribute);

	    return this._doFetch(attributes, options);
	  },

	  /**
	   * Fetches a {@link Model model} from the database, using any {@link
	   * Model#attributes attributes} currently set on the model to form a `select`
	   * query. 
	   *
	   * A {@link Model#event:fetching "fetching"} event will be fired just before the
	   * record is fetched; a good place to hook into for validation. {@link
	   * Model#event:fetched "fetched"} event will be fired when a record is
	   * successfully retrieved.
	   *
	   * If you need to constrain the query
	   * performed by fetch, you can call {@link Model#query query} before calling
	   * {@link Model#fetch fetch}.  
	   *
	   *     // select * from `books` where `ISBN-13` = '9780440180296'
	   *     new Book({'ISBN-13': '9780440180296'})
	   *       .fetch()
	   *       .then(function(model) {
	   *         // outputs 'Slaughterhouse Five'
	   *         console.log(model.get('title'));
	   *       });
	   *
	   * _If you'd like to only fetch specific columns, you may specify a `columns`
	   * property in the `options` for the {@link Model#fetch fetch} call, or use
	   * {@link Model#query query}, tapping into the {@link Knex} {@link
	   * Knex#column column} method to specify which columns will be fetched._
	   *
	   * single property, or an array of properties can be specified as a value for
	   * the `withRelated` property. You can also execute callbacks on relations
	   * queries (eg. for sorting a relation). The results of these relation queries
	   * will be loaded into a {@link Model#relations relations} property on the
	   * model, may be retrieved with the {@link Model#related related} method, and
	   * will be serialized as properties on a {@link Model#toJSON toJSON} call
	   * unless `{shallow: true}` is passed.  
	   *
	   *     let Book = bookshelf.Model.extend({
	   *       tableName: 'books',
	   *       editions: function() {
	   *         return this.hasMany(Edition);
	   *       },
	   *       chapters: function{
	   *         return this.hasMany(Chapter);
	   *       },
	   *       genre: function() {
	   *         return this.belongsTo(Genre);
	   *       }
	   *     })
	   *
	   *     new Book({'ISBN-13': '9780440180296'}).fetch({
	   *       withRelated: [
	   *         'genre', 'editions',
	   *         { chapters: function(query) { query.orderBy('chapter_number'); }}
	   *       ]
	   *     }).then(function(book) {
	   *       console.log(book.related('genre').toJSON());
	   *       console.log(book.related('editions').toJSON());
	   *       console.log(book.toJSON());
	   *     });
	   *
	   * @method Model#fetch
	   *
	   * @param {Object=}  options - Hash of options.
	   * @param {boolean=} [options.require=false]
	   *   Reject the returned response with a {@link Model.NotFoundError
	   *   NotFoundError} if no results are empty.
	   * @param {string|string[]} [options.columns='*']
	   *   Specify columns to be retireved.
	   * @param {Transaction} [options.transacting]
	   *  Optionally run the query in a transaction.
	   * @param {string|Object|mixed[]} [options.withRelated]
	   *  Relations to be retrieved with `Model` instance. Either one or more
	   *  relation names or objects mapping relation names to query callbacks.
	   *
	   * @fires Model#fetching
	   * @fires Model#fetched
	   *
	   * @throws {Model.NotFoundError}
	   *
	   * @returns {Promise<Model|null>}
	   *  A promise resolving to the fetched {@link Model model} or `null` if
	   *  none exists.
	   *
	   */
	  fetch: function fetch(options) {

	    // Fetch uses all set attributes.
	    return this._doFetch(this.attributes, options);
	  },

	  _doFetch: _promise2.default.method(function (attributes, options) {
	    options = options ? _lodash2.default.clone(options) : {};

	    // Run the `first` call on the `sync` object to fetch a single model.
	    return this.sync(options).first(attributes).bind(this)

	    // Jump the rest of the chain if the response doesn't exist...
	    .tap(function (response) {
	      if (!response || response.length === 0) {
	        if (options.require) throw new this.constructor.NotFoundError('EmptyResponse');
	        return _promise2.default.reject(null);
	      }
	    })

	    // Now, load all of the data into the model as necessary.
	    .tap(this._handleResponse)

	    // If the "withRelated" is specified, we also need to eager load all of the
	    // data on the model, as a side-effect, before we ultimately jump into the
	    // next step of the model. Since the `columns` are only relevant to the
	    // current level, ensure those are omitted from the options.
	    .tap(function (response) {
	      if (options.withRelated) {
	        return this._handleEager(response, _lodash2.default.omit(options, 'columns'));
	      }
	    }).tap(function (response) {

	      /**
	       * Fired after a `fetch` operation. A promise may be returned from the
	       * event handler for async behaviour.
	       *
	       * @event Model#fetched
	       * @param {Model} model
	       *   The model firing the event.
	       * @param {Object} reponse
	       *   Knex query response.
	       * @param {Object} options
	       *   Options object passed to {@link Model#fetch fetch}.
	       * @returns {Promise}
	       *   If the handler returns a promise, `fetch` will wait for it to
	       *   be resolved.
	       */
	      return this.triggerThen('fetched', this, response, options);
	    }).return(this).catch(function (err) {
	      if (err === null) return err;
	      throw err;
	    });
	  }),

	  // Private for now.
	  all: function all() {
	    var collection = this.constructor.collection();
	    collection._knex = this.query().clone();
	    this.resetQuery();
	    if (this.relatedData) collection.relatedData = this.relatedData;
	    return collection;
	  },

	  /**
	   * @method Model#count
	   * @since 0.8.2
	   * @description
	   *
	   * Gets the number of matching records in the database, respecting any
	   * previous calls to {@link Model#query}.
	   *
	   * @example
	   *
	   * Duck.where('color', 'blue').count('name')
	   *   .then(function(count) { //...
	   *
	   * @param {string} [column='*']
	   *   Specify a column to count - rows with null values in this column will be excluded.
	   * @param {Object=} options
	   *   Hash of options.
	   * @returns {Promise<Number>}
	   *   A promise resolving to the number of matching rows.
	   */
	  count: function count(column, options) {
	    return this.all().count(column, options);
	  },

	  /**
	   * Fetches a collection of {@link Model models} from the database, using any
	   * query parameters currently set on the model to form a select query. Returns
	   * a promise, which will resolve with the fetched collection. If you wish to
	   * trigger an error if no models are found, pass {require: true} as one of
	   * the options to the `fetchAll` call.
	   *
	   * If you need to constrain the query performed by fetch, you can call the
	   * {@link Model#query query} method before calling fetch.
	   *
	   * @method Model#fetchAll
	   *
	   * @param {Object=}  options - Hash of options.
	   * @param {boolean=} [options.require=false]
	   *
	   *  Rejects the returned promise with an `EmptyError` if no records are returned.
	   *
	   * @param {Transaction=} options.transacting
	   *
	   *   Optionally run the query in a transaction.
	   *
	   * @fires Model#"fetching:collection"
	   * @fires Model#"fetched:collection"
	   *
	   * @throws {Model.EmptyError}
	   *
	   *  Rejects the promise in the event of an empty response if the `require: true` option.
	   *
	   * @returns {Promise<Collection>} A promise resolving to the fetched {@link Collection collection}.
	   *
	   */
	  fetchAll: function fetchAll(options) {
	    var _this = this;

	    var collection = this.all();
	    return collection.once('fetching', function (__, columns, opts) {
	      /**
	       * Fired before a {@link Model#fetchAll fetchAll} operation. A promise
	       * may be returned from the event handler for async behaviour.
	       *
	       * @event Model#"fetching:collection"
	       * @param {Model}    collection The collection that has been fetched.
	       * @param {string[]} columns    The columns being retrieved by the query.
	       * @param {Object}   options    Options object passed to {@link Model#fetchAll fetchAll}.
	       * @returns {Promise}
	       */
	      return _this.triggerThen('fetching:collection', collection, columns, opts);
	    }).once('fetched', function (__, resp, opts) {
	      /**
	       * Fired after a {@link Model#fetchAll fetchAll} operation. A promise
	       * may be returned from the event handler for async behaviour.
	       *
	       * @event Model#"fetched:collection"
	       * @param {Model}  collection The collection that has been fetched.
	       * @param {Object} resp       The Knex query response.
	       * @param {Object} options    Options object passed to {@link Model#fetchAll fetchAll}.
	       * @returns {Promise}
	       */
	      return _this.triggerThen('fetched:collection', collection, resp, opts);
	    }).fetch(options);
	  },

	  /**
	   * @method Model#load
	   * @description
	   * The load method takes an array of relations to eager load attributes onto a
	   * {@link Model}, in a similar way that the `withRelated` property works on
	   * {@link Model#fetch fetch}. Dot separated attributes may be used to specify deep
	   * eager loading.
	   *
	   * @example
	   * new Posts().fetch().then(function(collection) {
	   *   collection.at(0)
	   *   .load(['author', 'content', 'comments.tags'])
	   *   .then(function(model) {
	   *     JSON.stringify(model);
	   *   });
	   * });
	   * 
	   * {
	   *   title: 'post title',
	   *   author: {...},
	   *   content: {...},
	   *   comments: [
	   *     {tags: [...]}, {tags: [...]}
	   *   ]
	   * }
	   *  
	   * @param {string|string[]} relations The relation, or relations, to be loaded.
	   * @param {Object=}      options Hash of options.
	   * @param {Transaction=} options.transacting
	   *   Optionally run the query in a transaction.
	   * @returns {Promise<Model>} A promise resolving to this {@link Model model}
	   */
	  load: _promise2.default.method(function (relations, options) {
	    return _promise2.default.bind(this).then(function () {
	      return [this.format(_lodash2.default.extend(Object.create(null), this.attributes))];
	    }).then(function (response) {
	      return this._handleEager(response, _lodash2.default.extend({}, options, {
	        shallow: true,
	        withRelated: _lodash2.default.isArray(relations) ? relations : [relations]
	      }));
	    }).return(this);
	  }),

	  /**
	   * @method Model#save
	   * @description
	   *
	   * `save` is used to perform either an insert or update query using the
	   * model's set {@link Model#attributes attributes}.
	   *
	   * If the model {@link Model#isNew isNew}, any {@link Model#defaults defaults}
	   * will be set and an `insert` query will be performed. Otherwise it will
	   * `update` the record with a corresponding ID. This behaviour can be overriden
	   * with the `method` option.
	   *
	   *     new Post({name: 'New Article'}).save().then(function(model) {
	   *       // ...
	   *     });
	   *
	   * If you only wish to update with the params passed to the save, you may pass
	   * a {patch: true} flag to the database:
	   *
	   *     // update authors set "bio" = 'Short user bio' where "id" = 1
	   *     new Author({id: 1, first_name: 'User'})
	   *       .save({bio: 'Short user bio'}, {patch: true})
	   *       .then(function(model) {
	   *         // ...
	   *       });
	   *
	   * Several events fired on the model when saving: a {@link Model#creating
	   * "creating"}, or {@link Model#updating "updating"} event if the model is
	   * being inserted or updated, and a "saving" event in either case. To
	   * prevent saving the model (with validation, etc.), throwing an error inside
	   * one of these event listeners will stop saving the model and reject the
	   * promise. A {@link Model#created "created"}, or {@link Model#"updated"}
	   * event is fired after the model is saved, as well as a {@link Model#saved
	   * "saved"} event either way. If you wish to modify the query when the {@link
	   * Model#saving "saving"} event is fired, the knex query object should is
	   * available in `options.query`.
	   *
	   *     // Save with no arguments
	   *     Model.forge({id: 5, firstName: "John", lastName: "Smith"}).save().then(function() { //...
	   *
	   *     // Or add attributes during save
	   *     Model.forge({id: 5}).save({firstName: "John", latName: "Smith"}).then(function() { //...
	   *
	   *     // Or, if you prefer, for a single attribute
	   *     Model.forge({id: 5}).save('name', 'John Smith').then(function() { //...
	   *
	   * @param {string=}      key                      Attribute name.
	   * @param {string=}      val                      Attribute value.
	   * @param {Object=}      attrs                    A hash of attributes.
	   * @param {Object=}      options
	   * @param {Transaction=} options.transacting
	   *   Optionally run the query in a transaction.
	   * @param {string=} options.method
	   *   Explicitly select a save method, either `"update"` or `"insert"`.
	   * @param {string} [options.defaults=false]
	   *   Assign {@link Model#defaults defaults} in an `update` operation.
	   * @param {bool} [options.patch=false]
	   *   Only save attributes supplied in arguments to `save`.
	   * @param {bool} [options.require=true]
	   *   Throw a {@link Model.NoRowsUpdatedError} if no records are affected by save.
	   *
	   * @fires Model#saving
	   * @fires Model#creating
	   * @fires Model#updating
	   * @fires Model#created
	   * @fires Model#updated
	   * @fires Model#saved
	   *
	   * @throws {Model.NoRowsUpdatedError}
	   *
	   * @returns {Promise<Model>} A promise resolving to the saved and updated model.
	   */
	  save: _promise2.default.method(function (key, val, options) {
	    var attrs = undefined;

	    // Handle both `"key", value` and `{key: value}` -style arguments.
	    if (key == null || (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === "object") {
	      attrs = key || {};
	      options = _lodash2.default.clone(val) || {};
	    } else {
	      (attrs = {})[key] = val;
	      options = options ? _lodash2.default.clone(options) : {};
	    }

	    return _promise2.default.bind(this).then(function () {
	      return this.saveMethod(options);
	    }).then(function (method) {

	      // Determine whether which kind of save we will do, update or insert.
	      options.method = method;

	      // If the object is being created, we merge any defaults here rather than
	      // during object creation.
	      if (method === 'insert' || options.defaults) {
	        var defaults = _lodash2.default.result(this, 'defaults');
	        if (defaults) {
	          attrs = _lodash2.default.extend({}, defaults, this.attributes, attrs);
	        }
	      }

	      // Set the attributes on the model. Note that we do this before adding
	      // timestamps, as `timestamp` calls `set` internally.
	      this.set(attrs, { silent: true });

	      // Now set timestamps if appropriate. Extend `attrs` so that the
	      // timestamps will be provided for a patch operation.
	      if (this.hasTimestamps) {
	        _lodash2.default.extend(attrs, this.timestamp(_lodash2.default.extend(options, { silent: true })));
	      }

	      // If there are any save constraints, set them on the model.
	      if (this.relatedData && this.relatedData.type !== 'morphTo') {
	        _helpers2.default.saveConstraints(this, this.relatedData);
	      }

	      // Gives access to the `query` object in the `options`, in case we need it
	      // in any event handlers.
	      var sync = this.sync(options);
	      options.query = sync.query;

	      /**
	       * Saving event.
	       *
	       * Fired before an `insert` or `update` query. A promise may be
	       * returned from the event handler for async behaviour. Throwing an
	       * exception from the handler will cancel the save.
	       *
	       * @event Model#saving
	       * @param {Model}  model    The model firing the event.
	       * @param {Object} attrs    Attributes that will be inserted or updated.
	       * @param {Object} options  Options object passed to {@link Model#save save}.
	       * @returns {Promise}
	       */

	      /**
	       * Creating event.
	       *
	       * Fired before `insert` query. A promise may be
	       * returned from the event handler for async behaviour. Throwing an
	       * exception from the handler will cancel the save operation.
	       *
	       * @event Model#creating
	       * @param {Model}  model    The model firing the event.
	       * @param {Object} attrs    Attributes that will be inserted.
	       * @param {Object} options  Options object passed to {@link Model#save save}.
	       * @returns {Promise}
	       */

	      /**
	       * Updating event.
	       *
	       * Fired before `update` query. A promise may be
	       * returned from the event handler for async behaviour. Throwing an
	       * exception from the handler will cancel the save operation.
	       *
	       * @event Model#updating
	       * @param {Model}  model    The model firing the event.
	       * @param {Object} attrs    Attributes that will be updated.
	       * @param {Object} options  Options object passed to {@link Model#save save}.
	       * @returns {Promise}
	       */
	      return this.triggerThen(method === 'insert' ? 'creating saving' : 'updating saving', this, attrs, options).bind(this).then(function () {
	        return sync[options.method](method === 'update' && options.patch ? attrs : this.attributes);
	      }).then(function (resp) {

	        // After a successful database save, the id is updated if the model was created
	        if (method === 'insert' && this.id == null) {
	          var updatedCols = {};
	          updatedCols[this.idAttribute] = this.id = resp[0];
	          var updatedAttrs = this.parse(updatedCols);
	          for (var attr in updatedAttrs) {
	            this.attributes[attr] = updatedAttrs[attr];
	          }
	        } else if (method === 'update' && resp === 0) {
	          if (options.require !== false) {
	            throw new this.constructor.NoRowsUpdatedError('No Rows Updated');
	          }
	        }

	        // In case we need to reference the `previousAttributes` for the this
	        // in the following event handlers.
	        options.previousAttributes = this._previousAttributes;

	        this._reset();

	        /**
	         * Saved event.
	         *
	         * Fired after an `insert` or `update` query.
	         *
	         * @event Model#saved
	         * @param {Model}  model    The model firing the event.
	         * @param {Object} resp     The database response.
	         * @param {Object} options  Options object passed to {@link Model#save save}.
	         * @returns {Promise}
	         */

	        /**
	         * Created event.
	         *
	         * Fired after an `insert` query.
	         *
	         * @event Model#created
	         * @param {Model}  model    The model firing the event.
	         * @param {Object} attrs    Model firing the event.
	         * @param {Object} options  Options object passed to {@link Model#save save}.
	         * @returns {Promise}
	         */

	        /**
	         * Updated event.
	         *
	         * Fired after an `update` query.
	         *
	         * @event Model#updated
	         * @param {Model}  model    The model firing the event.
	         * @param {Object} attrs    Model firing the event.
	         * @param {Object} options  Options object passed to {@link Model#save save}.
	         * @returns {Promise}
	         */
	        return this.triggerThen(method === 'insert' ? 'created saved' : 'updated saved', this, resp, options);
	      });
	    }).return(this);
	  }),

	  /**
	   * `destroy` performs a `delete` on the model, using the model's {@link
	   * Model#idAttribute idAttribute} to constrain the query.
	   *
	   * A {@link Model#destroying "destroying"} event is triggered on the model before being
	   * destroyed. To prevent destroying the model (with validation, etc.), throwing an error
	   * inside one of these event listeners will stop destroying the model and
	   * reject the promise.
	   *
	   * A {@link Model#destroyed "destroyed"} event is fired after the model's
	   * removal is completed.
	   *
	   * @method Model#destroy
	   *
	   * @param {Object=}      options                  Hash of options.
	   * @param {Transaction=} options.transacting      Optionally run the query in a transaction.
	   * @param {bool} [options.require=true]
	   *   Throw a {@link Model.NoRowsDeletedError} if no records are affected by destroy.
	   *
	   * @example
	   *
	   * new User({id: 1})
	   *   .destroy()
	   *   .then(function(model) {
	   *     // ...
	   *   });
	   *
	   * @fires Model#destroying
	   * @fires Model#destroyed
	   *
	   * @throws {Model.NoRowsDeletedError}
	   *
	   * @returns {Promise<Model>} A promise resolving to the destroyed and thus "empty" model.
	   */
	  destroy: _promise2.default.method(function (options) {
	    options = options ? _lodash2.default.clone(options) : {};
	    var sync = this.sync(options);
	    options.query = sync.query;
	    return _promise2.default.bind(this).then(function () {

	      /**
	       * Destroying event.
	       *
	       * Fired before a `delete` query. A promise may be returned from the event
	       * handler for async behaviour. Throwing an exception from the handler
	       * will reject the promise and cancel the deletion.
	       *
	       * @event Model#destroying
	       * @param {Model}  model    The model firing the event.
	       * @param {Object} attrs    Model firing the event.
	       * @param {Object} options  Options object passed to {@link Model#save save}.
	       * @returns {Promise}
	       */
	      return this.triggerThen('destroying', this, options);
	    }).then(function () {
	      return sync.del();
	    }).then(function (resp) {
	      if (options.require && resp === 0) {
	        throw new this.constructor.NoRowsDeletedError('No Rows Deleted');
	      }
	      this.clear();

	      /**
	       * Destroyed event.
	       *
	       * Fired before a `delete` query. A promise may be returned from the event
	       * handler for async behaviour. 
	       *
	       * @event Model#destroyed
	       * @param {Model}  model    The model firing the event.
	       * @param {Object} attrs    Model firing the event.
	       * @param {Object} options  Options object passed to {@link Model#save save}.
	       * @returns {Promise}
	       */
	      return this.triggerThen('destroyed', this, resp, options);
	    }).then(this._reset);
	  }),

	  /**
	   *  Used to reset the internal state of the current query builder instance.
	   *  This method is called internally each time a database action is completed
	   *  by {@link Sync}
	   *
	   *  @method Model#resetQuery
	   *  @returns {Model}          Self, this method is chainable.
	   */
	  resetQuery: function resetQuery() {
	    this._knex = null;
	    return this;
	  },

	  /**
	   * The `query` method is used to tap into the underlying Knex query builder
	   * instance for the current model. If called with no arguments, it will
	   * return the query builder directly. Otherwise, it will call the specified
	   * method on the query builder, applying any additional arguments from the
	   * `model.query` call. If the method argument is a function, it will be
	   * called with the Knex query builder as the context and the first argument,
	   * returning the current model.
	   *
	   * @example
	   *
	   * model
	   *   .query('where', 'other_id', '=', '5')
	   *   .fetch()
	   *   .then(function(model) {
	   *     // ...
	   *   });
	   *   
	   * model
	   *   .query({where: {other_id: '5'}, orWhere: {key: 'value'}})
	   *   .fetch()
	   *   .then(function(model) {
	   *     // ...
	   *   });
	   *   
	   * model.query(function(qb) {
	   *   qb.where('other_person', 'LIKE', '%Demo').orWhere('other_id', '>', 10);
	   * }).fetch()
	   *   .then(function(model) { // ...
	   *   
	   * let qb = model.query();
	   *     qb.where({id: 1}).select().then(function(resp) { // ...
	   *
	   * @method Model#query
	   * @param {function|Object|...string=} arguments The query method.
	   * @returns {Model|QueryBuilder}
	   *   Will return this model or, if called with no arguments, the underlying query builder.
	   *
	   * @see {@link http://knexjs.org/#Builder Knex `QueryBuilder`}
	   */
	  query: function query() {
	    return _helpers2.default.query(this, _lodash2.default.toArray(arguments));
	  },

	  /**
	   * The where method is used as convenience for the most common {@link
	   * Model#query query} method, adding a where clause to the builder. Any
	   * additional knex methods may be accessed using {@link Model#query query}.
	   *
	   * Accepts either key, value syntax, or a hash of attributes.
	   *
	   * @example
	   *
	   * model.where('favorite_color', '<>', 'green').fetch().then(function() { //...
	   * // or
	   * model.where('favorite_color', 'red').fetch().then(function() { //...
	   * // or
	   * model.where({favorite_color: 'red', shoe_size: 12}).then(function() { //...
	   *
	   * @method Model#where
	   * @param {Object|...string} method
	   *
	   *   Either `key, [operator], value` syntax, or a hash of attributes to
	   *   match. Note that these must be formatted as they are in the database,
	   *   not how they are stored after {@link Model#parse}.
	   *
	   * @returns {Model} Self, this method is chainable.
	   *
	   * @see Model#query
	   */
	  where: function where() {
	    var args = _lodash2.default.toArray(arguments);
	    return this.query.apply(this, ['where'].concat(args));
	  },

	  /* Ensure that QueryBuilder is copied on clone. */
	  clone: function clone() {
	    var cloned = _model2.default.prototype.clone.apply(this, arguments);
	    if (this._knex != null) {
	      cloned._knex = cloned._builder(this._knex.clone());
	    }
	    return cloned;
	  },

	  /**
	   * Creates and returns a new Bookshelf.Sync instance.
	   *
	   * @method Model#sync
	   * @private
	   * @returns Sync
	   */
	  sync: function sync(options) {
	    return new _sync2.default(this, options);
	  },

	  /**
	   * Helper for setting up the `morphOne` or `morphMany` relations.
	   *
	   * @method Model#_morphOneOrMany
	   * @private
	   */
	  _morphOneOrMany: function _morphOneOrMany(Target, morphName, columnNames, morphValue, type) {
	    if (!_lodash2.default.isArray(columnNames)) {
	      // Shift by one place
	      morphValue = columnNames;
	      columnNames = null;
	    }
	    if (!morphName || !Target) throw new Error('The polymorphic `name` and `Target` are required.');
	    return this._relation(type, Target, { morphName: morphName, morphValue: morphValue, columnNames: columnNames }).init(this);
	  },

	  /**
	   * @name Model#_handleResponse
	   * @private
	   * @description
	   *
	   *   Handles the response data for the model, returning from the model's fetch call.
	   *
	   * @param {Object} Response from Knex query.
	   *
	   * @todo: need to check on Backbone's status there, ticket #2636
	   * @todo: {silent: true, parse: true}, for parity with collection#set
	   */
	  _handleResponse: function _handleResponse(response) {
	    var relatedData = this.relatedData;
	    this.set(this.parse(response[0]), { silent: true })._reset();
	    if (relatedData && relatedData.isJoined()) {
	      relatedData.parsePivot([this]);
	    }
	  },

	  /**
	   * @name Model#_handleEager
	   * @private
	   * @description
	   *
	   *   Handles the related data loading on the model.
	   *
	   * @param {Object} Response from Knex query.
	   */
	  _handleEager: function _handleEager(response, options) {
	    return new _eager2.default([this], response, this).fetch(options);
	  }
	}, {
	  extended: function extended(child) {
	    /**
	     * @class Model.NotFoundError
	     * @description
	     *
	     *   Thrown when no records are found by {@link Model#fetch fetch}, {@link
	     *   Model#fetchAll fetchAll} or {@link Model#refresh} when called with the
	     *   `{require: true}` option.
	     */
	    child.NotFoundError = (0, _createError2.default)(this.NotFoundError);

	    /**
	     * @class Model.NoRowsUpdatedError
	     * @description
	     *
	     *   Thrown when no records are saved by {@link Model#save save}
	     *   unless called with the `{require: false}` option.
	     */
	    child.NoRowsUpdatedError = (0, _createError2.default)(this.NoRowsUpdatedError);

	    /**
	     * @class Model.NoRowsDeletedError
	     * @description
	     *
	     *   Thrown when no record is deleted by {@link Model#destroy destroy}
	     *   if called with the `{require: true}` option.
	     */
	    child.NoRowsDeletedError = (0, _createError2.default)(this.NoRowsDeletedError);
	  }
	});

	BookshelfModel.NotFoundError = _errors2.default.NotFoundError;
	BookshelfModel.NoRowsUpdatedError = _errors2.default.NoRowsUpdatedError;
	BookshelfModel.NoRowsDeletedError = _errors2.default.NoRowsDeletedError;

	module.exports = BookshelfModel;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _lodash = __webpack_require__(2);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _sync = __webpack_require__(35);

	var _sync2 = _interopRequireDefault(_sync);

	var _helpers = __webpack_require__(4);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _eager = __webpack_require__(36);

	var _eager2 = _interopRequireDefault(_eager);

	var _errors = __webpack_require__(9);

	var _errors2 = _interopRequireDefault(_errors);

	var _collection = __webpack_require__(38);

	var _collection2 = _interopRequireDefault(_collection);

	var _promise = __webpack_require__(34);

	var _promise2 = _interopRequireDefault(_promise);

	var _createError = __webpack_require__(50);

	var _createError2 = _interopRequireDefault(_createError);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @class Collection
	 * @extends CollectionBase
	 * @inheritdoc
	 * @classdesc
	 *
	 * Collections are ordered sets of models returned from the database, from a
	 * {@link Model#fetchAll fetchAll} call. They may be used with a suite of
	 * {@link http://lodash.com/ Lodash} methods.
	 *
	 * @constructor
	 * @description
	 *
	 * When creating a {@link Collection}, you may choose to pass in the initial
	 * array of {@link Model models}. The collection's {@link Collection#comparator
	 * comparator} may be included as an option. Passing `false` as the comparator
	 * option will prevent sorting. If you define an {@link Collection#initialize
	 * initialize} function, it will be invoked when the collection is created.
	 *
	 * @example
	 * let tabs = new TabSet([tab1, tab2, tab3]);
	 *
	 * @param {(Model[])=} models Initial array of models.
	 * @param {Object=} options
	 * @param {bool} [options.comparator=false]
	 *   {@link Collection#comparator Comparator} for collection, or `false` to disable sorting.
	 */
	var BookshelfCollection = _collection2.default.extend({

	  /**
	   * @method Collection#through
	   * @private
	   * @description
	   * Used to define passthrough relationships - `hasOne`, `hasMany`, `belongsTo`
	   * or `belongsToMany`, "through" an `Interim` model or collection.
	   */
	  through: function through(Interim, foreignKey, otherKey) {
	    return this.relatedData.through(this, Interim, { throughForeignKey: foreignKey, otherKey: otherKey });
	  },

	  /**
	   * @method Collection#fetch
	   * @description
	   * Fetch the default set of models for this collection from the database,
	   * resetting the collection when they arrive. If you wish to trigger an error
	   * if the fetched collection is empty, pass `{require: true}` as one of the
	   * options to the {@link Collection#fetch fetch} call. A {@link
	   * Collection#fetched "fetched"} event will be fired when records are
	   * successfully retrieved. If you need to constrain the query performed by
	   * `fetch`, you can call the {@link Collection#query query} method before
	   * calling `fetch`.
	   *
	   * *If you'd like to only fetch specific columns, you may specify a `columns`
	   * property in the options for the `fetch` call.*
	   *
	   * The `withRelated` option may be specified to fetch the models of the
	   * collection, eager loading any specified {@link Relation relations} named on
	   * the model. A single property, or an array of properties can be specified as
	   * a value for the `withRelated` property. The results of these relation
	   * queries will be loaded into a relations property on the respective models,
	   * may be retrieved with the {@link Model#related related} method.
	   *
	   * @fires Collection#fetched
	   * @throws {Collection.EmptyError}
	   *   Upon a sucessful query resulting in no records returns. Only fired if `require: true` is passed as an option.
	   *
	   * @param {Object=} options
	   * @param {bool} [options.require=false] Trigger a {@link Collection.EmptyError} if no records are found.
	   * @param {string|string[]} [options.withRelated=[]] A relation, or list of relations, to be eager loaded as part of the `fetch` operation.
	   * @returns {Promise<Collection>}
	   */
	  fetch: _promise2.default.method(function (options) {
	    options = options ? _lodash2.default.clone(options) : {};
	    return this.sync(options).select().bind(this).tap(function (response) {
	      if (!response || response.length === 0) {
	        if (options.require) throw new this.constructor.EmptyError('EmptyResponse');
	        return _promise2.default.reject(null);
	      }
	    })

	    // Now, load all of the data onto the collection as necessary.
	    .tap(this._handleResponse)

	    // If the "withRelated" is specified, we also need to eager load all of the
	    // data on the collection, as a side-effect, before we ultimately jump into the
	    // next step of the collection. Since the `columns` are only relevant to the current
	    // level, ensure those are omitted from the options.
	    .tap(function (response) {
	      if (options.withRelated) {
	        return this._handleEager(response, _lodash2.default.omit(options, 'columns'));
	      }
	    }).tap(function (response) {

	      /**
	       * @event Collection#fetched
	       *
	       * @description
	       * Fired after a `fetch` operation. A promise may be returned from the
	       * event handler for async behaviour.
	       *
	       * @param {Collection} collection The collection performing the {@link Collection#fetch}.
	       * @param {Object} reponse Knex query response.
	       * @param {Object} options Options object passed to {@link Collection#fetch fetch}.
	       * @returns {Promise}
	       */
	      return this.triggerThen('fetched', this, response, options);
	    }).catch(function (err) {
	      if (err !== null) throw err;
	      this.reset([], { silent: true });
	    }).return(this);
	  }),

	  /**
	   * @method Collection#count
	   * @since 0.8.2
	   * @description
	   *
	   * Get the number of records in the collection's table.
	   *
	   * @example
	   *
	   * // select count(*) from shareholders where company_id = 1 and share &gt; 0.1;
	   * Company.forge({id:1})
	   *   .shareholders()
	   *   .query('where', 'share', '>', '0.1')
	   *   .count()
	   *   .then(function(count) {
	   *     assert(count === 3);
	   *   });
	   *
	   * @param {string} [column='*']
	   *   Specify a column to count - rows with null values in this column will be excluded.
	   * @param {Object=} options
	   *   Hash of options.
	   * @returns {Promise<Number>}
	   *   A promise resolving to the number of matching rows.
	   */
	  count: _promise2.default.method(function (column, options) {
	    if (!_lodash2.default.isString(column)) {
	      options = column;
	      column = undefined;
	    }
	    if (options) options = _lodash2.default.clone(options);
	    return this.sync(options).count(column);
	  }),

	  /**
	   * @method Collection#fetchOne
	   * @description
	   *
	   * Fetch and return a single {@link Model model} from the collection,
	   * maintaining any {@link Relation relation} data from the collection, and
	   * any {@link Collection#query query} parameters that have already been passed
	   * to the collection. Especially helpful on relations, where you would only
	   * like to return a single model from the associated collection.
	   *
	   * @example
	   * 
	   * // select * from authors where site_id = 1 and id = 2 limit 1;
	   * new Site({id:1})
	   *   .authors()
	   *   .query({where: {id: 2}})
	   *   .fetchOne()
	   *   .then(function(model) {
	   *     // ...
	   *   });
	   *
	   * @param {Object=}  options
	   * @param {boolean} [options.require=false]
	   *   If `true`, will reject the returned response with a {@link
	   *   Model.NotFoundError NotFoundError} if no result is found.
	   * @param {(string|string[])} [options.columns='*']
	   *   Limit the number of columns fetched.
	   * @param {Transaction} options.transacting
	   *  Optionally run the query in a transaction.
	   *
	   * @throws {Model.NotFoundError}
	   * @returns {Promise<Model|null>}
	   *  A promise resolving to the fetched {@link Model model} or `null` if none exists.
	   */
	  fetchOne: _promise2.default.method(function (options) {
	    var model = new this.model();
	    model._knex = this.query().clone();
	    this.resetQuery();
	    if (this.relatedData) model.relatedData = this.relatedData;
	    return model.fetch(options);
	  }),

	  /**
	   * @method Collection#load
	   * @description
	   * `load` is used to eager load relations onto a Collection, in a similar way
	   * that the `withRelated` property works on {@link Collection#fetch fetch}.
	   * Nested eager loads can be specified by separating the nested relations with
	   * `'.'`.
	   *
	   *  @param {string|string[]} relations The relation, or relations, to be loaded.
	   *  @param {Object=}      options Hash of options.
	   *  @param {Transaction=} options.transacting
	   *
	   *  @returns {Promise<Collection>} A promise resolving to this {@link
	   *  Collection collection}
	   */
	  load: _promise2.default.method(function (relations, options) {
	    if (!_lodash2.default.isArray(relations)) relations = [relations];
	    options = _lodash2.default.extend({}, options, { shallow: true, withRelated: relations });
	    return new _eager2.default(this.models, this.toJSON(options), new this.model()).fetch(options).return(this);
	  }),

	  /**
	   * @method Collection#create
	   * @description
	   *
	   * Convenience to create a new instance of a {@link Model model} within a
	   * collection. Equivalent to instantiating a model with a hash of {@link
	   * Model#attributes attributes}, {@link Model#save saving} the model to the
	   * database, and adding the model to the collection after being successfully
	   * created.
	   *
	   * @param {Object} model A set of attributes to be set on the new model.
	   * @param {Object=} options
	   * @param {Transaction=} options.transacting
	   *
	   * @returns {Promise<Model>} A promise resolving with the new {@link Modle
	   * model}.
	   */
	  create: _promise2.default.method(function (model, options) {
	    options = options ? _lodash2.default.clone(options) : {};
	    var relatedData = this.relatedData;
	    model = this._prepareModel(model, options);

	    // If we've already added things on the query chain,
	    // these are likely intended for the model.
	    if (this._knex) {
	      model._knex = this._knex;
	      this.resetQuery();
	    }
	    return _helpers2.default.saveConstraints(model, relatedData).save(null, options).bind(this).then(function () {
	      if (relatedData && relatedData.type === 'belongsToMany') {
	        return this.attach(model, _lodash2.default.omit(options, 'query'));
	      }
	    }).then(function () {
	      this.add(model, options);
	    }).return(model);
	  }),

	  /**
	   * @method Collection#resetQuery
	   * @description
	   * Used to reset the internal state of the current query builder instance.
	   * This method is called internally each time a database action is completed
	   * by {@link Sync}.
	   *
	   * @returns {Collection} Self, this method is chainable.
	   */
	  resetQuery: function resetQuery() {
	    this._knex = null;
	    return this;
	  },

	  /**
	   * @method Collection#query
	   * @description
	   *
	   * `query` is used to tap into the underlying Knex query builder instance for
	   * the current collection. If called with no arguments, it will return the
	   * query builder directly. Otherwise, it will call the specified `method` on
	   * the query builder, applying any additional arguments from the
	   * `collection.query` call. If the `method` argument is a function, it will be
	   * called with the Knex query builder as the context and the first argument.
	   *
	   * @example
	   *
	   * let qb = collection.query();
	   *     qb.where({id: 1}).select().then(function(resp) {...
	   * 
	   * collection.query(function(qb) {
	   *   qb.where('id', '>', 5).andWhere('first_name', '=', 'Test');
	   * }).fetch()
	   *   .then(function(collection) {...
	   * 
	   * collection
	   *   .query('where', 'other_id', '=', '5')
	   *   .fetch()
	   *   .then(function(collection) {
	   *     ...
	   *   });
	   *
	   * @param {function|Object|...string=} arguments The query method.
	   * @returns {Collection|QueryBuilder}
	   *   Will return this model or, if called with no arguments, the underlying query builder.
	   *
	   * @see {@link http://knexjs.org/#Builder Knex `QueryBuilder`}
	   */
	  query: function query() {
	    return _helpers2.default.query(this, _lodash2.default.toArray(arguments));
	  },

	  /**
	   * @method Collection#query
	   * @private
	   * @description Creates and returns a new `Bookshelf.Sync` instance.
	   */
	  sync: function sync(options) {
	    return new _sync2.default(this, options);
	  },

	  /* Ensure that QueryBuilder is copied on clone. */
	  clone: function clone() {
	    var cloned = _collection2.default.prototype.clone.apply(this, arguments);
	    if (this._knex != null) {
	      cloned._knex = cloned._builder(this._knex.clone());
	    }
	    return cloned;
	  },

	  /**
	   * @method Collection#_handleResponse
	   * @private
	   * @description
	   * Handles the response data for the collection, returning from the
	   * collection's `fetch` call.
	   */
	  _handleResponse: function _handleResponse(response) {
	    var relatedData = this.relatedData;
	    this.set(response, { silent: true, parse: true }).invoke('_reset');
	    if (relatedData && relatedData.isJoined()) {
	      relatedData.parsePivot(this.models);
	    }
	  },

	  /**
	   * @method Collection#_handleEager
	   * @private
	   * @description
	   * Handle the related data loading on the collection.
	   */
	  _handleEager: function _handleEager(response, options) {
	    return new _eager2.default(this.models, response, new this.model()).fetch(options);
	  }

	}, {

	  extended: function extended(child) {
	    /**
	     * @class Collection.NotFoundError
	     * @description
	     *   Thrown when no records are found by {@link Collection#fetch fetch},
	     *   when called with the `{require: true}` option.
	     */
	    child.EmptyError = (0, _createError2.default)(this.EmptyError);
	  }

	});

	BookshelfCollection.EmptyError = _errors2.default.EmptyError;

	exports.default = BookshelfCollection;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _instanceof(left, right) { if (right != null && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

	// Relation
	// ---------------
	var _ = __webpack_require__(2);
	var inflection = __webpack_require__(11);

	var Helpers = __webpack_require__(4);
	var ModelBase = __webpack_require__(37);
	var RelationBase = __webpack_require__(39);
	var Promise = __webpack_require__(34);
	var push = [].push;

	var BookshelfRelation = RelationBase.extend({

	  // Assembles the new model or collection we're creating an instance of,
	  // gathering any relevant primitives from the parent object,
	  // without keeping any hard references.
	  init: function init(parent) {
	    this.parentId = parent.id;
	    this.parentTableName = _.result(parent, 'tableName');
	    this.parentIdAttribute = _.result(parent, 'idAttribute');

	    if (this.isInverse()) {
	      // use formatted attributes so that morphKey and foreignKey will match
	      // attribute keys
	      var attributes = parent.format(_.clone(parent.attributes));

	      // If the parent object is eager loading, and it's a polymorphic `morphTo` relation,
	      // we can't know what the target will be until the models are sorted and matched.
	      if (this.type === 'morphTo' && !parent._isEager) {
	        this.target = Helpers.morphCandidate(this.candidates, attributes[this.key('morphKey')]);
	        this.targetTableName = _.result(this.target.prototype, 'tableName');
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
	  through: function through(source, Target, options) {
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
	  key: function key(keyName) {
	    var idKeyName;
	    if (this[keyName]) return this[keyName];
	    switch (keyName) {
	      case 'otherKey':
	        this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
	        break;
	      case 'throughForeignKey':
	        this[keyName] = singularMemo(this.joinTable()) + '_' + this.throughIdAttribute;
	        break;
	      case 'foreignKey':
	        switch (this.type) {
	          case 'morphTo':
	            idKeyName = this.columnNames && this.columnNames[1] ? this.columnNames[1] : this.morphName + '_id';
	            this[keyName] = idKeyName;
	            break;
	          case 'belongsTo':
	            this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
	            break;
	          default:
	            if (this.isMorph()) {
	              this[keyName] = this.columnNames && this.columnNames[1] ? this.columnNames[1] : this.morphName + '_id';
	              break;
	            }
	            this[keyName] = singularMemo(this.parentTableName) + '_' + this.parentIdAttribute;
	            break;
	        }
	        break;
	      case 'morphKey':
	        this[keyName] = this.columnNames && this.columnNames[0] ? this.columnNames[0] : this.morphName + '_type';
	        break;
	      case 'morphValue':
	        this[keyName] = this.parentTableName || this.targetTableName;
	        break;
	    }
	    return this[keyName];
	  },

	  // Injects the necessary `select` constraints into a `knex` query builder.
	  selectConstraints: function selectConstraints(knex, options) {
	    var resp = options.parentResponse;

	    // The `belongsToMany` and `through` relations have joins & pivot columns.
	    if (this.isJoined()) this.joinClauses(knex);

	    // Call the function, if one exists, to constrain the eager loaded query.
	    if (options._beforeFn) options._beforeFn.call(knex, knex);

	    // The base select column
	    if (_.isArray(options.columns)) {
	      knex.columns(options.columns);
	    }

	    var currentColumns = _.findWhere(knex._statements, { grouping: 'columns' });

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
	  joinColumns: function joinColumns(knex) {
	    var columns = [];
	    var joinTable = this.joinTable();
	    if (this.isThrough()) columns.push(this.throughIdAttribute);
	    columns.push(this.key('foreignKey'));
	    if (this.type === 'belongsToMany') columns.push(this.key('otherKey'));
	    push.apply(columns, this.pivotColumns);
	    knex.columns(_.map(columns, function (col) {
	      return joinTable + '.' + col + ' as _pivot_' + col;
	    }));
	  },

	  // Generates the join clauses necessary for the current relation.
	  joinClauses: function joinClauses(knex) {
	    var joinTable = this.joinTable();

	    if (this.type === 'belongsTo' || this.type === 'belongsToMany') {

	      var targetKey = this.type === 'belongsTo' ? this.key('foreignKey') : this.key('otherKey');

	      knex.join(joinTable, joinTable + '.' + targetKey, '=', this.targetTableName + '.' + this.targetIdAttribute);

	      // A `belongsTo` -> `through` is currently the only relation with two joins.
	      if (this.type === 'belongsTo') {
	        knex.join(this.parentTableName, joinTable + '.' + this.throughIdAttribute, '=', this.parentTableName + '.' + this.key('throughForeignKey'));
	      }
	    } else {
	      knex.join(joinTable, joinTable + '.' + this.throughIdAttribute, '=', this.targetTableName + '.' + this.key('throughForeignKey'));
	    }
	  },

	  // Check that there isn't an incorrect foreign key set, vs. the one
	  // passed in when the relation was formed.
	  whereClauses: function whereClauses(knex, resp) {
	    var key;

	    if (this.isJoined()) {
	      var targetTable = this.type === 'belongsTo' ? this.parentTableName : this.joinTable();
	      key = targetTable + '.' + (this.type === 'belongsTo' ? this.parentIdAttribute : this.key('foreignKey'));
	    } else {
	      key = this.targetTableName + '.' + (this.isInverse() ? this.targetIdAttribute : this.key('foreignKey'));
	    }

	    knex[resp ? 'whereIn' : 'where'](key, resp ? this.eagerKeys(resp) : this.parentFk);

	    if (this.isMorph()) {
	      knex.where(this.targetTableName + '.' + this.key('morphKey'), this.key('morphValue'));
	    }
	  },

	  // Fetches all `eagerKeys` from the current relation.
	  eagerKeys: function eagerKeys(resp) {
	    var key = this.isInverse() && !this.isThrough() ? this.key('foreignKey') : this.parentIdAttribute;
	    return _.uniq(_.pluck(resp, key));
	  },

	  // Generates the appropriate standard join table.
	  joinTable: function joinTable() {
	    if (this.isThrough()) return this.throughTableName;
	    return this.joinTableName || [this.parentTableName, this.targetTableName].sort().join('_');
	  },

	  // Creates a new model or collection instance, depending on
	  // the `relatedData` settings and the models passed in.
	  relatedInstance: function relatedInstance(models) {
	    models = models || [];

	    var Target = this.target;

	    // If it's a single model, check whether there's already a model
	    // we can pick from... otherwise create a new instance.
	    if (this.isSingle()) {
	      if (!_instanceof(Target.prototype, ModelBase)) {
	        throw new Error('The ' + this.type + ' related object must be a Bookshelf.Model');
	      }
	      return models[0] || new Target();
	    }

	    // Allows us to just use a model, but create a temporary
	    // collection for a "*-many" relation.
	    if (_instanceof(Target.prototype, ModelBase)) {
	      return Target.collection(models, { parse: true });
	    }
	    return new Target(models, { parse: true });
	  },

	  // Groups the related response according to the type of relationship
	  // we're handling, for easy attachment to the parent models.
	  eagerPair: function eagerPair(relationName, related, parentModels) {
	    var _this = this;

	    var model;

	    // If this is a morphTo, we only want to pair on the morphValue for the current relation.
	    if (this.type === 'morphTo') {
	      parentModels = _.filter(parentModels, function (m) {
	        return m.get(_this.key('morphKey')) === _this.key('morphValue');
	      });
	    }

	    // If this is a `through` or `belongsToMany` relation, we need to cleanup & setup the `interim` model.
	    if (this.isJoined()) related = this.parsePivot(related);

	    // Group all of the related models for easier association with their parent models.
	    var grouped = _.groupBy(related, function (m) {
	      if (m.pivot) {
	        return _this.isInverse() && _this.isThrough() ? m.pivot.id : m.pivot.get(_this.key('foreignKey'));
	      } else {
	        return _this.isInverse() ? m.id : m.get(_this.key('foreignKey'));
	      }
	    });

	    // Loop over the `parentModels` and attach the grouped sub-models,
	    // keeping the `relatedData` on the new related instance.
	    var i = -1;
	    while (++i < parentModels.length) {
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
	    i = -1;
	    while (++i < related.length) {
	      model = related[i];
	      model.attributes = model.parse(model.attributes);
	    }

	    return related;
	  },

	  // The `models` is an array of models returned from the fetch,
	  // after they're `set`... parsing out any of the `_pivot_` items from the
	  // join table and assigning them on the pivot model or object as appropriate.
	  parsePivot: function parsePivot(models) {
	    var Through = this.throughTarget;
	    return _.map(models, function (model) {
	      var data = {},
	          keep = {},
	          attrs = model.attributes,
	          through;
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
	        model.pivot = through ? through.set(data, { silent: true }) : new this.Model(data, {
	          tableName: this.joinTable()
	        });
	      }
	      return model;
	    }, this);
	  },

	  // A few predicates to help clarify some of the logic above.
	  isThrough: function isThrough() {
	    return this.throughTarget != null;
	  },
	  isJoined: function isJoined() {
	    return this.type === 'belongsToMany' || this.isThrough();
	  },
	  isMorph: function isMorph() {
	    return this.type === 'morphOne' || this.type === 'morphMany';
	  },
	  isSingle: function isSingle() {
	    var type = this.type;
	    return type === 'hasOne' || type === 'belongsTo' || type === 'morphOne' || type === 'morphTo';
	  },
	  isInverse: function isInverse() {
	    return this.type === 'belongsTo' || this.type === 'morphTo';
	  },

	  // Sets the `pivotColumns` to be retrieved along with the current model.
	  withPivot: function withPivot(columns) {
	    if (!_.isArray(columns)) columns = [columns];
	    this.pivotColumns = this.pivotColumns || [];
	    push.apply(this.pivotColumns, columns);
	  }

	});

	// Simple memoization of the singularize call.
	var singularMemo = (function () {
	  var cache = Object.create(null);
	  return function (arg) {
	    if (!(arg in cache)) {
	      cache[arg] = inflection.singularize(arg);
	    }
	    return cache[arg];
	  };
	})();

	// Specific to many-to-many relationships, these methods are mixed
	// into the `belongsToMany` relationships when they are created,
	// providing helpers for attaching and detaching related models.
	var pivotHelpers = {

	  /**
	   * Attaches one or more `ids` or models from a foreign table to the current
	   * table, on a {@linkplain many-to-many} relation. Creates and saves a new
	   * model and attaches the model with the related model.
	   *
	   *     var admin1 = new Admin({username: 'user1', password: 'test'});
	   *     var admin2 = new Admin({username: 'user2', password: 'test'});
	   *
	   *     Promise.all([admin1.save(), admin2.save()])
	   *       .then(function() {
	   *         return Promise.all([
	   *         new Site({id: 1}).admins().attach([admin1, admin2]),
	   *         new Site({id: 2}).admins().attach(admin2)
	   *       ]);
	   *     })
	   *
	   * This method (along with {@link Collection#detach} and {@link
	   * Collection#updatePivot}) are mixed in to a {@link Collection} when
	   * returned by a {@link Model#belongsToMany belongsToMany} relation.
	   *
	   * @method Collection#attach
	   * @param {mixed|mixed[]} ids
	   *   One or more ID values or models to be attached to the relation.
	   * @param {Object} options
	   *   A hash of options.
	   * @param {Transaction} options.transacting
	   *   Optionally run the query in a transaction.
	   * @returns {Promise<Collection>}
	   *   A promise resolving to the updated Collection.
	   */

	  attach: function attach(ids, options) {
	    var _this2 = this;

	    return Promise.try(function () {
	      return _this2.triggerThen('attaching', _this2, ids, options);
	    }).then(function () {
	      return _this2._handler('insert', ids, options);
	    }).then(function (response) {
	      return _this2.triggerThen('attached', _this2, response, options);
	    }).return(this);
	  },

	  /**
	   * Detach one or more related objects from their pivot tables. If a model or
	   * id is passed, it attempts to remove the pivot table based on that foreign
	   * key. If no parameters are specified, we assume we will detach all related
	   * associations.
	   *
	   * This method (along with {@link Collection#attach} and {@link
	   * Collection#updatePivot}) are mixed in to a {@link Collection} when returned
	   * by a {@link Model#belongsToMany belongsToMany} relation.
	   *
	   * @method Collection#detach
	   * @param {mixed|mixed[]} [ids]
	   *   One or more ID values or models to be detached from the relation.
	   * @param {Object} options
	   *   A hash of options.
	   * @param {Transaction} options.transacting
	   *   Optionally run the query in a transaction.
	   * @returns {Promise<undefined>}
	   *   A promise resolving to `undefined`.
	   */
	  detach: function detach(ids, options) {
	    var _this3 = this;

	    return Promise.try(function () {
	      return _this3.triggerThen('detaching', _this3, ids, options);
	    }).then(function () {
	      return _this3._handler('delete', ids, options);
	    }).then(function (response) {
	      return _this3.triggerThen('detached', _this3, response, options);
	    }).return(this);
	  },

	  /**
	   * The `updatePivot` method is used exclusively on {@link Model#belongsToMany
	   * belongsToMany} relations, and allows for updating pivot rows on the joining
	   * table.
	   *
	   * This method (along with {@link Collection#attach} and {@link
	   * Collection#detach}) are mixed in to a {@link Collection} when returned
	   * by a {@link Model#belongsToMany belongsToMany} relation.
	   *
	   * @method Collection#updatePivot
	   * @param {Object} attributes
	   *   Values to be set in the `update` query.
	   * @param {Object} [options]
	   *   A hash of options.
	   * @param {function|Object} [options.query]
	   *   Constrain the update query. Similar to the `method` argument to {@link
	   *   Model#query}.
	   * @param {bool} [options.require=false]
	   *   Causes promise to be rejected with an Error if no rows were updated.
	   * @param {Transaction} [options.transacting]
	   *   Optionally run the query in a transaction.
	   * @returns {Promise<Number>}
	   *   A promise resolving to number of rows updated.
	   */
	  updatePivot: function updatePivot(attributes, options) {
	    return this._handler('update', attributes, options);
	  },

	  /**
	   * The `withPivot` method is used exclusively on {@link Model#belongsToMany
	   * belongsToMany} relations, and allows for additional fields to be pulled
	   * from the joining table.
	   *
	   *     var Tag = bookshelf.Model.extend({
	   *       comments: function() {
	   *         return this.belongsToMany(Comment).withPivot(['created_at', 'order']);
	   *       }
	   *     });
	   *
	   * @method Collection#withPivot
	   * @param {string[]} columns
	   *   Names of columns to be included when retrieving pivot table rows.
	   * @returns {Collection}
	   *   Self, this method is chainable.
	   */
	  withPivot: function withPivot(columns) {
	    this.relatedData.withPivot(columns);
	    return this;
	  },

	  // Helper for handling either the `attach` or `detach` call on
	  // the `belongsToMany` or `hasOne` / `hasMany` :through relationship.
	  _handler: Promise.method(function (method, ids, options) {
	    var pending = [];
	    if (ids == null) {
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
	  _processPivot: Promise.method(function (method, item) {
	    var relatedData = this.relatedData,
	        args = Array.prototype.slice.call(arguments),
	        fks = {},
	        data = {};

	    fks[relatedData.key('foreignKey')] = relatedData.parentFk;

	    // If the item is an object, it's either a model
	    // that we're looking to attach to this model, or
	    // a hash of attributes to set in the relation.
	    if (_.isObject(item)) {
	      if (_instanceof(item, ModelBase)) {
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
	  _processPlainPivot: Promise.method(function (method, item, options, data) {
	    var relatedData = this.relatedData;

	    // Grab the `knex` query builder for the current model, and
	    // check if we have any additional constraints for the query.
	    var builder = this._builder(relatedData.joinTable());
	    if (options && options.query) {
	      Helpers.query.call(null, { _knex: builder }, [options.query]);
	    }

	    if (options) {
	      if (options.transacting) builder.transacting(options.transacting);
	      if (options.debug) builder.debug();
	    }

	    var collection = this;
	    if (method === 'delete') {
	      return builder.where(data).del().then(function () {
	        if (!item) return collection.reset();
	        var model = collection.get(data[relatedData.key('otherKey')]);
	        if (model) {
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

	    return builder.insert(data).then(function () {
	      collection.add(item);
	    });
	  }),

	  // Loads or prepares a pivot model based on the constraints and deals with
	  // pivot model changes by calling the appropriate Bookshelf Model API
	  // methods. Returns a promise.
	  _processModelPivot: Promise.method(function (method, item, options, data, fks) {
	    var relatedData = this.relatedData,
	        JoinModel = relatedData.throughTarget,
	        joinModel = new JoinModel();

	    fks = joinModel.parse(fks);
	    data = joinModel.parse(data);

	    if (method === 'insert') {
	      return joinModel.set(data).save(null, options);
	    }

	    return joinModel.set(fks).fetch({
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var createError = __webpack_require__(50);

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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./registry": 12,
		"./registry.js": 12,
		"./virtuals": 13,
		"./virtuals.js": 13,
		"./visibility": 14,
		"./visibility.js": 14
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
	webpackContext.id = 10;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// Registry Plugin -
	// Create a central registry of model/collection constructors to
	// help with the circular reference problem, and for convenience in relations.
	// -----
	module.exports = function (bookshelf) {
	  'use strict';
	  var _ = __webpack_require__(2);

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
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// Virtuals Plugin
	// Allows getting/setting virtual (computed) properties on model instances.
	// -----
	module.exports = function (Bookshelf) {
	  "use strict";
	  var _         = __webpack_require__(2);
	  var Promise   = __webpack_require__(40);
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
	    set: function(key, value, options) {

	      if (key == null) {
	        return this;
	      }

	      // Determine whether we're in the middle of a patch operation based on the 
	      // existance of the `patchAttributes` object.
	      var isPatching = this.patchAttributes != null;

	      // Handle `{key: value}` style arguments.
	      if (_.isObject(key)) {
	        var nonVirtuals = _.omit(key, setVirtual, this);
	        if (isPatching) {
	          _.extend(this.patchAttributes, nonVirtuals);
	        }
	        // Set the non-virtual attributes as normal.
	        return proto.set.call(this, nonVirtuals, value, options);
	      }

	      // Handle `"key", value` style arguments for virtual setter.
	      if (setVirtual.call(this, value, key)) {
	        return this;
	      }

	      // Handle `"key", value` style assignment call to be added to patching
	      // attributes if set("key", value, ...) called from inside a virtual setter.
	      if (isPatching) {
	        this.patchAttributes[key] = value;
	      }
	      
	      return proto.set.apply(this, arguments);
	    },

	    // Override `save` to keep track of state while doing a `patch` operation.
	    save: function(key, value, options) {
	      var attrs;

	      // Handle both `"key", value` and `{key: value}` -style arguments.
	      if (key == null || typeof key === "object") {
	        attrs = key && _.clone(key) || {};
	        options = _.clone(value) || {};
	      } else {
	        (attrs = {})[key] = value;
	        options = options ? _.clone(options) : {};
	      }

	      // Determine whether which kind of save we will do, update or insert.
	      var method = options.method = this.saveMethod(options);

	      // Check if we're going to do a patch, in which case deal with virtuals now.
	      if (options.method === 'update' && options.patch) {

	         // Extend the model state to collect side effects from the virtual setter
	         // callback. If `set` is called, this object will be updated in addition
	         // to the normal `attributes` object.
	         this.patchAttributes = {}

	         // Any setter could throw. We need to reject `save` if they do.
	         try {

	           // Check if any of the patch attribues are virtuals. If so call their
	           // setter. Any setter that calls `this.set` will be modifying
	           // `this.patchAttributes` instead of `this.attributes`.
	           _.each(attrs, (function (value, key) {

	             if (setVirtual.call(this, value, key)) {
	               // This was a virtual, so remove it from the attributes to be
	               // passed to `Model.save`.
	               delete attrs[key];
	             }

	           }).bind(this));

	           // Now add any changes that occurred during the update.
	           _.extend(attrs, this.patchAttributes);
	         } catch (e) {
	           return Promise.reject(e);
	         } finally {
	           // Delete the temporary object.
	           delete this.patchAttributes;
	         }
	      }

	      return proto.save.call(this, attrs, options);
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// Visibility plugin -
	// Useful for hiding/showing particular attributes on `toJSON`.
	// -----
	module.exports = function(Bookshelf) {
	  "use strict";
	  var _      = __webpack_require__(2);
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
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(21)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var global     = __webpack_require__(16)
	  , core       = __webpack_require__(43)
	  , hide       = __webpack_require__(44)
	  , $redef     = __webpack_require__(20)
	  , PROTOTYPE  = 'prototype';
	var ctx = function(fn, that){
	  return function(){
	    return fn.apply(that, arguments);
	  };
	};
	var $def = function(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & $def.G
	    , isProto  = type & $def.P
	    , target   = isGlobal ? global : type & $def.S
	        ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    if(type & $def.B && own)exp = ctx(out, global);
	    else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // extend global
	    if(target && !own)$redef(target, key, out);
	    // export
	    if(exports[key] != out)hide(exports, key, exp);
	    if(isProto)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	global.core = core;
	// type bitmap
	$def.F = 1;  // forced
	$def.G = 2;  // global
	$def.S = 4;  // static
	$def.P = 8;  // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	module.exports = $def;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// add fake Function#toString
	// for correct work wrapped methods / constructors with methods like LoDash isNative
	var global    = __webpack_require__(16)
	  , hide      = __webpack_require__(44)
	  , SRC       = __webpack_require__(24)('src')
	  , TO_STRING = 'toString'
	  , $toString = Function[TO_STRING]
	  , TPL       = ('' + $toString).split(TO_STRING);

	__webpack_require__(43).inspectSource = function(it){
	  return $toString.call(it);
	};

	(module.exports = function(O, key, val, safe){
	  if(typeof val == 'function'){
	    val.hasOwnProperty(SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
	    val.hasOwnProperty('name') || hide(val, 'name', key);
	  }
	  if(O === global){
	    O[key] = val;
	  } else {
	    if(!safe)delete O[key];
	    hide(O, key, val);
	  }
	})(Function.prototype, TO_STRING, function toString(){
	  return typeof this == 'function' && this[SRC] || $toString.call(this);
	});

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(16)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(15).setDesc
	  , has = __webpack_require__(17)
	  , TAG = __webpack_require__(25)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var store  = __webpack_require__(22)('wks')
	  , uid    = __webpack_require__(24)
	  , Symbol = __webpack_require__(16).Symbol;
	module.exports = function(name){
	  return store[name] || (store[name] =
	    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var $         = __webpack_require__(15)
	  , toIObject = __webpack_require__(31);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = $.getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toString  = {}.toString
	  , toIObject = __webpack_require__(31)
	  , getNames  = __webpack_require__(15).getNames;

	var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return getNames(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	module.exports.get = function getOwnPropertyNames(it){
	  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
	  return getNames(toIObject(it));
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var $ = __webpack_require__(15);
	module.exports = function(it){
	  var keys       = $.getKeys(it)
	    , getSymbols = $.getSymbols;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = $.isEnum
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
	  }
	  return keys;
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(46);
	module.exports = Array.isArray || function(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(45);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(47)
	  , defined = __webpack_require__(48);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = false;

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(40)
	var helpers = __webpack_require__(4)

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
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Sync
	// ---------------
	var _ = __webpack_require__(2);
	var Promise = __webpack_require__(34);

	// Sync is the dispatcher for any database queries,
	// taking the "syncing" `model` or `collection` being queried, along with
	// a hash of options that are used in the various query methods.
	// If the `transacting` option is set, the query is assumed to be
	// part of a transaction, and this information is passed along to `Knex`.
	var Sync = function Sync(syncing, options) {
	  options = options || {};
	  this.query = syncing.query();
	  this.syncing = syncing.resetQuery();
	  this.options = options;
	  if (options.debug) this.query.debug();
	  if (options.transacting) this.query.transacting(options.transacting);
	};

	_.extend(Sync.prototype, {

	  // Prefix all keys of the passed in object with the
	  // current table name
	  prefixFields: function prefixFields(fields) {
	    var tableName = this.syncing.tableName;
	    var prefixed = {};
	    for (var key in fields) {
	      prefixed[tableName + '.' + key] = fields[key];
	    }
	    return prefixed;
	  },

	  // Select the first item from the database - only used by models.
	  first: Promise.method(function (attributes) {

	    var model = this.syncing,
	        query = this.query,
	        whereAttributes,
	        formatted;

	    // We'll never use an JSON object for a search, because even
	    // PostgreSQL, which has JSON type columns, does not support the `=`
	    // operator.
	    //
	    // NOTE: `_.omit` returns an empty object, even if attributes are null.
	    whereAttributes = _.omit(attributes, _.isPlainObject);

	    if (!_.isEmpty(whereAttributes)) {

	      // Format and prefix attributes.
	      formatted = this.prefixFields(model.format(whereAttributes));
	      query.where(formatted);
	    }

	    // Limit to a single result.
	    query.limit(1);

	    return this.select();
	  }),

	  // Add relational constraints required for either a `count` or `select` query.
	  constrain: Promise.method(function () {
	    var knex = this.query,
	        options = this.options,
	        relatedData = this.syncing.relatedData,
	        fks = {},
	        through;

	    // Set the query builder on the options, in-case we need to
	    // access in the `fetching` event handlers.
	    options.query = knex;

	    // Inject all appropriate select costraints dealing with the relation
	    // into the `knex` query builder for the current instance.
	    if (relatedData) return Promise.try(function () {
	      if (relatedData.isThrough()) {
	        fks[relatedData.key('foreignKey')] = relatedData.parentFk;
	        through = new relatedData.throughTarget(fks);

	        /**
	         * Fired before a `fetch` operation. A promise may be returned from the
	         * event handler for async behaviour.
	         *
	         * @event Model#fetching
	         * @param   {Model}    model      The model that has been fetched.
	         * @param   {string[]} columns    The columns being retrieved by the query.
	         * @param   {Object}   options    Options object passed to {@link Model#fetch fetch}.
	         * @returns {Promise}
	         */
	        return through.triggerThen('fetching', through, relatedData.pivotColumns, options).then(function () {
	          relatedData.pivotColumns = through.parse(relatedData.pivotColumns);
	        });
	      }
	    });
	  }),

	  // Runs a `count` query on the database, adding any necessary relational
	  // constraints. Returns a promise that resolves to an integer count.
	  count: Promise.method(function (column) {
	    var knex = this.query,
	        options = this.options;

	    return Promise.bind(this).then(function () {
	      return this.constrain();
	    }).then(function () {
	      return this.syncing.triggerThen('counting', this.syncing, options);
	    }).then(function () {
	      return knex.count((column || '*') + ' as count');
	    }).then(function (rows) {
	      return rows[0].count;
	    });
	  }),

	  // Runs a `select` query on the database, adding any necessary relational
	  // constraints, resetting the query when complete. If there are results and
	  // eager loaded relations, those are fetched and returned on the model before
	  // the promise is resolved. Any `success` handler passed in the
	  // options will be called - used by both models & collections.
	  select: Promise.method(function () {
	    var _this = this;

	    var knex = this.query,
	        options = this.options,
	        relatedData = this.syncing.relatedData,
	        queryContainsColumns,
	        columns;

	    // Check if any `select` style statements have been called with column
	    // specifications. This could include `distinct()` with no arguments, which
	    // does not affect inform the columns returned.
	    queryContainsColumns = _(knex._statements).where({ grouping: 'columns' }).some('value.length');

	    return Promise.resolve(this.constrain()).tap(function () {

	      // If this is a relation, apply the appropriate constraints.
	      if (relatedData) {
	        relatedData.selectConstraints(knex, options);
	      } else {

	        // Call the function, if one exists, to constrain the eager loaded query.
	        if (options._beforeFn) options._beforeFn.call(knex, knex);

	        if (options.columns) {

	          // Normalize single column name into array.
	          columns = _.isArray(options.columns) ? options.columns : [options.columns];
	        } else if (!queryContainsColumns) {

	          // If columns have already been selected via the `query` method
	          // we will use them. Otherwise, select all columns in this table.
	          columns = [_.result(_this.syncing, 'tableName') + '.*'];
	        }
	      }

	      // Set the query builder on the options, for access in the `fetching`
	      // event handlers.
	      options.query = knex;
	      return _this.syncing.triggerThen('fetching', _this.syncing, columns, options);
	    }).then(function () {
	      return knex.select(columns);
	    });
	  }),

	  // Issues an `insert` command on the query - only used by models.
	  insert: Promise.method(function () {
	    var syncing = this.syncing;
	    return this.query.insert(syncing.format(_.extend(Object.create(null), syncing.attributes)), syncing.idAttribute);
	  }),

	  // Issues an `update` command on the query - only used by models.
	  update: Promise.method(function (attrs) {
	    var syncing = this.syncing,
	        query = this.query;
	    if (syncing.id != null) query.where(syncing.idAttribute, syncing.id);
	    if (_.where(query._statements, { grouping: 'where' }).length === 0) {
	      throw new Error('A model cannot be updated without a "where" clause or an idAttribute.');
	    }
	    return query.update(syncing.format(_.extend(Object.create(null), attrs)));
	  }),

	  // Issues a `delete` command on the query.
	  del: Promise.method(function () {
	    var query = this.query,
	        syncing = this.syncing;
	    if (syncing.id != null) query.where(syncing.idAttribute, syncing.id);
	    if (_.where(query._statements, { grouping: 'where' }).length === 0) {
	      throw new Error('A model cannot be destroyed without a "where" clause or an idAttribute.');
	    }
	    return this.query.del();
	  })

	});

	module.exports = Sync;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// EagerRelation
	// ---------------
	var _ = __webpack_require__(2);
	var inherits = __webpack_require__(49);

	var Helpers = __webpack_require__(4);
	var Promise = __webpack_require__(34);
	var EagerBase = __webpack_require__(51);

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
	  eagerFetch: Promise.method(function (relationName, handled, options) {
	    var relatedData = handled.relatedData;

	    // skip eager loading for rows where the foreign key isn't set
	    if (relatedData.parentFk === null) return;

	    if (relatedData.type === 'morphTo') return this.morphToFetch(relationName, relatedData, options);

	    return handled.sync(_.extend(options, { parentResponse: this.parentResponse })).select().bind(this).tap(function (response) {
	      return this._eagerLoadHelper(response, relationName, handled, _.omit(options, 'parentResponse'));
	    });
	  }),

	  // Special handler for the eager loaded morph-to relations, this handles
	  // the fact that there are several potential models that we need to be fetching against.
	  // pairing them up onto a single response for the eager loading.
	  morphToFetch: Promise.method(function (relationName, relatedData, options) {
	    var _this = this;

	    var groups = _.groupBy(this.parent, function (m) {
	      var typeKeyName = relatedData.columnNames && relatedData.columnNames[0] ? relatedData.columnNames[0] : relatedData.morphName + '_type';
	      return m.get(typeKeyName);
	    });
	    var pending = _.reduce(groups, function (memo, val, group) {
	      var Target = Helpers.morphCandidate(relatedData.candidates, group);
	      var target = new Target();
	      var idKeyName = relatedData.columnNames && relatedData.columnNames[1] ? relatedData.columnNames[1] : relatedData.morphName + '_id';
	      memo.push(target.query('whereIn', _.result(target, 'idAttribute'), _.uniq(_.invoke(groups[group], 'get', idKeyName))).sync(options).select().bind(_this).tap(function (response) {
	        return this._eagerLoadHelper(response, relationName, {
	          relatedData: relatedData.instance('morphTo', Target, { morphName: relatedData.morphName, columnNames: relatedData.columnNames })
	        }, options);
	      }));
	      return memo;
	    }, []);
	    return Promise.all(pending).then(function (resps) {
	      return _.flatten(resps);
	    });
	  }),

	  // Handles the eager load for both the `morphTo` and regular cases.
	  _eagerLoadHelper: function _eagerLoadHelper(response, relationName, handled, options) {
	    var relatedModels = this.pushModels(relationName, handled, response);
	    var relatedData = handled.relatedData;

	    // If there is a response, fetch additional nested eager relations, if any.
	    if (response.length > 0 && options.withRelated) {
	      var relatedModel = relatedData.createModel();

	      // If this is a `morphTo` relation, we need to do additional processing
	      // to ensure we don't try to load any relations that don't look to exist.
	      if (relatedData.type === 'morphTo') {
	        var withRelated = this._filterRelated(relatedModel, options);
	        if (withRelated.length === 0) return;
	        options = _.extend({}, options, { withRelated: withRelated });
	      }
	      return new EagerRelation(relatedModels, response, relatedModel).fetch(options).return(response);
	    }
	  },

	  // Filters the `withRelated` on a `morphTo` relation, to ensure that only valid
	  // relations are attempted for loading.
	  _filterRelated: function _filterRelated(relatedModel, options) {

	    // By this point, all withRelated should be turned into a hash, so it should
	    // be fairly simple to process by splitting on the dots.
	    return _.reduce(options.withRelated, function (memo, val) {
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
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	// Base Model
	// ---------------
	var _ = __webpack_require__(2);
	var inherits = __webpack_require__(49);

	var Events = __webpack_require__(5);
	var slice = Array.prototype.slice;

	// List of attributes attached directly from the `options` passed to the constructor.
	var modelProps = ['tableName', 'hasTimestamps'];

	/**
	 * @class
	 * @classdesc
	 * @extends Events
	 * @inheritdoc
	 * @description
	 *
	 * The "ModelBase" is similar to the 'Active Model' in Rails, it defines a
	 * standard interface from which other objects may inherit.
	 */
	function ModelBase(attributes, options) {
	  var attrs = attributes || {};
	  options = options || {};
	  this.attributes = Object.create(null);
	  this._reset();
	  this.relations = {};
	  this.cid = _.uniqueId('c');
	  if (options) {
	    _.extend(this, _.pick(options, modelProps));
	    if (options.parse) attrs = this.parse(attrs, options) || {};
	  }
	  this.set(attrs, options);
	  this.initialize.apply(this, arguments);
	}
	inherits(ModelBase, Events);

	/**
	 * @method ModelBase#initialize
	 * @description
	 *
	 * Called by the {@link Model Model constructor} when creating a new instance.
	 * Override this function to add custom initialization, such as event listeners.
	 *
	 * @see Model
	 *
	 * @param {Object} attributes
	 *   Initial values for this model's attributes.
	 * @param {Object=}  options
	 *   The hash of options passed to {@link Model constructor}.
	 */
	ModelBase.prototype.initialize = function () {};

	/**
	 * @name ModelBase#tableName
	 * @member {string} 
	 * @description
	 *
	 * A required property for any database usage, The
	 * {@linkcode Model#tableName tableName} property refers to the database
	 * table name the model will query against.
	 *
	 * @example
	 *
	 * var Television = bookshelf.Model.extend({
	 *   tableName: 'televisions'
	 * });
	 */

	/**
	 * @member {string}
	 * @default "id"
	 * @description
	 *
	 * This tells the model which attribute to expect as the unique identifier
	 * for each database row (typically an auto-incrementing primary key named
	 * `"id"`). Note that if you are using {@link Model#parse parse} and {@link
	 * Model#format format} (to have your model's attributes in `camelCase`,
	 * but your database's columns in `snake_case`, for example) this refers to
	 * the name returned by parse (`myId`), not the database column (`my_id`).
	 *
	 */
	ModelBase.prototype.idAttribute = 'id';

	/**
	 * @member {boolean|Array}
	 * @default false
	 * @description
	 *
	 * Sets the current date/time on the timestamps columns `created_at` and 
	 * `updated_at` for a given method.  'insert' method will only update 
	 * `updated_at`.  To override the default column names, assign an array
	 * to {@link Model#hasTimestamps hasTimestamps}.  The first element will
	 * be the created column name and the second will be the updated
	 * column name.
	 *
	 */
	ModelBase.prototype.hasTimestamps = false;

	/**
	 * @method
	 * @description  Get the current value of an attribute from the model.
	 * @example      note.get("title")
	 *
	 * @param {string} attribute - The name of the attribute to retrieve.
	 * @returns {mixed} Attribute value.
	 */
	ModelBase.prototype.get = function (attr) {
	  return this.attributes[attr];
	};

	/**
	 * @method
	 * @description  Set a hash of attributes (one or many) on the model.
	 * @example
	 *
	 * customer.set({first_name: "Joe", last_name: "Customer"});
	 * customer.set("telephone", "555-555-1212");
	 *
	 * @param {string|Object} attribute Attribute name, or hash of attribute names and values.
	 * @param {mixed=} value If a string was provided for `attribute`, the value to be set.
	 * @param {Object=} options
	 * @param {Object} [options.unset=false] Remove attributes instead of setting them.
	 * @returns {Model} This model.
	 */
	ModelBase.prototype.set = function (key, val, options) {
	  if (key == null) return this;
	  var attrs;

	  // Handle both `"key", value` and `{key: value}` -style arguments.
	  if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
	    attrs = key;
	    options = val;
	  } else {
	    (attrs = {})[key] = val;
	  }
	  options = _.clone(options) || {};

	  // Extract attributes and options.
	  var unset = options.unset;
	  var current = this.attributes;
	  var prev = this._previousAttributes;

	  // Check for changes of `id`.
	  if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

	  // For each `set` attribute, update or delete the current value.
	  for (var attr in attrs) {
	    val = attrs[attr];
	    if (!_.isEqual(prev[attr], val)) {
	      this.changed[attr] = val;
	    } else {
	      delete this.changed[attr];
	    }
	    if (unset) {
	      delete current[attr];
	    } else {
	      current[attr] = val;
	    }
	  }
	  return this;
	};

	/**
	 * @method
	 * @description
	 *
	 * Checks for the existence of an id to determine whether the model is
	 * considered "new".
	 *
	 * @example
	 *
	 * var modelA = new bookshelf.Model();
	 * modelA.isNew(); // true
	 * 
	 * var modelB = new bookshelf.Model({id: 1});
	 * modelB.isNew(); // false
	 */
	ModelBase.prototype.isNew = function () {
	  return this.id == null;
	};

	/**
	 * @method
	 * @description
	 *
	 * Return a copy of the model's {@link Model#attributes attributes} for JSON
	 * stringification. If the {@link Model model} has any relations defined, this
	 * will also call {@link Model#toJSON toJSON} on each of the related
	 * objects, and include them on the object unless `{shallow: true}` is
	 * passed as an option.
	 *
	 * `serialize` is called internally by {@link Model#toJSON toJSON}. Override
	 * this function if you want to customize its output.
	 *
	 * @example
	 * var artist = new bookshelf.Model({
	 *   firstName: "Wassily",
	 *   lastName: "Kandinsky"
	 * });
	 *
	 * artist.set({birthday: "December 16, 1866"});
	 *
	 * console.log(JSON.stringify(artist));
	 * // {firstName: "Wassily", lastName: "Kandinsky", birthday: "December 16, 1866"}
	 *
	 * @param {Object=} options
	 * @param {bool}    [options.shallow=false]   Exclude relations.
	 * @param {bool}    [options.omitPivot=false] Exclude pivot values.
	 * @returns {Object} Serialized model as a plain object.
	 */
	ModelBase.prototype.serialize = function (options) {
	  var attrs = _.clone(this.attributes);
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
	};

	/**
	 * @method
	 * @description
	 *
	 * Called automatically by {@link
	 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior
	 * `JSON.stringify`}. To customize serialization, override {@link
	 * Model#serialize serialize}.
	 *
	 * @param {Object=} options Options passed to {@link Model#serialize}.
	 */
	ModelBase.prototype.toJSON = function (options) {
	  return this.serialize(options);
	};

	/**
	 * @method
	 * @private
	 * @returns String representation of the object.
	 */
	ModelBase.prototype.toString = function () {
	  return '[Object Model]';
	};

	/**
	 * @method
	 * @description Get the HTML-escaped value of an attribute.
	 * @param {string} attribute The attribute to escape.
	 * @returns {string} HTML-escaped value of an attribute.
	 */
	ModelBase.prototype.escape = function (key) {
	  return _.escape(this.get(key));
	};

	/**
	 * @method
	 * @description
	 * Returns `true` if the attribute contains a value that is not null or undefined.
	 * @param {string} attribute The attribute to check.
	 * @returns {bool} True if `attribute` is set, otherwise null.
	 */
	ModelBase.prototype.has = function (attr) {
	  return this.get(attr) != null;
	};

	/**
	 * @method
	 * @description
	 *
	 * The parse method is called whenever a {@link Model model}'s data is returned
	 * in a {@link Model#fetch fetch} call. The function is passed the raw database
	 * response object, and should return the {@link Model#attributes
	 * attributes} hash to be {@link Model#set set} on the model. The default
	 * implementation is a no-op, simply passing through the JSON response.
	 * Override this if you need to format the database responses - for example
	 * calling {@link
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
	 * JSON.parse} on a text field containing JSON, or explicitly typecasting a
	 * boolean in a sqlite3 database response.
	 *
	 * @example
	 *
	 * // Example of a "parse" to convert snake_case to camelCase, using `underscore.string`
	 * model.parse = function(attrs) {
	 *   return _.reduce(attrs, function(memo, val, key) {
	 *     memo[_.str.camelize(key)] = val;
	 *     return memo;
	 *   }, {});
	 * };
	 *
	 * @param {Object} response Hash of attributes to parse.
	 * @returns {Object} Parsed attributes.
	 */
	ModelBase.prototype.parse = function (resp) {
	  return resp;
	};

	/**
	 * @method
	 * @description
	 *
	 * Remove an attribute from the model. `unset` is a noop if the attribute
	 * doesn't exist.
	 *
	 * @param attribute Attribute to unset.
	 * @returns {Model} This model.
	 */
	ModelBase.prototype.unset = function (attr, options) {
	  return this.set(attr, void 0, _.extend({}, options, { unset: true }));
	};

	/**
	 * @method
	 * @description Clear all attributes on the model.
	 * @returns {Model} This model.
	 */
	ModelBase.prototype.clear = function (options) {
	  var attrs = {};
	  for (var key in this.attributes) attrs[key] = void 0;
	  return this.set(attrs, _.extend({}, options, { unset: true }));
	};

	/**
	 * @method
	 * @description
	 *
	 * The `format` method is used to modify the current state of the model before
	 * it is persisted to the database. The `attributes` passed are a shallow clone
	 * of the {@link Model model}, and are only used for inserting/updating - the
	 * current values of the model are left intact.
	 *
	 * @param {Object} attributes The attributes to be converted.
	 * @returns {Object} Formatted attributes.
	 */
	ModelBase.prototype.format = function (attrs) {
	  return attrs;
	};

	/**
	 * @method
	 * @description
	 *
	 * The `related` method returns a specified relation loaded on the relations
	 * hash on the model, or calls the associated relation method and adds it to
	 * the relations hash if one exists and has not yet been loaded.
	 *
	 * @example
	 *
	 * new Photo({id: 1}).fetch({
	 *   withRelated: ['account']
	 * }).then(function(photo) {
	 *   if (photo) {
	 *     var account = photo.related('account');
	 *     if (account.id) {
	 *        return account.related('trips').fetch();
	 *     }
	 *   }
	 * });
	 *
	 * @param name {string} The name of the relation to retrieve.
	 * @returns {Model|Collection|undefined} The specified relation as defined by a
	 *   method on the model, or undefined if it does not exist.
	 */
	ModelBase.prototype.related = function (name) {
	  return this.relations[name] || (this[name] ? this.relations[name] = this[name]() : void 0);
	};

	/**
	 * @method
	 * @description
	 * Returns a new instance of the model with identical {@link
	 * Model#attributes attributes}, including any relations from the cloned
	 * model.
	 *
	 * @returns {Model} Cloned instance of this model.
	 */
	ModelBase.prototype.clone = function () {
	  var model = new this.constructor(this.attributes);
	  var relations = this.relations;
	  for (var key in relations) {
	    model.relations[key] = relations[key].clone();
	  }
	  model._previousAttributes = _.clone(this._previousAttributes);
	  model.changed = _.clone(this.changed);
	  return model;
	};

	/**
	 * @method
	 * @private
	 * @description
	 *
	 * Returns the method that will be used on save, either 'update' or 'insert'.
	 * This is an internal helper that uses `isNew` and `options.method` to
	 * determine the correct method. If `option.method` is provided, it will be
	 * returned, but lowercased for later comparison.
	 *
	 * @returns {string} Either `'insert'` or `'update'`.
	 */
	ModelBase.prototype.saveMethod = function (options) {
	  var method = options && options.method && options.method.toLowerCase();
	  return method || (this.isNew(options) ? 'insert' : 'update');
	};

	/**
	 * @method
	 * @description
	 * Sets the timestamp attributes on the model, if {@link Model#hasTimestamps
	 * hasTimestamps} is set to `true` or an array. Check if the model {@link
	 * Model#isNew isNew} or if `{method: 'insert'}` is provided as an option and
	 * set the `created_at` and `updated_at` attributes to the current date if it
	 * is being inserted, and just the `updated_at` attribute if it's being updated.
	 * This method may be overriden to use different column names or types for the
	 * timestamps.
	 *
	 * @param {Object=} options
	 * @param {string} [options.method="update"]
	 *   Either `'insert'` or `'update'`. Specify what kind of save the attribute
	 *   update is for.
	 *
	 * @returns {Object} A hash of timestamp attributes that were set.
	 */
	ModelBase.prototype.timestamp = function (options) {
	  if (!this.hasTimestamps) return {};

	  var now = new Date();
	  var attributes = {};
	  var method = this.saveMethod(options);
	  var keys = _.isArray(this.hasTimestamps) ? this.hasTimestamps : ['created_at', 'updated_at'];
	  var createdAtKey = keys[0];
	  var updatedAtKey = keys[1];

	  if (updatedAtKey) {
	    attributes[updatedAtKey] = now;
	  }

	  if (createdAtKey && method === 'insert') {
	    attributes[createdAtKey] = now;
	  }

	  this.set(attributes, options);

	  return attributes;
	};

	/**
	 * @method
	 * @description
	 *
	 * Returns true if any {@link Model#attributes attribute} attribute has changed
	 * since the last {@link Model#fetch fetch}, {@link Model#save save}, or {@link
	 * Model#destroy destroy}. If an attribute is passed, returns true only if that
	 * specific attribute has changed.
	 *
	 * @param {string=} attribute 
	 * @returns {bool}
	 * `true` if any attribute has changed. Or, if `attribute` was specified, true
	 * if it has changed.
	 */
	ModelBase.prototype.hasChanged = function (attr) {
	  if (attr == null) return !_.isEmpty(this.changed);
	  return _.has(this.changed, attr);
	};

	/**
	 * @method
	 * @description
	 *
	 * Returns the this previous value of a changed {@link Model#attributes
	 * attribute}, or `undefined` if one had not been specified previously.
	 *
	 * @param {string} attribute The attribute to check
	 * @returns {mixed} The previous value
	 */
	ModelBase.prototype.previous = function (attribute) {
	  return this._previousAttributes[attribute];
	};

	/**
	 * @method
	 * @description
	 *
	 * Return a copy of the {@link Model model}'s previous attributes from the
	 * model's last {@link Model#fetch fetch}, {@link Model#save save}, or {@link
	 * Model#destroy destroy}. Useful for getting a diff between versions of a
	 * model, or getting back to a valid state after an error occurs.
	 *
	 * @returns {Object} The attributes as they were before the last change.
	 */
	ModelBase.prototype.previousAttributes = function () {
	  return _.clone(this._previousAttributes);
	};

	/**
	 * @method
	 * @private
	 * @description
	 *
	 * Resets the `_previousAttributes` and `changed` hash for the model.
	 * Typically called after a `sync` action (save, fetch, delete) -
	 *
	 * @returns {Model} This model.
	 */
	ModelBase.prototype._reset = function () {
	  this._previousAttributes = _.clone(this.attributes);
	  this.changed = Object.create(null);
	  return this;
	};

	/**
	 * @method ModelBase#keys
	 * @see http://lodash.com/docs/#keys
	 */
	/**
	 * @method ModelBase#values
	 * @see http://lodash.com/docs/#values
	 */
	/**
	 * @method ModelBase#pairs
	 * @see http://lodash.com/docs/#pairs
	 */
	/**
	 * @method ModelBase#invert
	 * @see http://lodash.com/docs/#invert
	 */
	/**
	 * @method ModelBase#pick
	 * @see http://lodash.com/docs/#pick
	 */
	/**
	 * @method ModelBase#omit
	 * @see http://lodash.com/docs/#omit
	 */
	// "_" methods that we want to implement on the Model.
	var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

	// Mix in each "_" method as a proxy to `Model#attributes`.
	_.each(modelMethods, function (method) {
	  ModelBase.prototype[method] = function () {
	    var args = slice.call(arguments);
	    args.unshift(this.attributes);
	    return _[method].apply(_, args);
	  };
	});

	/**
	 * @method Model.extend
	 * @description
	 *
	 * To create a Model class of your own, you extend {@link Model bookshelf.Model}.
	 *
	 * `extend` correctly sets up the prototype chain, so subclasses created with
	 * `extend` can be further extended and subclassed as far as you like.
	 *
	 *     var checkit  = require('checkit');
	 *     var Promise  = require('bluebird');
	 *     var bcrypt   = Promise.promisifyAll(require('bcrypt'));
	 *     
	 *     var Customer = bookshelf.Model.extend({
	 *     
	 *       initialize: function() {
	 *         this.on('saving', this.validateSave);
	 *       },
	 *     
	 *       validateSave: function() {
	 *         return checkit(rules).run(this.attributes);
	 *       },
	 *     
	 *       account: function() {
	 *         return this.belongsTo(Account);
	 *       },
	 *     
	 *     }, {
	 *     
	 *       login: Promise.method(function(email, password) {
	 *         if (!email || !password) throw new Error('Email and password are both required');
	 *         return new this({email: email.toLowerCase().trim()}).fetch({require: true}).tap(function(customer) {
	 *           return bcrypt.compareAsync(customer.get('password'), password)
	 *            .then(function(res) {
	 *              if (!res) throw new Error('Invalid password');
	 *            });
	 *         });
	 *       })
	 *     
	 *     });
	 *     
	 *     Customer.login(email, password)
	 *       .then(function(customer) {
	 *         res.json(customer.omit('password'));
	 *       }).catch(Customer.NotFoundError, function() {
	 *         res.json(400, {error: email + ' not found'});
	 *       }).catch(function(err) {
	 *         console.error(err);
	 *       });
	 *
	 * _Brief aside on `super`: JavaScript does not provide a simple way to call
	 * `super` — the function of the same name defined higher on the prototype
	 * chain. If you override a core function like {@link Model#set set}, or {@link
	 * Model#save save}, and you want to invoke the parent object's implementation,
	 * you'll have to explicitly call it, along these lines:_
	 *
	 *     var Customer = bookshelf.Model.extend({
	 *       set: function() {
	 *         ...
	 *         bookshelf.Model.prototype.set.apply(this, arguments);
	 *         ...
	 *       }
	 *     });
	 *
	 * @param {Object=} prototypeProperties
	 *   Instance methods and properties to be attached to instances of the new
	 *   class.
	 * @param {Object=} classProperties
	 *   Class (ie. static) functions and properties to be attached to the
	 *   constructor of the new class.
	 * @returns {Function} Constructor for new `Model` subclass.
	 */
	ModelBase.extend = __webpack_require__(52);

	module.exports = ModelBase;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _instanceof(left, right) { if (right != null && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

	// Base Collection
	// ---------------

	// All exernal dependencies required in this scope.
	var _ = __webpack_require__(2);
	var inherits = __webpack_require__(49);

	// All components that need to be referenced in this scope.
	var Events = __webpack_require__(5);
	var Promise = __webpack_require__(34);
	var ModelBase = __webpack_require__(37);

	var array = [];
	var slice = array.slice;
	var splice = array.splice;
	var noop = _.noop;

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
	  if (models) this.reset(models, _.extend({ silent: true }, options));
	}
	inherits(CollectionBase, Events);

	// List of attributes attached directly from the constructor's options object.
	//
	// RE: 'relatedData'
	// It's okay for two `Collection`s to share a `Relation` instance.
	// `relatedData` does not mutate itself after declaration. This is only
	// here because `clone` needs to duplicate this property. It should not
	// be documented as a valid argument for consumer code.
	var collectionProps = ['model', 'comparator', 'relatedData'];

	// Copied over from Backbone.
	var setOptions = { add: true, remove: true, merge: true };
	var addOptions = { add: true, remove: false };

	/**
	 * @method CollectionBase#initialize
	 * @description
	 * Custom initialization function.
	 * @see Collection
	 */
	CollectionBase.prototype.initialize = noop;

	/**
	 * @method
	 * @private
	 * @description
	 * The `tableName` on the associated Model, used in relation building.
	 * @returns {string} The {@link Model#tableName tableName} of the associated model.
	 */
	CollectionBase.prototype.tableName = function () {
	  return _.result(this.model.prototype, 'tableName');
	};

	/**
	 * @method
	 * @private
	 * @description
	 * The `idAttribute` on the associated Model, used in relation building.
	 * @returns {string} The {@link Model#idAttribute idAttribute} of the associated model.
	 */
	CollectionBase.prototype.idAttribute = function () {
	  return this.model.prototype.idAttribute;
	};

	CollectionBase.prototype.toString = function () {
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
	 * @param {bool}    [options.shallow=false]   Exclude relations.
	 * @param {bool}    [options.omitPivot=false] Exclude pivot values.
	 * @returns {Object} Serialized model as a plain object.
	 */
	CollectionBase.prototype.serialize = function (options) {
	  return this.map(function (model) {
	    return model.toJSON(options);
	  });
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
	CollectionBase.prototype.toJSON = function (options) {
	  return this.serialize(options);
	};

	/**
	 * @method
	 * @description
	 *
	 * A simplified version of Backbone's `Collection#set` method, removing the
	 * comparator, and getting rid of the temporary model creation, since there's
	 * *no way* we'll be getting the data in an inconsistent form from the database.
	 *
	 * The set method performs a "smart" update of the collection with the passed
	 * list of models. If a model in the list isn't yet in the collection it will be
	 * added; if the model is already in the collection its attributes will be
	 * merged; and if the collection contains any models that aren't present in the
	 * list, they'll be removed. If you'd like to customize the behavior, you can
	 * disable it with options: `{add: false}`, `{remove: false}`, or
	 * `{merge: false}`.
	 *
	 * @example
	 *
	 * var vanHalen = new bookshelf.Collection([eddie, alex, stone, roth]);
	 * vanHalen.set([eddie, alex, stone, hagar]);
	 * 
	 * @param {Model[]|Object[]} models Array of models or raw attribute objects.
	 * @param {Object=} options See description.
	 * @returns {Collection} Self, this method is chainable.
	 */
	CollectionBase.prototype.set = function (models, options) {
	  options = _.defaults({}, options, setOptions);
	  if (options.parse) models = this.parse(models, options);
	  if (!_.isArray(models)) models = models ? [models] : [];
	  var i, l, id, model, attrs;
	  var at = options.at;
	  var targetModel = this.model;
	  var toAdd = [],
	      toRemove = [],
	      modelMap = {};
	  var add = options.add,
	      merge = options.merge,
	      remove = options.remove;
	  var order = add && remove ? [] : false;

	  // Turn bare objects into model references, and prevent invalid models
	  // from being added.
	  for (i = 0, l = models.length; i < l; i++) {
	    attrs = models[i];
	    if (_instanceof(attrs, ModelBase)) {
	      id = model = attrs;
	    } else {
	      id = attrs[targetModel.prototype.idAttribute];
	    }

	    // If a duplicate is found, prevent it from being added and
	    // optionally merge it into the existing model.
	    var existing = this.get(id);
	    if (existing) {
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
	  if (toAdd.length || order && order.length) {
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

	/**
	 * @method
	 * @private
	 * @description
	 * Prepare a model or hash of attributes to be added to this collection.
	 */
	CollectionBase.prototype._prepareModel = function (attrs, options) {
	  if (_instanceof(attrs, ModelBase)) return attrs;
	  return new this.model(attrs, options);
	};

	/**
	 * @method
	 * @private
	 * @description
	 * Run "Promise.map" over the models
	 */
	CollectionBase.prototype.mapThen = function (iterator, context) {
	  return Promise.bind(context).thenReturn(this.models).map(iterator);
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
	CollectionBase.prototype.invokeThen = function () {
	  return Promise.all(this.invoke.apply(this, arguments));
	};

	/**
	 * @method
	 * @description
	 * Run "reduce" over the models in the collection.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce | MDN `Array.prototype.reduce` reference.}
	 * @param {Function} iterator
	 * @param {mixed} initialValue
	 * @param {Object} context Bound to `this` in the `iterator` callback.
	 * @returns {Promise<mixed[]>}
	 *   Promise resolving to array of results from invocation.
	 *
	 */
	CollectionBase.prototype.reduceThen = function (iterator, initialValue, context) {
	  return Promise.bind(context).thenReturn(this.models).reduce(iterator, initialValue).bind();
	};

	CollectionBase.prototype.fetch = function () {
	  return Promise.rejected('The fetch method has not been implemented');
	};

	/**
	 * @method
	 * @description
	 *
	 * Add a {@link Model model} (or an array of models) to the collection, You may
	 * also pass raw attributes objects, and have them be vivified as instances of
	 * the model. Pass `{at: index}` to splice the model into the collection at the
	 * specified `index`. If you're adding models to the collection that are already
	 * in the collection, they'll be ignored, unless you pass `{merge: true}`, in
	 * which case their {@link Model#attributes attributes} will be merged into the
	 * corresponding models.
	 *
	 * *Note that adding the same model (a model with the same id) to a collection
	 * more than once is a no-op.*
	 *
	 * @example
	 *
	 * var ships = new bookshelf.Collection;
	 * 
	 * ships.add([
	 *   {name: "Flying Dutchman"},
	 *   {name: "Black Pearl"}
	 * ]);
	 *
	 * @param {Object[]|Model[]} models Array of models or raw attribute objects.
	 * @param {Object=} options See description.
	 * @returns {Collection} Self, this method is chainable.
	 */
	CollectionBase.prototype.add = function (models, options) {
	  return this.set(models, _.extend({ merge: false }, options, addOptions));
	};

	/**
	 * @method
	 * @description
	 *
	 * Remove a {@link Model model} (or an array of models) from the collection,
	 * but does not remove the model from the database, use the model's {@link
	 * Model#destroy destroy} method for this.
	 *
	 * @param {Model|Model[]} models The model, or models, to be removed.
	 * @param {Object} options
	 * @returns {Model|Model[]} The same value passed as `models` argument.
	 */
	CollectionBase.prototype.remove = function (models, options) {
	  var singular = !_.isArray(models);
	  models = singular ? [models] : _.clone(models);
	  options = options || {};
	  var i = -1;
	  while (++i < models.length) {
	    var model = models[i] = this.get(models[i]);
	    if (!model) continue;
	    delete this._byId[model.id];
	    delete this._byId[model.cid];
	    var index = this.indexOf(model);
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
	 * @param {Object[]|Model[]} Array of models or raw attribute objects.
	 * @param {Object} options See {@link Collection#add add}.
	 * @returns {Model[]} Array of models.
	 */
	CollectionBase.prototype.reset = function (models, options) {
	  options = options || {};
	  options.previousModels = this.models;
	  this._reset();
	  models = this.add(models, _.extend({ silent: true }, options));
	  if (!options.silent) this.trigger('reset', this, options);
	  return models;
	};

	/**
	 * @method
	 * @description
	 * Add a model to the end of the collection.
	 * @returns {Collection} Self, this method is chainable.
	 */
	CollectionBase.prototype.push = function (model, options) {
	  return this.add(model, _.extend({ at: this.length }, options));
	};

	/**
	 * @method
	 * @description
	 * Remove a model from the end of the collection.
	 */
	CollectionBase.prototype.pop = function (options) {
	  var model = this.at(this.length - 1);
	  this.remove(model, options);
	  return model;
	};

	/**
	 * @method
	 * @description
	 * Add a model to the beginning of the collection.
	 */
	CollectionBase.prototype.unshift = function (model, options) {
	  return this.add(model, _.extend({ at: 0 }, options));
	};

	/**
	 * @method
	 * @description
	 * Remove a model from the beginning of the collection.
	 */
	CollectionBase.prototype.shift = function (options) {
	  var model = this.at(0);
	  this.remove(model, options);
	  return model;
	};

	/**
	 * @method
	 * @description
	 * Slice out a sub-array of models from the collection.
	 */
	CollectionBase.prototype.slice = function () {
	  return slice.apply(this.models, arguments);
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
	 * var book = library.get(110);
	 *
	 * @returns {Model} The model, or `undefined` if it is not in the collection.
	 */
	CollectionBase.prototype.get = function (obj) {
	  if (obj == null) return void 0;
	  return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
	};

	/**
	 * @method
	 * @description
	 * Get a model from a collection, specified by index. Useful if your collection
	 * is sorted, and if your collection isn't sorted, `at` will still retrieve
	 * models in insertion order.
	 */
	CollectionBase.prototype.at = function (index) {
	  return this.models[index];
	};

	/**
	 * @method
	 * @description
	 * Return models with matching attributes. Useful for simple cases of `filter`.
	 * @returns {Model[]} Array of matching models.
	 */
	CollectionBase.prototype.where = function (attrs, first) {
	  if (_.isEmpty(attrs)) return first ? void 0 : [];
	  return this[first ? 'find' : 'filter'](function (model) {
	    for (var key in attrs) {
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
	CollectionBase.prototype.findWhere = function (attrs) {
	  return this.where(attrs, true);
	};

	/**
	 * @method
	 * @private
	 * @description
	 * Force the collection to re-sort itself, based on a comporator defined on the model.
	 */
	CollectionBase.prototype.sort = function (options) {
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
	CollectionBase.prototype.pluck = function (attr) {
	  return this.invoke('get', attr);
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
	CollectionBase.prototype.parse = function (resp) {
	  return resp;
	};

	/**
	 * @method
	 * @description
	 * Create a new collection with an identical list of models as this one.
	 */
	CollectionBase.prototype.clone = function () {
	  return new this.constructor(this.models, _.pick(this, collectionProps));
	};

	/**
	 * @method
	 * @private
	 * @description
	 * Reset all internal state. Called when the collection is first initialized or reset.
	 */
	CollectionBase.prototype._reset = function () {
	  this.length = 0;
	  this.models = [];
	  this._byId = Object.create(null);
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
	 * @method CollectionBase#collect
	 * @see http://lodash.com/docs/#collect
	 */
	/**
	 * @method CollectionBase#reduce
	 * @see http://lodash.com/docs/#reduce
	 */
	/**
	 * @method CollectionBase#foldl
	 * @see http://lodash.com/docs/#foldl
	 */
	/**
	 * @method CollectionBase#inject
	 * @see http://lodash.com/docs/#inject
	 */
	/**
	 * @method CollectionBase#reduceRight
	 * @see http://lodash.com/docs/#reduceRight
	 */
	/**
	 * @method CollectionBase#foldr
	 * @see http://lodash.com/docs/#foldr
	 */
	/**
	 * @method CollectionBase#find
	 * @see http://lodash.com/docs/#find
	 */
	/**
	 * @method CollectionBase#detect
	 * @see http://lodash.com/docs/#detect
	 */
	/**
	 * @method CollectionBase#filter
	 * @see http://lodash.com/docs/#filter
	 */
	/**
	 * @method CollectionBase#select
	 * @see http://lodash.com/docs/#select
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
	 * @method CollectionBase#all
	 * @see http://lodash.com/docs/#all
	 */
	/**
	 * @method CollectionBase#some
	 * @see http://lodash.com/docs/#some
	 */
	/**
	 * @method CollectionBase#any
	 * @see http://lodash.com/docs/#any
	 */
	/**
	 * @method CollectionBase#include
	 * @see http://lodash.com/docs/#include
	 */
	/**
	 * @method CollectionBase#contains
	 * @see http://lodash.com/docs/#contains
	 */
	/**
	 * @method CollectionBase#invoke
	 * @see http://lodash.com/docs/#invoke
	 */
	/**
	 * @method CollectionBase#max
	 * @see http://lodash.com/docs/#max
	 */
	/**
	 * @method CollectionBase#min
	 * @see http://lodash.com/docs/#min
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
	 * @method CollectionBase#rest
	 * @see http://lodash.com/docs/#rest
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
	var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl', 'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke', 'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest', 'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty', 'chain'];

	// Mix in each Lodash method as a proxy to `Collection#models`.
	_.each(methods, function (method) {
	  CollectionBase.prototype[method] = function () {
	    var args = slice.call(arguments);
	    args.unshift(this.models);
	    return _[method].apply(_, args);
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
	var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

	// Use attributes instead of properties.
	_.each(attributeMethods, function (method) {
	  CollectionBase.prototype[method] = function (value, context) {
	    var iterator = _.isFunction(value) ? value : function (model) {
	      return model.get(value);
	    };
	    return _[method](this.models, iterator, context);
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
	CollectionBase.extend = __webpack_require__(52);

	module.exports = CollectionBase;

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _instanceof(left, right) { if (right != null && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

	// Base Relation
	// ---------------

	var _ = __webpack_require__(2);
	var CollectionBase = __webpack_require__(38);

	// Used internally, the `Relation` helps in simplifying the relationship building,
	// centralizing all logic dealing with type & option handling.
	function RelationBase(type, Target, options) {
	  this.type = type;
	  this.target = Target;
	  if (this.target) {
	    this.targetTableName = _.result(Target.prototype, 'tableName');
	    this.targetIdAttribute = _.result(Target.prototype, 'idAttribute');
	  }
	  _.extend(this, options);
	}

	_.extend(RelationBase.prototype, {

	  // Creates a new relation instance, used by the `Eager` relation in
	  // dealing with `morphTo` cases, where the same relation is targeting multiple models.
	  instance: function instance(type, Target, options) {
	    return new this.constructor(type, Target, options);
	  },

	  // Creates a new, unparsed model, used internally in the eager fetch helper
	  // methods. (Parsing may mutate information necessary for eager pairing.)
	  createModel: function createModel(data) {
	    if (_instanceof(this.target.prototype, CollectionBase)) {
	      return new this.target.prototype.model(data)._reset();
	    }
	    return new this.target(data)._reset();
	  },

	  // Eager pair the models.
	  eagerPair: function eagerPair() {}

	});

	RelationBase.extend = __webpack_require__(52);

	module.exports = RelationBase;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_40__;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	var escapeStringRegexp = __webpack_require__(53);
	var ansiStyles = __webpack_require__(54);
	var stripAnsi = __webpack_require__(55);
	var hasAnsi = __webpack_require__(56);
	var supportsColor = __webpack_require__(57);
	var defineProps = Object.defineProperties;
	var isSimpleWindowsTerm = process.platform === 'win32' && !/^xterm/i.test(process.env.TERM);

	function Chalk(options) {
		// detect mode if not set manually
		this.enabled = !options || options.enabled === undefined ? supportsColor : options.enabled;
	}

	// use bright blue on Windows as the normal blue color is illegible
	if (isSimpleWindowsTerm) {
		ansiStyles.blue.open = '\u001b[94m';
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

	function build(_styles) {
		var builder = function () {
			return applyStyle.apply(builder, arguments);
		};

		builder._styles = _styles;
		builder.enabled = this.enabled;
		// __proto__ is used because we must return a function, but there is
		// no way to create a function with a different prototype.
		/* eslint-disable no-proto */
		builder.__proto__ = proto;

		return builder;
	}

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

		var nestedStyles = this._styles;
		var i = nestedStyles.length;

		// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
		// see https://github.com/chalk/chalk/issues/58
		// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
		var originalDim = ansiStyles.dim.open;
		if (isSimpleWindowsTerm && (nestedStyles.indexOf('gray') !== -1 || nestedStyles.indexOf('grey') !== -1)) {
			ansiStyles.dim.open = '';
		}

		while (i--) {
			var code = ansiStyles[nestedStyles[i]];

			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			str = code.open + str.replace(code.closeRe, code.open) + code.close;
		}

		// Reset the original 'dim' if we changed it to work around the Windows dimmed gray issue.
		ansiStyles.dim.open = originalDim;

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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(58)))

/***/ },
/* 42 */
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
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
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
	  } else if (listeners) {
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

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
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
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var core = module.exports = {version: '1.2.5'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(15)
	  , createDesc = __webpack_require__(32);
	module.exports = __webpack_require__(18) ? function(object, key, value){
	  return $.setDesc(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(46);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 49 */
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
/* 50 */
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
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Eager Base
	// ---------------

	// The EagerBase provides a scaffold for handling with eager relation
	// pairing, by queueing the appropriate related method calls with
	// a database specific `eagerFetch` method, which then may utilize
	// `pushModels` for pairing the models depending on the database need.

	var _ = __webpack_require__(2);
	var Promise = __webpack_require__(34);

	function EagerBase(parent, parentResponse, target) {
	  this.parent = parent;
	  this.parentResponse = parentResponse;
	  this.target = target;
	}

	_.extend(EagerBase.prototype, {

	  // This helper function is used internally to determine which relations
	  // are necessary for fetching based on the `model.load` or `withRelated` option.
	  fetch: Promise.method(function (options) {
	    var relationName, related;
	    var target = this.target;
	    var handled = this.handled = {};
	    var withRelated = this.prepWithRelated(options.withRelated);
	    var subRelated = {};

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
	        subRelated[relationName] = subRelated[relationName] || [];
	        relatedObj[related.slice(1).join('.')] = withRelated[key];
	        subRelated[relationName].push(relatedObj);
	      }

	      // Only allow one of a certain nested type per-level.
	      if (handled[relationName]) continue;

	      if (!_.isFunction(target[relationName])) {
	        throw new Error(relationName + ' is not defined on the model.');
	      }

	      var relation = target[relationName]();

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
	  prepWithRelated: function prepWithRelated(withRelated) {
	    if (!_.isArray(withRelated)) withRelated = [withRelated];
	    var obj = {};
	    for (var i = 0, l = withRelated.length; i < l; i++) {
	      var related = withRelated[i];
	      if (_.isString(related)) {
	        obj[related] = noop;
	      } else {
	        _.extend(obj, related);
	      }
	    }
	    return obj;
	  },

	  // Pushes each of the incoming models onto a new `related` array,
	  // which is used to correcly pair additional nested relations.
	  pushModels: function pushModels(relationName, handled, resp) {
	    var models = this.parent;
	    var relatedData = handled.relatedData;
	    var related = [];
	    for (var i = 0, l = resp.length; i < l; i++) {
	      related.push(relatedData.createModel(resp[i]));
	    }
	    return relatedData.eagerPair(relationName, related, models);
	  }

	});

	var noop = function noop() {};

	module.exports = EagerBase;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	// Uses a hash of prototype properties and class properties to be extended.
	module.exports = function (protoProps, staticProps) {
	  var parent = this;
	  var child;

	  // The constructor function for the new subclass is either defined by you
	  // (the "constructor" property in your `extend` definition), or defaulted
	  // by us to simply call the parent's constructor.
	  if (protoProps && protoProps.hasOwnProperty('constructor')) {
	    child = protoProps.constructor;
	  } else {
	    child = function () {
	      parent.apply(this, arguments);
	    };
	  }

	  // Set the prototype chain to inherit from `Parent`
	  child.prototype = Object.create(parent.prototype);

	  if (protoProps) {
	    var i = -1,
	        keys = Object.keys(protoProps);
	    while (++i < keys.length) {
	      var key = keys[i];
	      child.prototype[key] = protoProps[key];
	    }
	  }

	  if (staticProps) {
	    var i = -1,
	        keys = Object.keys(staticProps);
	    while (++i < keys.length) {
	      var key = keys[i];
	      child[key] = staticProps[key];
	    }
	  }

	  // Correctly set child's `prototype.constructor`.
	  child.prototype.constructor = child;

	  // Add static properties to the constructor function, if supplied.
	  child.__proto__ = parent;

	  // If there is an "extended" function set on the parent,
	  // call it with the extended child object.
	  if (typeof parent.extended === "function") parent.extended(child);

	  return child;
	};

/***/ },
/* 53 */
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
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	function assembleStyles () {
		var styles = {
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

		return styles;
	}

	Object.defineProperty(module, 'exports', {
		enumerable: true,
		get: assembleStyles
	});

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(60)(module)))

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ansiRegex = __webpack_require__(59)();

	module.exports = function (str) {
		return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ansiRegex = __webpack_require__(59);
	var re = new RegExp(ansiRegex().source); // remove the `g` flag
	module.exports = re.test.bind(re);


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	var argv = process.argv;

	var terminator = argv.indexOf('--');
	var hasFlag = function (flag) {
		flag = '--' + flag;
		var pos = argv.indexOf(flag);
		return pos !== -1 && (terminator !== -1 ? pos < terminator : true);
	};

	module.exports = (function () {
		if ('FORCE_COLOR' in process.env) {
			return true;
		}

		if (hasFlag('no-color') ||
			hasFlag('no-colors') ||
			hasFlag('color=false')) {
			return false;
		}

		if (hasFlag('color') ||
			hasFlag('colors') ||
			hasFlag('color=true') ||
			hasFlag('color=always')) {
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(58)))

/***/ },
/* 58 */
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
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	module.exports = function () {
		return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
	};


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ])
});
;