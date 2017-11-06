import { extend, result, isString, isArray, isFunction, each } from 'lodash';
import helpers from './helpers';

// We've supplemented `Events` with a `triggerThen` method to allow for
// asynchronous event handling via promises. We also mix this into the
// prototypes of the main objects in the library.
import Events from './base/events';

// All core modules required for the bookshelf instance.
import BookshelfModel from './model';
import BookshelfCollection from './collection';
import BookshelfRelation from './relation';
import Errors from './errors';

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
function Bookshelf(knex) {
  const bookshelf = {
    VERSION: require('../package.json').version
  };

  const Model = bookshelf.Model = BookshelfModel.extend({

    _builder: builderFn,

    // The `Model` constructor is referenced as a property on the `Bookshelf`
    // instance, mixing in the correct `builder` method, as well as the
    // `relation` method, passing in the correct `Model` & `Collection`
    // constructors for later reference.
    _relation(type, Target, options) {
      if (type !== 'morphTo' && !isFunction(Target)) {
        throw new Error('A valid target model must be defined for the ' +
          result(this, 'tableName') + ' ' + type + ' relation');
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
    forge,

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
     * });
     *
     * @param {(Model[])=} models
     * @param {Object=} options
     * @returns {Collection}
     */
    collection(models, options) {
      return new bookshelf.Collection((models || []), extend({}, options, {model: this}));
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
    count(column, options) {
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
    fetchAll(options) {
      return this.forge().fetchAll(options);
    }
  })

  const Collection = bookshelf.Collection = BookshelfCollection.extend({

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
     * ]);
     *
     * Promise.all(accounts.invokeMap('save')).then(function() {
     *   // collection models should now be saved...
     * });
     */
     forge


  });

  // The collection also references the correct `Model`, specified above, for
  // creating new `Model` instances in the collection.
  Collection.prototype.model = Model;
  Model.prototype.Collection = Collection;

  const Relation = BookshelfRelation.extend({
    Model, Collection
  });

  // A `Bookshelf` instance may be used as a top-level pub-sub bus, as it mixes
  // in the `Events` object. It also contains the version number, and a
  // `Transaction` method referencing the correct version of `knex` passed into
  // the object.
  extend(bookshelf, Events, Errors, {

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
    transaction() {
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
    plugin(plugin, options) {
      if (isString(plugin)) {
        try {
          require('./plugins/' + plugin)(this, options);
        } catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
          }
          if (!process.browser) {
            require(plugin)(this, options)
          }
        }
      } else if (isArray(plugin)) {
        each(plugin, (p) => {
          this.plugin(p, options);
        });
      } else {
        plugin(this, options);
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
    return new this(...arguments);
  }

  function builderFn(tableNameOrBuilder) {
    let builder = null;

    if (isString(tableNameOrBuilder)) {
      builder = bookshelf.knex(tableNameOrBuilder);
    } else if (tableNameOrBuilder == null) {
      builder = bookshelf.knex.queryBuilder();
    } else {
      // Assuming here that `tableNameOrBuilder` is a QueryBuilder instance. Not
      // aware of a way to check that this is the case (ie. using
      // `Knex.isQueryBuilder` or equivalent).
      builder = tableNameOrBuilder;
    }

    return builder.on('query', data =>
      this.trigger('query', data)
    );
  }

  // Attach `where`, `query`, and `fetchAll` as static methods.
  ['where', 'query'].forEach((method) => {
    Model[method] = Collection[method] = function() {
      const model = this.forge();
      return model[method].apply(model, arguments);
    };
  });

  return bookshelf;
}

// Constructor for a new `Bookshelf` object, it accepts an active `knex`
// instance and initializes the appropriate `Model` and `Collection`
// constructors for use in the current instance.
Bookshelf.initialize = function(knex) {
  helpers.warn("Bookshelf.initialize is deprecated, pass knex directly: require('bookshelf')(knex)")
  return new Bookshelf(knex)
};

// Finally, export `Bookshelf` to the world.
export default Bookshelf;
