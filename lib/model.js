// Model
// ---------------
var _              = require('lodash');
var createError    = require('create-error')

var Sync           = require('./sync');
var Helpers        = require('./helpers');
var EagerRelation  = require('./eager');
var Errors         = require('./errors');

var ModelBase      = require('./base/model');
var Promise        = require('./base/promise');

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

  // Update the attributes of a model, fetching it by its primary key. If
  // no attribute matches its `idAttribute`, then fetch by all available
  // fields.
  refresh: function(options) {

    // If this is new, we use all its attributes. Otherwise we just grab the
    // primary key.
    var attributes = this.isNew()
      ? this.attributes
      : _.pick(this.attributes, this.idAttribute)

    return this._doRefresh(attributes, options);
  },

  // Fetch a model based on the currently set attributes, returning a model to
  // the callback, along with any options.  Returns a deferred promise through
  // the `Bookshelf.Sync`.  If `{require: true}` is set as an option, the fetch
  // is considered a failure if the model comes up blank.
  fetch: function(options) {

    // Fetch uses all set attributes.
    return this._doRefresh(this.attributes, options);
  },

  _doRefresh: Promise.method(function(attributes, options) {
    options = options ? _.clone(options) : {};

    // Run the `first` call on the `sync` object to fetch a single model.
    return this.sync(options)
      .first(attributes)
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

      // Determine whether which kind of save we will do, update or insert.
      var method = options.method = this.saveMethod(options);

      // If the object is being created, we merge any defaults here rather than
      // during object creation.
      if (method === 'insert' || options.defaults) {
        var defaults = _.result(this, 'defaults');
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
        _.extend(attrs, this.timestamp({method: method, silent: true}));
      }

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
