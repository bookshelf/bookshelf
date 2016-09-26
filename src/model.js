import _ from 'lodash';
import createError from 'create-error';

import Sync from './sync';
import Helpers from './helpers';
import EagerRelation from './eager';
import Errors from './errors';

import ModelBase from './base/model';
import Promise from './base/promise';

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
 *     let Book = bookshelf.Model.extend({
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
const BookshelfModel = ModelBase.extend({

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
   *       // ...
   *     });
   *
   *     // alternatively, if you don't need the relation loaded on the patient's relations hash:
   *     new Patient({id: 1}).record().fetch().then(function(model) {
   *       // ...
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
  hasOne(Target, foreignKey) {
    return this._relation('hasOne', Target, {foreignKey}).init(this);
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
  hasMany(Target, foreignKey) {
    return this._relation('hasMany', Target, {foreignKey}).init(this);
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
  belongsTo(Target, foreignKey) {
    return this._relation('belongsTo', Target, {foreignKey}).init(this);
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
   *   be the singular form of this model's tableName, followed by `_id` /
   *   `_{{{@link Model#idAttribute idAttribute}}}`.
   *
   * @param {string=} otherKey
   *
   *   Foreign key in the `Target` model. By default, the `otherKey` is assumed to
   *   be the singular form of the `Target` model's tableName, followed by `_id` /
   *   `_{{{@link Model#idAttribute idAttribute}}}`.
   *
   * @returns {Collection}
   */
  belongsToMany(Target, joinTableName, foreignKey, otherKey) {
    return this._relation('belongsToMany', Target, {
      joinTableName, foreignKey, otherKey
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
  morphOne(Target, name, columnNames, morphValue) {
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
  morphMany(Target, name, columnNames, morphValue) {
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
  morphTo(morphName) {
    if (!_.isString(morphName)) throw new Error('The `morphTo` name must be specified.');
    let columnNames, candidates;
    if (_.isArray(arguments[1])) {
      columnNames = arguments[1];
      candidates = _.drop(arguments, 2);
    } else {
      columnNames = null;
      candidates = _.drop(arguments);
    }
    return this._relation('morphTo', null, {morphName, columnNames, candidates}).init(this);
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
   *     });
   *
   *     let Chapter = bookshelf.Model.extend({
   *       tableName: 'chapters',
   *
   *       paragraphs: function() {
   *         return this.hasMany(Paragraph);
   *       }
   *     });
   *
   *     let Paragraph = bookshelf.Model.extend({
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
  through(Interim, throughForeignKey, otherKey) {
    return this.relatedData.through(this, Interim, {throughForeignKey: throughForeignKey, otherKey: otherKey});
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
  refresh(options) {

    // If this is new, we use all its attributes. Otherwise we just grab the
    // primary key.
    const attributes = this.isNew()
      ? this.attributes
      : _.pick(this.attributes, this.idAttribute)

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
   *       chapters: function() {
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
   *   NotFoundError} if results are empty.
   * @param {string|string[]} [options.columns='*']
   *   Specify columns to be retrieved.
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
  fetch(options) {

    // Fetch uses all set attributes.
    return this._doFetch(this.attributes, options);
  },

  _doFetch: Promise.method(function(attributes, options) {
    options = options ? _.clone(options) : {};

    // Run the `first` call on the `sync` object to fetch a single model.
    return this.sync(options)
      .first(attributes)
      .bind(this)

      // Jump the rest of the chain if the response doesn't exist...
      .tap(function(response) {
        if (!response || response.length === 0) {
          throw new this.constructor.NotFoundError('EmptyResponse');
        }
      })

      // Now, load all of the data into the model as necessary.
      .tap(this._handleResponse)

      // If the "withRelated" is specified, we also need to eager load all of the
      // data on the model, as a side-effect, before we ultimately jump into the
      // next step of the model. Since the `columns` are only relevant to the
      // current level, ensure those are omitted from the options.
      .tap(function(response) {
        if (options.withRelated) {
          return this._handleEager(response, _.omit(options, 'columns'));
        }
      })

      .tap(function(response) {

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
      })
      .return(this)
      .catch(this.constructor.NotFoundError, function(err) {
        if (options.require) {
          throw err;
        }
        return null
      });
  }),

  // Private for now.
  all() {
    const collection = this.constructor.collection();
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
  count(column, options) {
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
   *  Rejects the returned promise with an `Collection.EmptyError` if no records are returned.
   *
   * @param {Transaction=} options.transacting
   *
   *   Optionally run the query in a transaction.
   *
   * @fires Model#"fetching:collection"
   * @fires Model#"fetched:collection"
   *
   * @throws {Collection.EmptyError}
   *
   *  Rejects the promise in the event of an empty response if the `require: true` option.
   *
   * @returns {Promise<Collection>} A promise resolving to the fetched {@link Collection collection}.
   *
   */
  fetchAll(options) {
    const collection = this.all();
    return collection
      .once('fetching', (__, columns, opts) => {
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
        return this.triggerThen('fetching:collection', collection, columns, opts);
      })
      .once('fetched', (__, resp, opts) => {
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
        return this.triggerThen('fetched:collection', collection, resp, opts);
      })
      .fetch(options);
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
  load: Promise.method(function(relations, options) {
    const columns = this.format({ ...this.attributes });
    const withRelated = _.isArray(relations) ? relations : [relations];
    return this._handleEager(
      [columns], { ...options, shallow: true, withRelated }
    ).return(this);
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
   *     Model.forge({id: 5}).save({firstName: "John", lastName: "Smith"}).then(function() { //...
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
  save: Promise.method(function(key, val, options) {
    let attrs;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (key == null || typeof key === "object") {
      attrs = key || {};
      options = _.clone(val) || {};
    } else {
      (attrs = {})[key] = val;
      options = options ? _.clone(options) : {};
    }

    return Promise.bind(this).then(function() {
      return this.saveMethod(options);
    }).then(function(method) {

      // Determine whether which kind of save we will do, update or insert.
      options.method = method

      // If the object is being created, we merge any defaults here rather than
      // during object creation.
      if (method === 'insert' || options.defaults) {
        const defaults = _.result(this, 'defaults');
        if (defaults) {
          attrs = _.extend({}, defaults, this.attributes, attrs);
        }
      }

      // Set the attributes on the model. Note that we do this before adding
      // timestamps, as `timestamp` calls `set` internally.
      this.set(attrs, {silent: true});

      // Now set timestamps if appropriate. Extend `attrs` so that the
      // timestamps will be provided for a patch operation.
      if (this.hasTimestamps) {
        _.extend(attrs, this.timestamp(_.extend(options, {silent: true})));
      }

      // If there are any save constraints, set them on the model.
      if (this.relatedData && this.relatedData.type !== 'morphTo') {
        Helpers.saveConstraints(this, this.relatedData);
      }

      // Gives access to the `query` object in the `options`, in case we need it
      // in any event handlers.
      const sync = this.sync(options);
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
      return this.triggerThen((method === 'insert' ? 'creating saving' : 'updating saving'), this, attrs, options)
      .bind(this)
      .then(function() {
        return sync[options.method](method === 'update' && options.patch ? attrs : this.attributes);
      })
      .then(function(resp) {

        // After a successful database save, the id is updated if the model was created
        if (method === 'insert' && this.id == null) {
          const updatedCols = {};
          updatedCols[this.idAttribute] = this.id = resp[0];
          const updatedAttrs = this.parse(updatedCols);
          _.assign(this.attributes, updatedAttrs);
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
        return this.triggerThen((method === 'insert' ? 'created saved' : 'updated saved'), this, resp, options);
      });
    })
    .return(this);
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
  destroy: Promise.method(function(options) {
    options = options ? _.clone(options) : {};
    const sync = this.sync(options);
    options.query = sync.query;
    return Promise.bind(this).then(function() {

      /**
       * Destroying event.
       *
       * Fired before a `delete` query. A promise may be returned from the event
       * handler for async behaviour. Throwing an exception from the handler
       * will reject the promise and cancel the deletion.
       *
       * @event Model#destroying
       * @param {Model}  model    The model firing the event.
       * @param {Object} options  Options object passed to {@link Model#save save}.
       * @returns {Promise}
       */
      return this.triggerThen('destroying', this, options);
    }).then(function() {
      return sync.del();
    }).then(function(resp) {
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
  resetQuery() {
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
   *   .then(function(model) {
   *     // ...
   *   });
   *
   * let qb = model.query();
   * qb.where({id: 1}).select().then(function(resp) {
   *   // ...
   * });
   *
   * @method Model#query
   * @param {function|Object|...string=} arguments The query method.
   * @returns {Model|QueryBuilder}
   *   Will return this model or, if called with no arguments, the underlying query builder.
   *
   * @see {@link http://knexjs.org/#Builder Knex `QueryBuilder`}
   */
  query() {
    return Helpers.query(this, _.toArray(arguments));
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
   * model.where({favorite_color: 'red', shoe_size: 12}).fetch().then(function() { //...
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
  where(...args) {
    return this.query('where', ...args);
  },

  /**
   * @method Model#orderBy
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
   * Car.forge().orderBy('color', 'ASC').fetchAll()
   *    .then(function (rows) { // ...
   *
   * @param sort {string}
   *   Column to sort on
   * @param order {string}
   *   Ascending ('ASC') or descending ('DESC') order
   */
  orderBy(...args) {
    return Helpers.orderBy(this, ...args);
  },

  /* Ensure that QueryBuilder is copied on clone. */
  clone() {
    // This needs to use the direct apply method because the spread operator
    // incorrectly converts to `clone.apply(ModelBase.prototype, arguments)`
    // instead of `apply(this, arguments)`
    const cloned = BookshelfModel.__super__.clone.apply(this, arguments);
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
  sync(options) {
    return new Sync(this, options);
  },

  /**
   * Helper for setting up the `morphOne` or `morphMany` relations.
   *
   * @method Model#_morphOneOrMany
   * @private
   */
  _morphOneOrMany(Target, morphName, columnNames, morphValue, type) {
    if (!_.isArray(columnNames)) {
      // Shift by one place
      morphValue = columnNames;
      columnNames = null;
    }
    if (!morphName || !Target) throw new Error('The polymorphic `name` and `Target` are required.');
    return this._relation(type, Target, {morphName: morphName, morphValue: morphValue, columnNames: columnNames}).init(this);
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
  _handleResponse(response) {
    const relatedData = this.relatedData;
    this.set(this.parse(response[0]), {silent: true})._reset();
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
  _handleEager(response, options) {
    return new EagerRelation([this], response, this).fetch(options);
  }

}, {

  extended(child) {
    /**
     * @class Model.NotFoundError
     * @description
     *
     *   Thrown when no records are found by {@link Model#fetch fetch} or
     *   {@link Model#refresh} when called with the
     *   `{require: true}` option.
     */
    child.NotFoundError = createError(this.NotFoundError)

    /**
     * @class Model.NoRowsUpdatedError
     * @description
     *
     *   Thrown when no records are saved by {@link Model#save save}
     *   unless called with the `{require: false}` option.
     */
    child.NoRowsUpdatedError = createError(this.NoRowsUpdatedError)

    /**
     * @class Model.NoRowsDeletedError
     * @description
     *
     *   Thrown when no record is deleted by {@link Model#destroy destroy}
     *   if called with the `{require: true}` option.
     */
    child.NoRowsDeletedError = createError(this.NoRowsDeletedError)
  }

});

BookshelfModel.NotFoundError      = Errors.NotFoundError
BookshelfModel.NoRowsUpdatedError = Errors.NoRowsUpdatedError
BookshelfModel.NoRowsDeletedError = Errors.NoRowsDeletedError

module.exports = BookshelfModel;
