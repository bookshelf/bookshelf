'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _sync = require('./sync');

var _sync2 = _interopRequireDefault(_sync);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _eager = require('./eager');

var _eager2 = _interopRequireDefault(_eager);

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

var _baseCollection = require('./base/collection');

var _baseCollection2 = _interopRequireDefault(_baseCollection);

var _basePromise = require('./base/promise');

var _basePromise2 = _interopRequireDefault(_basePromise);

var _createError = require('create-error');

var _createError2 = _interopRequireDefault(_createError);

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
var BookshelfCollection = _baseCollection2['default'].extend({

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
   * @param {bool} [options.required=false] Trigger a {@link Collection.EmptyError} if no records are found.
   * @param {string|string[]} [options.withRelated=[]] A relation, or list of relations, to be eager loaded as part of the `fetch` operation.
   * @returns {Promise<Collection>}
   */
  fetch: _basePromise2['default'].method(function (options) {
    options = options ? _lodash2['default'].clone(options) : {};
    return this.sync(options).select().bind(this).tap(function (response) {
      if (!response || response.length === 0) {
        if (options.require) throw new this.constructor.EmptyError('EmptyResponse');
        return _basePromise2['default'].reject(null);
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
        return this._handleEager(response, _lodash2['default'].omit(options, 'columns'));
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
    })['catch'](function (err) {
      if (err !== null) throw err;
      this.reset([], { silent: true });
    })['return'](this);
  }),

  // Counts all models in collection, respecting relational constrains and query
  // modifications.
  count: _basePromise2['default'].method(function (column, options) {
    if (!_lodash2['default'].isString(column)) {
      options = column;
      column = undefined;
    }
    if (options) options = _lodash2['default'].clone(options);
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
   * @returns {Promise<Model|undefined>}
   *  A promise resolving to the fetched {@link Model model} or `undefined` if none exists.
   */
  fetchOne: _basePromise2['default'].method(function (options) {
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
  load: _basePromise2['default'].method(function (relations, options) {
    if (!_lodash2['default'].isArray(relations)) relations = [relations];
    options = _lodash2['default'].extend({}, options, { shallow: true, withRelated: relations });
    return new _eager2['default'](this.models, this.toJSON(options), new this.model()).fetch(options)['return'](this);
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
  create: _basePromise2['default'].method(function (model, options) {
    options = options ? _lodash2['default'].clone(options) : {};
    var relatedData = this.relatedData;
    model = this._prepareModel(model, options);

    // If we've already added things on the query chain,
    // these are likely intended for the model.
    if (this._knex) {
      model._knex = this._knex;
      this.resetQuery();
    }
    return _helpers2['default'].saveConstraints(model, relatedData).save(null, options).bind(this).then(function () {
      if (relatedData && relatedData.type === 'belongsToMany') {
        return this.attach(model, _lodash2['default'].omit(options, 'query'));
      }
    }).then(function () {
      this.add(model, options);
    })['return'](model);
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
    return _helpers2['default'].query(this, _lodash2['default'].toArray(arguments));
  },

  /**
   * @method Collection#query
   * @private
   * @description Creates and returns a new `Bookshelf.Sync` instance.
   */
  sync: function sync(options) {
    return new _sync2['default'](this, options);
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
    return new _eager2['default'](this.models, response, new this.model()).fetch(options);
  }

}, {

  extended: function extended(child) {
    /**
     * @class Collection.NotFoundError
     * @description
     *   Thrown when no records are found by {@link Collection#fetch fetch},
     *   when called with the `{require: true}` option.
     */
    child.EmptyError = (0, _createError2['default'])(this.EmptyError);
  }

});

BookshelfCollection.EmptyError = _errors2['default'].EmptyError;

exports['default'] = BookshelfCollection;
module.exports = exports['default'];