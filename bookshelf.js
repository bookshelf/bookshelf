//     Bookshelf.js 0.3.1

//     (c) 2013 Tim Griesser
//     Bookshelf may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://bookshelfjs.org
(function(define) {

"use strict";

define(function(require, exports) {

  // Initial Setup
  // -------------
  var Bookshelf   = exports;
  var Backbone    = require('backbone');
  var knex        = require('knex');
  var _           = require('underscore');
  var when        = require('when');
  var inflection  = require('inflection');

  var Events         = require('./lib/events').Events;
  var Sync           = require('./lib/sync').Sync;
  var ModelBase      = require('./lib/modelbase').ModelBase;
  var CollectionBase = require('./lib/collectionbase').CollectionBase;

  // Keep a reference to our own copy of Backbone, in case we want to use
  // this specific instance elsewhere in the application.
  Bookshelf.Backbone = Backbone;

  // Keep in sync with `package.json`.
  Bookshelf.VERSION = '0.3.1';

  // We're using a modified `Backbone.Events` rather than `EventEmitter`,
  // for consistency and portability.
  // `Bookshelf` may be used as a top-level pub-sub bus.
  _.extend(Bookshelf, Events);

  // Array helpers used throughout.
  var array  = [];
  var push   = array.push;
  var splice = array.splice;

  // Bookshelf.Model
  // -------------------

  // A Bookshelf Model represents an individual row in the database table --
  // It has a similar implementation to the `Backbone.Model`
  // constructor, except that defaults are not set until the
  // object is persisted, and the collection property is not used.
  var Model = Bookshelf.Model = ModelBase.extend({

    // The `hasOne` relation specifies that this table has exactly one of another type of object,
    // specified by a foreign key in the other table. The foreign key is assumed to be the singular of this
    // object's `tableName` with an `_id` suffix, but a custom `foreignKey` attribute may also be specified.
    hasOne: function(Target, foreignKey) {
      return new Relation('hasOne', Target, {foreignKey: foreignKey}).init(this);
    },

    // The `hasMany` relation specifies that this object has one or more rows in another table which
    // match on this object's primary key. The foreign key is assumed to be the singular of this object's
    // `tableName` with an `_id` suffix, but a custom `foreignKey` attribute may also be specified.
    hasMany: function(Target, foreignKey) {
      return new Relation('hasMany', Target, {foreignKey: foreignKey}).init(this);
    },

    // A reverse `hasOne` relation, the `belongsTo`, where the specified key in this table
    // matches the primary `idAttribute` of another table.
    belongsTo: function(Target, foreignKey) {
      return new Relation('belongsTo', Target, {foreignKey: foreignKey}).init(this);
    },

    // A `belongsToMany` relation is when there are many-to-many relation
    // between two models, with a joining table.
    belongsToMany: function(Target, joinTableName, foreignKey, otherKey) {
      return new Relation('belongsToMany', Target, {
        joinTableName: joinTableName, foreignKey: foreignKey, otherKey: otherKey
      }).init(this);
    },

    // A `morphOne` relation is a one-to-one polymorphic association from this model
    // to another model.
    morphOne: function(Target, name, morphValue) {
      return this._morphOneOrMany(Target, name, morphValue, 'morphOne');
    },

    // A `morphMany` relation is a polymorphic many-to-one relation from this model
    // to many another models.
    morphMany: function(Target, name, morphValue) {
      return this._morphOneOrMany(Target, name, morphValue, 'morphMany');
    },

    // Defines the opposite end of a `morphOne` or `morphMany` relationship, where
    // the alternate end of the polymorphic model is defined.
    morphTo: function(morphName) {
      if (!_.isString(morphName)) throw new Error('The `morphTo` name must be specified.');
      return new Relation('morphTo', null, {morphName: morphName, candidates: _.rest(arguments)}).init(this);
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
    fetch: function(options) {
      options || (options = {});
      var model = this;

      // Run the `first` call on the `sync` object to fetch a single model.
      var sync = this.sync(options).first()

        // Jump the rest of the chain if the response doesn't exist...
        .tap(function(response) {
          if (!response || response.length === 0) {
            if (options.require) throw new Error('EmptyResponse');
            return when.reject(null);
          }
        })

        // Now, load all of the data into the model as necessary.
        .tap(this._handleResponse);

      // If the "withRelated" is specified, we also need to eager load all of the
      // data on the model, as a side-effect, before we ultimately jump into the
      // next step of the model. For simplicity, we temporarily attach the options
      // to `_eagerOptions`, which is cleaned up in the `_handleEager` method.
      if (options.withRelated) {
        model._eagerOptions = options;
        sync = sync.tap(this._handleEager);
      }

      return sync.tap(function(response) {
        return model.triggerThen('fetched', model, response, options);
      })
      .yield(model)
      .otherwise(function(err) {
        if (err === null) return err;
        throw err;
      });
    },

    // Eager loads relationships onto an already populated `Model` instance.
    load: function(relations, options) {
      _.isArray(relations) || (relations = [relations]);
      this._eagerOptions = _.extend({}, options, {shallow: true, withRelated: relations});
      return this._handleEager([this.toJSON({shallow: true})]).yield(this);
    },

    // Sets and saves the hash of model attributes, triggering
    // a "creating" or "updating" event on the model, as well as a "saving" event,
    // to bind listeners for any necessary validation, logging, etc.
    // If an error is thrown during these events, the model will not be saved.
    save: function(key, val, options) {
      var attrs;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === "object") {
        attrs = key || {};
        options = val || {};
      } else {
        options || (options = {});
        (attrs = {})[key] = val;
      }

      // If the model has timestamp columns,
      // set them as attributes on the model, even
      // if the "patch" option is specified.
      if (this.hasTimestamps) _.extend(attrs, this.timestamp(options));

      // Determine whether the model is new, based on whether the model has an `idAttribute` or not.
      var method = options.method || (options.method = this.isNew(options) ? 'insert' : 'update');
      var vals = attrs;

      // If the object is being created, we merge any defaults here
      // rather than during object creation.
      if (method === 'insert' || options.defaults) {
        var defaults = _.result(this, 'defaults');
        if (defaults) {
          vals = _.extend({}, defaults, this.attributes, vals);
        }
      }

      // Set the attributes on the model, and maintain a reference to use below.
      var model = this.set(vals, {silent: true});

      // If there are any save constraints, set them on the model.
      if (this.relatedData) this.relatedData.saveConstraints(this);

      var sync  = this.sync(options);

      // Gives access to the `query` object in the `options`, in case we need it.
      options.query = sync.query;

      return when.all([
        model.triggerThen((method === 'insert' ? 'creating' : 'updating'), model, attrs, options),
        model.triggerThen('saving', model, attrs, options)
      ])
      .then(function() {
        return sync[options.method](method === 'update' && options.patch ? attrs : model.attributes);
      })
      .then(function(resp) {

        // After a successful database save, the id is updated if the model was created
        if (method === 'insert' && resp) {
          model.attributes[model.idAttribute] = model[model.idAttribute] = resp[0];
        }

        // In case we need to reference the `previousAttributes` for the model
        // in the following event handlers.
        options.previousAttributes = model._previousAttributes;

        model._reset();

        return when.all([
          model.triggerThen((method === 'insert' ? 'created' : 'updated'), model, resp, options),
          model.triggerThen('saved', model, resp, options)
        ]);

      }).yield(this);
    },

    // Destroy a model, calling a "delete" based on its `idAttribute`.
    // A "destroying" and "destroyed" are triggered on the model before
    // and after the model is destroyed, respectively. If an error is thrown
    // during the "destroying" event, the model will not be destroyed.
    destroy: function(options) {
      options || (options = {});
      var model = this;
      return model.triggerThen('destroying', model, options)
      .then(function() { return model.sync(options).del(); })
      .then(function(resp) {
        model.clear();
        return model.triggerThen('destroyed', model, resp, options);
      })
      .then(function() { return model._reset(); });
    },

    // **format** converts a model into the values that should be saved into
    // the database table. The default implementation is just to pass the response along.
    format: function(attrs, options) {
      return attrs;
    },

    // Returns the related item, or creates a new
    // related item by creating a new model or collection.
    related: function(name) {
      return this.relations[name] || (this[name] ? this.relations[name] = this[name]() : void 0);
    },

    // Reset the query builder, called internally
    // each time a query is run.
    resetQuery: function() {
      delete this._knex;
      return this;
    },

    // Returns an instance of the query builder.
    query: function() {
      return query(this, _.toArray(arguments));
    },

    // Returns a `knex` instance with the specified table name.
    builder: function(table) {
      return knex(table);
    },

    // Creates and returns a new `Sync` instance.
    sync: function(options) {
      return new Sync(this, options);
    },

    // Helper for setting up the `morphOne` or `morphMany` relations.
    _morphOneOrMany: function(Target, morphName, morphValue, type) {
      if (!morphName || !Target) throw new Error('The polymorphic `name` and `Target` are required.');
      return new Relation(type, Target, {morphName: morphName, morphValue: morphValue}).init(this);
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
    _handleEager: function(response) {
      var model = this;
      var options = this._eagerOptions;
      delete this._eagerOptions;
      return new EagerRelation([this], response, this).fetch(options);
    }

  });

  // Bookshelf.Collection
  // -------------------

  // A Bookshelf Collection contains a number of database rows, represented by
  // models, so they can be easily sorted, serialized, and manipulated.
  var Collection = Bookshelf.Collection = CollectionBase.extend({

    model: Model,

    // Used to define passthrough relationships - `hasOne`, `hasMany`,
    // `belongsTo` or `belongsToMany`, "through" a `Interim` model or collection.
    through: function(Interim, foreignKey, otherKey) {
      return this.relatedData.through(this, Interim, {throughForeignKey: foreignKey, otherKey: otherKey});
    },

    // Fetch the models for this collection, resetting the models
    // for the query when they arrive.
    fetch: function(options) {
      options || (options = {});
      var collection = this, relatedData = this.relatedData;
      return this.sync(options)
        .select()
        .then(function(response) {
          if (response && response.length > 0) {
            collection.set(response, {silent: true, parse: true}).invoke('_reset');
            if (relatedData && relatedData.isJoined()) relatedData.parsePivot(collection.models);
          } else {
            collection.reset([], {silent: true});
            return [];
          }
          if (!options.withRelated) return response;
          return new EagerRelation(collection.models, response, new collection.model())
            .fetch(options)
            .then(function() { return response; });
        })
        .then(function(response) {
          return collection.triggerThen('fetched', collection, response, options).then(function() {
            return collection;
          });
        });
    },

    // Fetches a single model from the collection, useful on related collections.
    fetchOne: function(options) {
      var model = new this.model;
      model._knex = this.query().clone();
      if (this.relatedData) model.relatedData = this.relatedData;
      return model.fetch(options);
    },

    // Eager loads relationships onto an already populated `Collection` instance.
    load: function(relations, options) {
      var collection = this;
      _.isArray(relations) || (relations = [relations]);
      options = _.extend({}, options, {shallow: true, withRelated: relations});
      return new EagerRelation(this.models, this.toJSON(options), new this.model())
        .fetch(options)
        .then(function() { return collection; });
    },

    // Shortcut for creating a new model, saving, and adding to the collection.
    // Returns a promise which will resolve with the model added to the collection.
    // If the model is a relation, put the `foreignKey` and `fkValue` from the `relatedData`
    // hash into the inserted model. Also, if the model is a `manyToMany` relation,
    // automatically create the joining model upon insertion.
    create: function(model, options) {
      options || (options = {});

      var collection  = this;
      var relatedData = this.relatedData || new Relation();
      var type        = relatedData.type;

      model = this._prepareModel(model, options);

      // If we've already added things on the query chain,
      // these are likely intended for the model.
      if (this._knex) {
        model._knex = this._knex;
        this.resetQuery();
      }

      return relatedData
        .saveConstraints(model, this)
        .save(null, options)
        .then(function() {
          if (type && (type === 'belongsToMany' || relatedData.isThrough())) {
            return collection.attach(model, options);
          }
        })
        .then(function() {
          collection.add(model, options);
          return model;
        });
    },

    // Reset the query builder, called internally
    // each time a query is run.
    resetQuery: function() {
      delete this._knex;
      return this;
    },

    // Returns an instance of the query builder.
    query: function() {
      return query(this, _.toArray(arguments));
    },

    // Returns a `knex` instance with the specified table name.
    builder: function(table) {
      return knex(table);
    },

    // Creates and returns a new `Bookshelf.Sync` instance.
    sync: function(options) {
      return new Sync(this, options);
    }

  });

  // EagerRelation
  // ---------------

  // An `EagerRelation` object temporarily stores the models from an eager load,
  // and handles matching eager loaded objects with their parent(s). The `tempModel`
  // is only used to retrieve the value of the relation method, to know the constrains
  // for the eager query.
  var EagerRelation = function(parent, parentResponse, target) {
    this.parent = parent;
    this.target = target;
    this.parentResponse = parentResponse;
    _.bindAll(this, 'pushModels', 'eagerFetch');
  };

  EagerRelation.prototype = {

    // This helper function is used internally to determine which relations
    // are necessary for fetching based on the `model.load` or `withRelated` option.
    fetch: function(options) {
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
          beforeFn: withRelated[relationName] || noop
        })));
      }

      // Return a deferred handler for all of the nested object sync
      // returning the original response when these syncs & pairings are complete.
      return when.all(pendingDeferred).yield(this.parentResponse);
    },

    // Prep the `withRelated` object, to normalize into an object where each
    // has a function that is called when running the query.
    prepWithRelated: function(withRelated) {
      if (!_.isArray(withRelated)) withRelated = [withRelated];
      return _.reduce(withRelated, function(memo, item) {
        _.isString(item) ? memo[item] = noop : _.extend(memo, item);
        return memo;
      }, {});
    },

    // Handles an eager loaded fetch, passing the name of the item we're fetching for,
    // and any options needed for the current fetch.
    eagerFetch: function(relationName, handled, options) {
      var relatedData = handled.relatedData;

      if (relatedData.type === 'morphTo') return this.morphToFetch(relationName, relatedData, options);

      // Call the function, if one exists, to constrain the eager loaded query.
      options.beforeFn.call(handled, handled.query());

      var relation = this;
      return handled
        .sync(_.extend({}, options, {parentResponse: this.parentResponse}))
        .select()
        .then(function(resp) {
          var relatedModels = relation.pushModels(relationName, handled, resp);

          // If there is a response, fetch additional nested eager relations, if any.
          if (resp.length > 0 && options.withRelated) {
            return new EagerRelation(relatedModels, resp, relatedData.createModel())
              .fetch(options)
              .then(function() { return resp; });
          }
          return resp;
        });
    },

    // Special handler for the eager loaded morph-to relations, this handles
    // the fact that there are several potential models that we need to be fetching against.
    // pairing them up onto a single response for the eager loading.
    morphToFetch: function(relationName, relatedData, options) {
      var pending = [];
      var groups = _.groupBy(this.parent, function(m) {
        return m.get(relationName + '_type');
      });
      for (var group in groups) {
        var Target = morphCandidate(relatedData.candidates, group);
        var target = new Target();
        pending.push(target
          .query('whereIn',
            _.result(target, 'idAttribute'), _.uniq(_.invoke(groups[group], 'get', relationName + '_id'))
          )
          .sync(options)
          .select()
          .then(this.morphToHandler(relationName, relatedData, Target)));
      }
      return when.all(pending).then(function(resps) {
        return _.flatten(resps);
      });
    },

    // Handler for the individual `morphTo` fetches,
    // attaching any of the related models onto the parent objects,
    // stopping at this level of the eager relation loading.
    morphToHandler: function(relationName, settings, Target) {
      var eager = this;
      return function(resp) {
        eager.pushModels(relationName, {relatedData: new Relation('morphTo', Target, {morphName: relationName})}, resp);
      };
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
      // If this is a morphTo, we only want to pair on the morphValue for the current relation.
      if (relatedData.type === 'morphTo') {
        models = _.filter(models, function(model) { return model.get(relatedData.key('morphKey')) === relatedData.key('morphValue'); });
      }
      return relatedData.eagerPair(relationName, related, models);
    }
  };

  // The `forge` function properly instantiates a new Model or Collection
  // without needing the `new` operator... to make object creation cleaner
  // and more chainable.
  Model.forge = Collection.forge = function() {
    var inst = Object.create(this.prototype);
    var obj = this.apply(inst, arguments);
    return (Object(obj) === obj ? obj : inst);
  };

  // Helpers
  // -------------------

  // Specific to many-to-many relationships, these methods are mixed
  // into the `belongsToMany` relationships when they are created,
  // providing helpers for attaching and detaching related models.
  Bookshelf.pivotHelpers = {

    // Attach one or more "ids" from a foreign
    // table to the current. Creates & saves a new model
    // and attaches the model with a join table entry.
    attach: function(ids, options) {
      return this._handler('insert', ids, options);
    },

    // Detach related object from their pivot tables.
    // If a model or id is passed, it attempts to remove the
    // pivot table based on that foreign key. If a hash is passed,
    // it attempts to remove the item based on a where clause with
    // these parameters. If no parameters are specified, we assume we will
    // detach all related associations.
    detach: function(ids, options) {
      return this._handler('delete', ids, options);
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
    _handler: function(method, ids, options) {
      var pending = [];
      if (ids == void 0) {
        if (method === 'insert') return when.resolve(this);
        if (method === 'delete') pending.push(this._processPivot(method, null, options));
      }
      if (!_.isArray(ids)) ids = ids ? [ids] : [];
      for (var i = 0, l = ids.length; i < l; i++) {
        pending.push(this._processPivot(method, ids[i], options));
      }
      var collection = this;
      return when.all(pending).then(function() {
        return collection;
      });
    },

    // Handles setting the appropriate constraints and shelling out
    // to either the `insert` or `delete` call for the current model,
    // returning a promise.
    _processPivot: function(method, item, options) {
      var data = {};
      var relatedData = this.relatedData;
      data[relatedData.key('foreignKey')] = relatedData.parentFk;

      // If the item is an object, it's either a model
      // that we're looking to attach to this model, or
      // a hash of attributes to set in the relation.
      if (_.isObject(item)) {
        if (item instanceof ModelBase) {
          data[relatedData.key('otherKey')] = item.id;
        } else {
          _.extend(data, item);
        }
      } else if (item) {
        data[relatedData.key('otherKey')] = item;
      }
      var builder = this.builder(relatedData.joinTable());
      if (options && options.transacting) {
        builder.transacting(options.transacting);
      }
      if (method === 'delete') return builder.where(data).del();
      return builder.insert(data);
    }
  };

  // Used internally, the `Relation` helps in simplifying the relationship building,
  // centralizing all logic dealing with type & option handling.
  var Relation = Bookshelf.Relation = function(type, Target, options) {
    this.type = type;
    if (this.target = Target) {
      this.targetTableName = _.result(Target.prototype, 'tableName');
      this.targetIdAttribute = _.result(Target.prototype, 'idAttribute');
    }
    _.extend(this, options);
  };

  Relation.prototype = {

    // Assembles the new model or collection we're creating an instance of,
    // gathering any relevant primitives from the parent object,
    // without keeping any hard references.
    init: function(parent) {
      this.parentId = parent.id;
      this.parentTableName   = _.result(parent, 'tableName');
      this.parentIdAttribute = _.result(parent, 'idAttribute');

      // If the parent object is eager loading, we don't need the
      // id attribute, because we'll just be creating a `whereIn` from the
      // previous response anyway.
      if (!parent._isEager) {
        if (this.isInverse()) {
          if (this.type === 'morphTo') {
            this.target = morphCandidate(this.candidates, parent.get(this.key('morphKey')));
          }
          this.parentFk = parent.get(this.key('foreignKey'));
        } else {
          this.parentFk = parent.id;
        }
      }

      var target = this.target ? this.relatedInstance() : {};
          target.relatedData = this;

      if (this.type === 'belongsToMany') {
        _.extend(target, Bookshelf.pivotHelpers);
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
      _.extend(source, Bookshelf.pivotHelpers);

      // Set the appropriate foreign key if we're doing a belongsToMany, for convenience.
      if (this.type === 'belongsToMany') {
        this.foreignKey = this.throughForeignKey;
      }

      return source;
    },

    // Generates and returns a specified key, for convenience... one of
    // `foreignKey`, `otherKey`, `throughForeignKey`.
    key: function(keyName) {
      if (this[keyName]) return this[keyName];
      if (keyName === 'otherKey') {
        return this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
      }
      if (keyName === 'throughForeignKey') {
        return this[keyName] = singularMemo(this.joinTable()) + '_' + this.throughIdAttribute;
      }
      if (keyName === 'foreignKey') {
        if (this.type === 'morphTo') return this[keyName] = this.morphName + '_id';
        if (this.type === 'belongsTo') return this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
        if (this.isMorph()) return this[keyName] = this.morphName + '_id';
        return this[keyName] = singularMemo(this.parentTableName) + '_' + this.parentIdAttribute;
      }
      if (keyName === 'morphKey') return this[keyName] = this.morphName + '_type';
      if (keyName === 'morphValue') return this[keyName] = this.parentTableName || this.targetTableName;
    },

    // Injects the necessary `select` constraints into a `knex` query builder.
    selectConstraints: function(knex, options) {
      var resp = options.parentResponse;

      // The base select column
      if (knex.columns.length === 0 && (!options.columns || options.columns.length === 0)) {
        knex.columns.push(this.isJoined() ? this.targetTableName + '.*' : '*');
      } else if (_.isArray(options.columns) && options.columns.length > 0) {
        push.apply(knex.columns, options.columns);
      }

      // The `belongsToMany` and `through` relations have joins & pivot columns.
      if (this.isJoined()) {
        this.joinClauses(knex);
        this.joinColumns(knex);
      }

      // If this is a single relation and we're not eager loading,
      // limit the query to a single item.
      if (this.isSingle()) {
        if (!resp) knex.limit(1);
      }

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
      push.apply(knex.columns, _.map(columns, function(col) {
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
        key = this.isInverse() ? this.parentIdAttribute : this.key('foreignKey');
      }

      knex[resp ? 'whereIn' : 'where'](key, resp ? this.eagerKeys(resp) : this.parentFk);

      if (this.isMorph()) {
        knex.where(this.key('morphKey'), this.key('morphValue'));
      }
    },

    // Fetches all `eagerKeys` from the current relation.
    eagerKeys: function(resp) {
      return _.uniq(_.pluck(resp, this.isInverse() ? this.key('foreignKey') : this.parentIdAttribute));
    },

    // Generates the appropriate standard join table.
    joinTable: function() {
      if (this.isThrough()) return this.throughTableName;
      return this.joinTableName || [
        this.parentTableName,
        this.targetTableName
      ].sort().join('_');
    },

    // Sets the constraints necessary during a `model.save` call.
    saveConstraints: function(model) {
      var data = {};
      var type = this.type;
      if (type && type !== 'belongsToMany') {
        data[this.key('foreignKey')] = this.parentFk;
        if (this.isMorph()) data[this.key('morphKey')] = this.key('morphValue');
      }
      return model.set(data);
    },

    // Creates a new model or collection instance, depending on
    // the `relatedData` settings and the models passed in.
    relatedInstance: function(models) {
      models || (models = []);

      var Target = this.target;
      if (this.isSingle()) {
        if (!Target.prototype instanceof ModelBase) {
          throw new Error('The `'+this.type+'` related object must be a Bookshelf.Model');
        }
        return models[0] || new Target();
      }

      // Allows us to just use a model, but create a temporary collection for
      // a many relation.
      if (Target.prototype instanceof ModelBase) {
        Target = Bookshelf.Collection.extend({
          model: Target,
          builder: Target.prototype.builder
        });
      }
      return new Target(models, {parse: true});
    },

    // Creates a new model, used internally in the eager fetch helper methods.
    createModel: function(data) {
      if (this.target.prototype instanceof Collection) {
        return new this.target.prototype.model(data, {parse: true})._reset();
      }
      return new this.target(data, {parse: true})._reset();
    },

    // Groups the related response according to the type of relationship
    // we're handling, for easy attachment to the parent models.
    eagerPair: function(relationName, related, models) {

      // If this is a `through` or `belongsToMany` relation, we need to cleanup & setup the `interim` model.
      if (this.isJoined()) related = this.parsePivot(related);

      var grouped = _.groupBy(related, function(model) {
        return this.isSingle() ? model.id : (model.pivot ?
          model.pivot.get(this.key('foreignKey')) : model.get(this.key('foreignKey')));
      }, this);

      for (var i = 0, l = models.length; i < l; i++) {
        var model = models[i];
        var groupedKey = this.isInverse() ? model.get(this.key('foreignKey')) : model.id;
        model.relations[relationName] = this.relatedInstance(grouped[groupedKey]);
      }
      return related;
    },

    // The `models` is an array of models returned from the fetch,
    // after they're `set`... parsing out any of the `_pivot_` items from the
    // join table and assigning them on the pivot model or object as appropriate.
    parsePivot: function(models) {
      var Through = this.throughTarget;
      return _.map(models, function(model) {
        var data = {}, attrs = model.attributes, through;
        if (Through) through = new Through();
        for (var key in attrs) {
          if (key.indexOf('_pivot_') === 0) {
            data[key.slice(7)] = attrs[key];
            delete attrs[key];
          }
        }
        if (!_.isEmpty(data)) {
          model.pivot = through ? through.set(data, {silent: true}) : new Model(data, {
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
  };

  // Helper functions
  // -------------------
  var noop = function() {};

  // If there are no arguments, return the current object's
  // query builder (or create and return a new one). If there are arguments,
  // call the query builder with the first argument, applying the rest.
  // If the first argument is an object, assume the keys are query builder
  // methods, and the values are the arguments for the query.
  var query = function(obj, args) {
    obj._knex || (obj._knex = obj.builder(_.result(obj, 'tableName')));
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
  };

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

  // Finds the specific `morphTo` table we should be working with, or throws
  // an error if none is matched.
  var morphCandidate = function(candidates, foreignTable) {
    var Target = _.find(candidates, function(Candidate) {
      return (_.result(Candidate.prototype, 'tableName') === foreignTable);
    });
    if (!Target) {
      throw new Error('The target polymorphic model was not found');
    }
    return Target;
  };

  // References to the default `Knex` and `Knex.Transaction`, overwritten
  // when a new database connection is created in `Initialize` below.
  Bookshelf.Knex = knex;
  Bookshelf.Transaction = knex.Transaction;

  // Bookshelf.Initialize
  // -------------------

  // Configure the `Bookshelf` settings (database adapter, etc.) once,
  // so it is ready on first model initialization.
  Bookshelf.Initialize = function(name, options) {
    var Target;
    if (_.isObject(name)) {
      options = name;
      name = 'main';
    }
    if (Bookshelf.Instances[name]) {
      throw new Error('A ' + name + ' instance of Bookshelf already exists');
    }

    // If an object with this name already exists in `Knex.Instances`, we will
    // use that copy of `Knex` without trying to re-initialize.
    var Builder = (knex[name] || knex.Initialize(name, options));

    if (name === 'main') {
      Target = Bookshelf.Instances['main'] = Bookshelf;
    } else {
      Target = Bookshelf.Instances[name] = {};

      // Create a new `Bookshelf` instance for this database connection.
      _.extend(Target, _.omit(Bookshelf, 'Instances', 'Initialize', 'Knex', 'Transaction', 'VERSION'), {
        Knex: Builder,
        Transaction: Builder.Transaction
      });

      // Attach a new builder function that references the correct connection.
      _.each(['Model', 'Collection'], function(item) {
        Target[item] = Bookshelf[item].extend({
          builder: function(table) {
            return Builder(table);
          }
        });
      });
    }

    // Set the instanceName, so we know what Bookshelf we're using.
    Target.instanceName = name;

    // Return the initialized instance.
    return Target;
  };

  // Named instances of Bookshelf, presumably with different `Knex`
  // options, to initialize different databases.
  // The main instance being named "main"...
  Bookshelf.Instances = {};

  // The main Bookshelf `instanceName`... incase we're using Bookshelf
  // after `Knex` has been initialized, for consistency.
  Bookshelf.instanceName = 'main';

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);