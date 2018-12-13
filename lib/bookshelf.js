'use strict';

const _ = require('lodash');
const helpers = require('./helpers');

// We've supplemented `Events` with a `triggerThen` method to allow for
// asynchronous event handling via promises. We also mix this into the
// prototypes of the main objects in the library.
const Events = require('./base/events');

// All core modules required for the bookshelf instance.
const BookshelfModel = require('./model');
const BookshelfCollection = require('./collection');
const BookshelfRelation = require('./relation');
const Errors = require('./errors');

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
  if (!knex || knex.name !== 'knex') {
    throw new Error('Invalid knex instance');
  }
  const bookshelf = {
    VERSION: require('../package.json').version
  };

  const Model = (bookshelf.Model = BookshelfModel.extend(
    {
      _builder: builderFn,

      // The `Model` constructor is referenced as a property on the `Bookshelf`
      // instance, mixing in the correct `builder` method, as well as the
      // `relation` method, passing in the correct `Model` & `Collection`
      // constructors for later reference.
      _relation(type, Target, options) {
        if (type !== 'morphTo' && !_.isFunction(Target)) {
          throw new Error(
            'A valid target model must be defined for the ' + _.result(this, 'tableName') + ' ' + type + ' relation'
          );
        }
        return new Relation(type, Target, options);
      }
    },
    {
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
       * @param {Boolean=} [options.hasTimestamps=false]
       *
       *   Initial value for {@linkcode Model#hasTimestamps hasTimestamps}.
       *
       * @param {Boolean} [options.parse=false]
       *
       *   Convert attributes by {@linkcode Model#parse parse} before being
       *   {@linkcode Model#set set} on the `model`.
       */
      forge: function forge(attributes, options) {
        return new this(attributes, options);
      },

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
        return new bookshelf.Collection(models || [], _.extend({}, options, {model: this}));
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
    }
  ));

  const Collection = (bookshelf.Collection = BookshelfCollection.extend(
    {
      _builder: builderFn
    },
    {
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
      forge: function forge(models, options) {
        return new this(models, options);
      }
    }
  ));

  // The collection also references the correct `Model`, specified above, for
  // creating new `Model` instances in the collection.
  Collection.prototype.model = Model;
  Model.prototype.Collection = Collection;

  const Relation = BookshelfRelation.extend({Model, Collection});

  // A `Bookshelf` instance may be used as a top-level pub-sub bus, as it mixes
  // in the `Events` object. It also contains the version number, and a
  // `Transaction` method referencing the correct version of `knex` passed into
  // the object.
  _.extend(bookshelf, Events, Errors, {
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
     * When fetching inside a transaction it's possible to specify a row-level
     * lock by passing the wanted lock type in the `lock` option to
     * {@linkcode Model#fetch fetch}. Available options are `forUpdate` and
     * `forShare`.
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
      return this.knex.transaction.apply(this.knex, arguments);
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

    /**
     * @method Bookshelf#plugin
     * @memberOf Bookshelf
     * @description
     *
     * This method provides a nice, tested, standardized way of adding plugins
     * to a `Bookshelf` instance, injecting the current instance into the
     * plugin, which should be a `module.exports`.
     *
     * You can add a plugin by specifying a string with the name of the plugin
     * to load. In this case it will try to find a module. It will first check
     * for a match within the `bookshelf/plugins` directory. If nothing is
     * found it will pass the string to `require()`, so you can either require
     * an npm dependency by name or one of your own modules by relative path:
     *
     *     bookshelf.plugin('./bookshelf-plugins/my-favourite-plugin');
     *     bookshelf.plugin('plugin-from-npm');
     *
     * There are a few built-in plugins already, along with many independently
     * developed ones. See [the list of available plugins](#plugins).
     *
     * You can also provide an array of strings or functions, which is the same
     * as calling `bookshelf.plugin()` multiple times. In this case the same
     * options object will be reused:
     *
     *       bookshelf.plugin(['registry', './my-plugins/special-parse-format']);
     *
     * Example plugin:
     *
     *     // Converts all string values to lower case when setting attributes on a model
     *     module.exports = function(bookshelf) {
     *       bookshelf.Model = bookshelf.Model.extend({
     *         set: function(key, value, options) {
     *           if (!key) return this;
     *           if (typeof value === 'string') value = value.toLowerCase();
     *           return bookshelf.Model.prototype.set.call(this, key, value, options);
     *         }
     *       });
     *     }
     *
     * @param {string|array|Function} plugin
     *    The plugin or plugins to add. If you provide a string it can
     *    represent a built-in plugin, an npm package or a file somewhere on
     *    your project. You can also pass a function as argument to add it as a
     *    plugin. Finally, it's also possible to pass an array of strings or
     *    functions to add them all at once.
     * @param {mixed} options
     *    This can be anything you want and it will be passed directly to the
     *    plugin as the second argument when loading it.
     */
    plugin(plugin, options) {
      if (_.isString(plugin)) {
        try {
          require('./plugins/' + plugin)(this, options);
        } catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
          }
          if (!process.browser) {
            require(plugin)(this, options);
          }
        }
      } else if (Array.isArray(plugin)) {
        plugin.forEach((p) => this.plugin(p, options));
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

  function builderFn(tableNameOrBuilder) {
    let builder = null;

    if (_.isString(tableNameOrBuilder)) {
      builder = bookshelf.knex(tableNameOrBuilder);
    } else if (tableNameOrBuilder == null) {
      builder = bookshelf.knex.queryBuilder();
    } else {
      // Assuming here that `tableNameOrBuilder` is a QueryBuilder instance. Not
      // aware of a way to check that this is the case (ie. using
      // `Knex.isQueryBuilder` or equivalent).
      builder = tableNameOrBuilder;
    }

    return builder.on('query', (data) => this.trigger('query', data));
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
  helpers.warn("Bookshelf.initialize is deprecated, pass knex directly: require('bookshelf')(knex)");
  return new Bookshelf(knex);
};

module.exports = Bookshelf;
