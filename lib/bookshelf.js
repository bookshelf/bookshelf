'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _events = require('./base/events');

var _events2 = _interopRequireDefault(_events);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _collection = require('./collection');

var _collection2 = _interopRequireDefault(_collection);

var _relation2 = require('./relation');

var _relation3 = _interopRequireDefault(_relation2);

var _errors = require('./errors');

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
    VERSION: '0.9.4'
  };

  var Model = bookshelf.Model = _model2.default.extend({

    _builder: builderFn,

    // The `Model` constructor is referenced as a property on the `Bookshelf`
    // instance, mixing in the correct `builder` method, as well as the
    // `relation` method, passing in the correct `Model` & `Collection`
    // constructors for later reference.
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

  // The collection also references the correct `Model`, specified above, for
  // creating new `Model` instances in the collection.
  Collection.prototype.model = Model;
  Model.prototype.Collection = Collection;

  var Relation = _relation3.default.extend({
    Model: Model, Collection: Collection
  });

  // A `Bookshelf` instance may be used as a top-level pub-sub bus, as it mixes
  // in the `Events` object. It also contains the version number, and a
  // `Transaction` method referencing the correct version of `knex` passed into
  // the object.
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

    // Provides a nice, tested, standardized way of adding plugins to a
    // `Bookshelf` instance, injecting the current instance into the plugin,
    // which should be a module.exports.
    plugin: function plugin(_plugin, options) {
      var _this = this;

      if (_lodash2.default.isString(_plugin)) {
        try {
          require('./plugins/' + _plugin)(this, options);
        } catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
          }
          if (!process.browser) {
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
    return new (Function.prototype.bind.apply(this, [null].concat(Array.prototype.slice.call(arguments))))();
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

// Constructor for a new `Bookshelf` object, it accepts an active `knex`
// instance and initializes the appropriate `Model` and `Collection`
// constructors for use in the current instance.

// We've supplemented `Events` with a `triggerThen` method to allow for
// asynchronous event handling via promises. We also mix this into the
// prototypes of the main objects in the library.
Bookshelf.initialize = function (knex) {
  _helpers2.default.warn("Bookshelf.initialize is deprecated, pass knex directly: require('bookshelf')(knex)");
  return new Bookshelf(knex);
};

// Finally, export `Bookshelf` to the world.
exports.default = Bookshelf;