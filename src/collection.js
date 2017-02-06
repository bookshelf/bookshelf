import { clone, omit, isString, isArray, extend, toArray } from 'lodash';

import Sync from './sync';
import Helpers from './helpers';
import EagerRelation from './eager';
import Errors from './errors';

import CollectionBase from './base/collection';
import Promise from './base/promise';
import createError from 'create-error';

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
const BookshelfCollection = CollectionBase.extend({

  /**
   * @method Collection#through
   * @description
   * Used to define passthrough relationships - `hasOne`, `hasMany`, `belongsTo`
   * or `belongsToMany`, "through" an `Interim` model or collection.
   *
   * @param {Model} Interim Pivot model.
   *
   * @param {string=} throughForeignKey
   *
   *   Foreign key in this collection model. By default, the `foreignKey` is assumed to
   *   be the singular form of the `Target` model's tableName, followed by `_id` /
   *   `_{{{@link Model#idAttribute idAttribute}}}`.
   *
   * @param {string=} otherKey
   *
   *   Foreign key in the `Interim` model. By default, the `otherKey` is assumed to
   *   be the singular form of this model's tableName, followed by `_id` /
   *   `_{{{@link Model#idAttribute idAttribute}}}`.
   *
   * @param {string=} throughForeignKeyTarget
   *
   *   Column in the `Target` model which `throughForeignKey` references, if other
   *   than `Target` model's `id` / `{@link Model#idAttribute idAttribute}`.
   *
   * @param {string=} otherKeyTarget
   *
   *   Column in this collection model which `otherKey` references, if other
   *   than `id` / `{@link Model#idAttribute idAttribute}`.
   *
   * @returns {Collection}
   */
  through: function(Interim, throughForeignKey, otherKey, throughForeignKeyTarget, otherKeyTarget) {
    return this.relatedData.through(this, Interim, {
      throughForeignKey, otherKey, throughForeignKeyTarget, otherKeyTarget
    });
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
  fetch: Promise.method(function(options) {
    options = options ? clone(options) : {};
    return this.sync(options)
      .select()
      .bind(this)
      .tap(function(response) {
        if (!response || response.length === 0) {
          throw new this.constructor.EmptyError('EmptyResponse');
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
          return this._handleEager(response, omit(options, 'columns'));
        }
      })
      .tap(function(response) {

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
      })
      .catch(this.constructor.EmptyError, function(err) {
        if (options.require) {
          throw err;
        }
        this.reset([], {silent: true});
      })
      .return(this);
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
  count: Promise.method(function(column, options) {
    if (!isString(column)) {
      options = column;
      column = undefined;
    }
    if (options) options = clone(options);
    return this.sync(options).count(column)
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
  fetchOne: Promise.method(function(options) {
    const model = new this.model();
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
  load: Promise.method(function(relations, options) {
    if (!isArray(relations)) relations = [relations]
    options = extend({}, options, {shallow: true, withRelated: relations});
    return new EagerRelation(this.models, this.toJSON(options), new this.model())
      .fetch(options)
      .return(this);
  }),

  /**
   * @method Collection#create
   * @description
   *
   * Convenience method to create a new {@link Model model} instance within a
   * collection. Equivalent to instantiating a model with a hash of {@link
   * Model#attributes attributes}, {@link Model#save saving} the model to the
   * database then adding the model to the collection.
   *
   * When used on a relation, `create` will automatically set foreign key
   * attributes before persisting the `Model`.
   *
   * ```
   * const { courses, ...attributes } = req.body;
   *
   * Student.forge(attributes).save().tap(student =>
   *   Promise.map(courses, course => student.related('courses').create(course))
   * ).then(student =>
   *   res.status(200).send(student)
   * ).catch(error =>
   *   res.status(500).send(error.message)
   * );
   * ```
   *
   * @param {Object} model A set of attributes to be set on the new model.
   * @param {Object=} options
   * @param {Transaction=} options.transacting
   *
   * @returns {Promise<Model>} A promise resolving with the new {@link Modle
   * model}.
   */
  create: Promise.method(function(model, options) {
    options = options != null ? clone(options) : {};
    const { relatedData } = this;
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
        if (relatedData && relatedData.type === 'belongsToMany') {
          return this.attach(model, omit(options, 'query'));
        }
      })
      .then(function() { this.add(model, options); })
      .return(model);
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
  resetQuery: function() {
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
   *     qb.where({id: 1}).select().then(function(resp) {
   *       // ...
   *     });
   *
   * collection.query(function(qb) {
   *   qb.where('id', '>', 5).andWhere('first_name', '=', 'Test');
   * }).fetch()
   *   .then(function(collection) {
   *     // ...
   *   });
   *
   * collection
   *   .query('where', 'other_id', '=', '5')
   *   .fetch()
   *   .then(function(collection) {
   *     // ...
   *   });
   *
   * @param {function|Object|...string=} arguments The query method.
   * @returns {Collection|QueryBuilder}
   *   Will return this model or, if called with no arguments, the underlying query builder.
   *
   * @see {@link http://knexjs.org/#Builder Knex `QueryBuilder`}
   */
  query: function() {
    return Helpers.query(this, toArray(arguments));
  },

  /**
   * @method Collection#orderBy
   * @since 0.9.3
   * @description
   *
   * Specifies the column to sort on and sort order.
   *
   * The order parameter is optional, and defaults to 'ASC'. You may
   * also specify 'DESC' order by prepending a hyphen to the sort column
   * name. `orderBy("date", 'DESC')` is the same as `orderBy("-date")`.
   *
   * Unless specified using dot notation (i.e., "table.column"), the default
   * table will be the table name of the model `orderBy` was called on.
   *
   * @example
   *
   * Cars.forge().orderBy('color', 'ASC').fetch()
   *    .then(function (rows) { // ...
   *
   * @param sort {string}
   *   Column to sort on
   * @param order {string}
   *   Ascending ('ASC') or descending ('DESC') order
   */
  orderBy (...args) {
    return Helpers.orderBy(this, ...args);
  },

  /**
   * @method Collection#query
   * @private
   * @description Creates and returns a new `Bookshelf.Sync` instance.
   */
  sync: function(options) {
    return new Sync(this, options);
  },

  /* Ensure that QueryBuilder is copied on clone. */
  clone() {
    const cloned = BookshelfCollection.__super__.clone.apply(this, arguments);
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
  _handleResponse: function(response) {
    const { relatedData } = this;
    this.set(response, {silent: true, parse: true}).invokeMap('_reset');
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
  _handleEager: function(response, options) {
    return new EagerRelation(this.models, response, new this.model())
      .fetch(options);
  }

}, {

  extended: function(child) {
    /**
     * @class Collection.EmptyError
     * @description
     *   Thrown when no records are found by {@link Collection#fetch fetch},
     *   {@link Model#fetchAll}, or {@link Model.fetchAll} when called with
     *   the `{require: true}` option.
     */
    child.EmptyError = createError(this.EmptyError)
  }

});

BookshelfCollection.EmptyError = Errors.EmptyError

export default BookshelfCollection;
