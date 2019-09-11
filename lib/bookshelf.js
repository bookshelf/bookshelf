'use strict';

const _ = require('lodash');

// We've supplemented `Events` with a `triggerThen` method to allow for
// asynchronous event handling via promises. We also mix this into the
// prototypes of the main objects in the library.
const Events = require('./base/events');

// All core modules required for the bookshelf instance.
const BookshelfModel = require('./model');
const BookshelfCollection = require('./collection');
const BookshelfRelation = require('./relation');
const errors = require('./errors');

function preventOverwrite(store, name) {
  if (store[name]) throw new Error(`${name} is already defined in the registry`);
}

/**
 * @class
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

  function resolveModel(input) {
    if (typeof input !== 'string') return input;

    return (
      bookshelf.collection(input) ||
      bookshelf.model(input) ||
      (function() {
        throw new errors.ModelNotResolvedError(`The model ${input} could not be resolved from the registry.`);
      })()
    );
  }

  /** @lends Bookshelf.prototype */
  const bookshelf = {
    registry: {
      collections: {},
      models: {}
    },
    VERSION: require('../package.json').version,

    collection(name, Collection, staticProperties) {
      if (Collection) {
        preventOverwrite(this.registry.collections, name);

        if (_.isPlainObject(Collection)) {
          Collection = this.Collection.extend(Collection, staticProperties);
        }

        this.registry.collections[name] = Collection;
      }

      return this.registry.collections[name] || bookshelf.resolve(name);
    },

    /**
     * Registers a model. Omit the second argument `Model` to return a previously registered model that matches the
     * provided name.
     *
     * Note that when registering a model with this method it will also be available to all relation methods, allowing
     * you to use a string name in that case. See the calls to `hasMany()` in the examples above.
     *
     * @example
     * // Defining and registering a model
     * module.exports = bookshelf.model('Customer', {
     *   tableName: 'customers',
     *   orders() {
     *     return this.hasMany('Order')
     *   }
     * })
     *
     * // Retrieving a previously registered model
     * const Customer = bookshelf.model('Customer')
     *
     * // Registering already defined models
     * // file: customer.js
     * const Customer = bookshelf.Model.extend({
     *   tableName: 'customers',
     *   orders() {
     *     return this.hasMany('Order')
     *   }
     * })
     * module.exports = bookshelf.model('Customer', Customer)
     *
     * // file: order.js
     * const Order = bookshelf.Model.extend({
     *   tableName: 'orders',
     *   customer() {
     *     return this.belongsTo('Customer')
     *   }
     * })
     * module.exports = bookshelf.model('Order', Order)
     *
     * @param {string} name
     *   The name to save the model as, or the name of the model to retrieve if no further arguments are passed to this
     *   method.
     * @param {Model|Object} [Model]
     *   The model to register. If a plain object is passed it will be converted to a {@link Model}. See example above.
     * @param {Object} [staticProperties]
     *   If a plain object is passed as second argument, this can be used to specify additional static properties and
     *   methods for the new model that is created.
     * @return {Model} The registered model.
     */
    model(name, Model, staticProperties) {
      if (Model) {
        preventOverwrite(this.registry.models, name);
        if (_.isPlainObject(Model)) Model = this.Model.extend(Model, staticProperties);
        this.registry.models[name] = Model;
      }

      return this.registry.models[name] || bookshelf.resolve(name);
    },

    /**
     * Override this in your bookshelf instance to define a custom function that will resolve the location of a model or
     * collection when using the {@link Bookshelf#model} method or when passing a string with a model name in any of the
     * collection methods (e.g. {@link Model#hasOne}, {@link Model#hasMany}, etc.).
     *
     * This will only be used if the specified name cannot be found in the registry. Note that this function
     * can return anything you'd like, so it's not restricted in functionality.
     *
     * @example
     * const Customer = bookshelf.model('Customer', {
     *   tableName: 'customers'
     * })
     *
     * bookshelf.resolve = (name) => {
     *   if (name === 'SpecialCustomer') return Customer;
     * }
     *
     * @param {string} name The model name to resolve.
     * @return {*} The return value will depend on what your re-implementation of this function does.
     */
    resolve(name) {}
  };

  const Model = (bookshelf.Model = BookshelfModel.extend(
    {
      _builder: builderFn,

      // The `Model` constructor is referenced as a property on the `Bookshelf` instance, mixing in the correct
      // `builder` method, as well as the `relation` method, passing in the correct `Model` & `Collection`
      // constructors for later reference.
      _relation(type, Target, options) {
        Target = resolveModel(Target);

        if (type !== 'morphTo' && !_.isFunction(Target)) {
          throw new Error(
            'A valid target model must be defined for the ' + _.result(this, 'tableName') + ' ' + type + ' relation'
          );
        }
        return new Relation(type, Target, options);
      },

      morphTo(relationName, ...args) {
        let candidates = args;
        let columnNames = null;

        if (Array.isArray(args[0]) || args[0] === null || args[0] === undefined) {
          candidates = args.slice(1);
          columnNames = args[0];
        }

        if (Array.isArray(columnNames)) {
          // Try to use the columnNames as target instead
          try {
            columnNames[0] = resolveModel(columnNames[0]);
          } catch (error) {
            // If it did not work, they were real columnNames
            if (error instanceof errors.ModelNotResolvedError) throw error;
          }
        }

        const models = candidates.map((candidate) => {
          if (!Array.isArray(candidate)) return resolveModel(candidate);

          const model = candidate[0];
          const morphValue = candidate[1];

          return [resolveModel(model), morphValue];
        });

        return BookshelfModel.prototype.morphTo.apply(this, [relationName, columnNames].concat(models));
      },

      through(Source, ...rest) {
        return BookshelfModel.prototype.through.apply(this, [resolveModel(Source), ...rest]);
      }
    },
    {
      /**
       * @method Model.forge
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
       * A simple static helper to instantiate a new {@link Collection}, setting the model it's
       * called on as the collection's target model.
       *
       * @example
       * Customer.collection().fetch().then((customers) => {
       *   // ...
       * })
       *
       * @method Model.collection
       * @param {Model[]} [models] Any models to be added to the collection.
       * @param {Object} [options] Additional options to pass to the {@link Collection} constructor.
       * @param {string|function} [options.comparator]
       *   If specified this is used to sort the collection. It can be a string representing the
       *   model attribute to sort by, or a custom function. Check the documentation for {@link
       *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
       *   Array.prototype.sort} for more info on how to use a custom comparator function. If this
       *   options is not specified the collection sort order depends on what the database returns.
       * @returns {Collection}
       *   The newly created collection. It will be empty unless any models were passed as the first
       *   argument.
       */
      collection(models, options) {
        return new bookshelf.Collection(models || [], _.extend({}, options, {model: this}));
      },

      /**
       * Shortcut to a model's `count` method so you don't need to instantiate a new model to count
       * the number of records.
       *
       * @example
       * Duck.count().then((count) => {
       *   console.log('number of ducks', count)
       * })
       *
       * @method Model.count
       * @since 0.8.2
       * @see Model#count
       * @param {string} [column='*']
       *   Specify a column to count. Rows with `null` values in this column will be excluded.
       * @param {Object} [options] Hash of options.
       * @param {boolean} [options.debug=false]
       *   Whether to enable debugging mode or not. When enabled will show information about the
       *   queries being run.
       * @returns {Promise<number|string>}
       */
      count(column, options) {
        return this.forge().count(column, options);
      },

      /**
       * @method Model.fetchAll
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
      _builder: builderFn,
      through(Source, ...args) {
        return BookshelfCollection.prototype.through.apply(this, [resolveModel(Source), ...args]);
      }
    },
    {
      /**
       * @method Collection.forge
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
  _.extend(bookshelf, Events, errors, {
    /**
     * An alias to `{@link http://knexjs.org/#Transactions Knex#transaction}`. The `transaction`
     * object must be passed along in the options of any relevant Bookshelf calls, to ensure all
     * queries are on the same connection. The entire transaction block is wrapped around a Promise
     * that will commit the transaction if it resolves successfully, or roll it back if the Promise
     * is rejected.
     *
     * Note that there is no need to explicitly call `transaction.commit()` or
     * `transaction.rollback()` since the entire transaction will be committed if there are no
     * errors inside the transaction block.
     *
     * When fetching inside a transaction it's possible to specify a row-level lock by passing the
     * wanted lock type in the `lock` option to {@linkcode Model#fetch fetch}. Available options are
     * `lock: 'forUpdate'` and `lock: 'forShare'`.
     *
     * @example
     * var Promise = require('bluebird')
     *
     * Bookshelf.transaction((t) => {
     *   return new Library({name: 'Old Books'})
     *     .save(null, {transacting: t})
     *     .tap(function(model) {
     *       return Promise.map([
     *         {title: 'Canterbury Tales'},
     *         {title: 'Moby Dick'},
     *         {title: 'Hamlet'}
     *       ], (info) => {
     *         return new Book(info).save({'shelf_id': model.id}, {transacting: t})
     *       })
     *     })
     * }).then((library) => {
     *   console.log(library.related('books').pluck('title'))
     * }).catch((err) => {
     *   console.error(err)
     * })
     *
     * @method Bookshelf#transaction
     * @param {Bookshelf~transactionCallback} transactionCallback
     *   Callback containing transaction logic. The callback should return a Promise.
     * @returns {Promise}
     *   A promise resolving to the value returned from
     *   {@link Bookshelf~transactionCallback transactionCallback}.
     */
    transaction() {
      return this.knex.transaction.apply(this.knex, arguments);
    },

    /**
     * This is a transaction block to be provided to {@link Bookshelf#transaction}. All of the
     * database operations inside it can be part of the same transaction by passing the
     * `transacting: transaction` option to {@link Model#fetch fetch}, {@link Model#save save} or
     * {@link Model#destroy destroy}.
     *
     * Note that unless you explicitly pass the `transaction` object along to any relevant model
     * operations, those operations will not be part of the transaction, even though they may be
     * inside the transaction callback.
     *
     * @callback Bookshelf~transactionCallback
     * @see {@link http://knexjs.org/#Transactions Knex#transaction}
     * @see Bookshelf#transaction
     *
     * @param {Transaction} transaction
     * @returns {Promise}
     *   The Promise will resolve to the return value of the callback, or be rejected with an error
     *   thrown inside it. If it resolves, the entire transaction is committed, otherwise it is
     *   rolled back.
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
     * to load. In this case it will try to find a module. It will pass the
     * string to `require()`, so you can either require a third-party dependency
     * by name or one of your own modules by relative path:
     *
     *     bookshelf.plugin('./bookshelf-plugins/my-favourite-plugin');
     *     bookshelf.plugin('plugin-from-npm');
     *
     * There are a few official plugins published in `npm`, along with many
     * independently developed ones. See
     * [the list of available plugins](index.html#official-plugins).
     *
     * You can also provide an array of strings or functions, which is the same
     * as calling `bookshelf.plugin()` multiple times. In this case the same
     * options object will be reused:
     *
     *     bookshelf.plugin(['cool-plugin', './my-plugins/even-cooler-plugin']);
     *
     * Example plugin:
     *
     *     // Converts all string values to lower case when setting attributes on a model
     *     module.exports = function(bookshelf) {
     *       bookshelf.Model = bookshelf.Model.extend({
     *         set(key, value, options) {
     *           if (!key) return this
     *           if (typeof value === 'string') value = value.toLowerCase()
     *           return bookshelf.Model.prototype.set.call(this, key, value, options)
     *         }
     *       })
     *     }
     *
     * @param {string|array|Function} plugin
     *   The plugin or plugins to load. If you provide a string it can
     *   represent an npm package or a file somewhere on your project. You can
     *   also pass a function as argument to add it as a plugin. Finally, it's
     *   also possible to pass an array of strings or functions to add them all
     *   at once.
     * @param {mixed} options
     *    This can be anything you want and it will be passed directly to the
     *    plugin as the second argument when loading it.
     * @return {Bookshelf} The bookshelf instance for chaining.
     */
    plugin(plugin, options) {
      if (_.isString(plugin)) {
        if (plugin === 'pagination') {
          const message =
            'Pagination plugin was moved into core Bookshelf. You can now use `fetchPage()` without having to ' +
            "call `.plugin('pagination')`. Remove any `.plugin('pagination')` calls to clear this message.";
          return console.warn(message); // eslint-disable-line no-console
        }

        if (plugin === 'visibility') {
          const message =
            'Visibility plugin was moved into core Bookshelf. You can now set the `hidden` and `visible` properties ' +
            "without having to call `.plugin('visibility')`. Remove any `.plugin('visibility')` calls to clear this " +
            'message.';
          return console.warn(message); // eslint-disable-line no-console
        }

        if (plugin === 'registry') {
          const message =
            'Registry plugin was moved into core Bookshelf. You can now register models using `bookshelf.model()` ' +
            "and collections using `bookshelf.collection()` without having to call `.plugin('registry')`. Remove " +
            "any `.plugin('registry')` calls to clear this message.";
          return console.warn(message); // eslint-disable-line no-console
        }

        if (plugin === 'processor') {
          const message =
            'Processor plugin was removed from core Bookshelf. To migrate to the new standalone package follow the ' +
            'instructions in https://github.com/bookshelf/bookshelf/wiki/Migrating-from-0.15.1-to-1.0.0#processor-plugin';
          return console.warn(message); // eslint-disable-line no-console
        }

        if (plugin === 'case-converter') {
          const message =
            'Case converter plugin was removed from core Bookshelf. To migrate to the new standalone package follow ' +
            'the instructions in https://github.com/bookshelf/bookshelf/wiki/Migrating-from-0.15.1-to-1.0.0#case-converter-plugin';
          return console.warn(message); // eslint-disable-line no-console
        }

        if (plugin === 'virtuals') {
          const message =
            'Virtuals plugin was removed from core Bookshelf. To migrate to the new standalone package follow ' +
            'the instructions in https://github.com/bookshelf/bookshelf/wiki/Migrating-from-0.15.1-to-1.0.0#virtuals-plugin';
          return console.warn(message); // eslint-disable-line no-console
        }

        require(plugin)(this, options);
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

module.exports = Bookshelf;
