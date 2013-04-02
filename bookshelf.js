//     Bookshelf.js 0.1.0

//     (c) 2013 Tim Griesser
//     Bookshelf may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://bookshelfjs.org

(function() {

  // Initial Setup
  // -------------

  var Bookshelf = {};

  // Keep a reference to our own copy of Backbone, in case we want to use
  // this specific instance of Backbone elsewhere in the application.
  var Backbone = Bookshelf.Backbone = require('backbone');

  // Local dependency references.
  var _  = require('underscore');
  var Q  = require('q');
  var Knex = require('knex');
  var inflection = require('inflection');

  // Attach `Knex` & `Knex.Transaction` for convenience.
  Bookshelf.Knex = Knex;
  Bookshelf.Transaction = Knex.Transaction;

  // Keep in sync with package.json.
  Bookshelf.VERSION = '0.0.0';

  // We're using `Backbone.Events` rather than `EventEmitter`,
  // for API consistency and portability, but adding some
  // methods to make the API feel a bit more like Node's.
  var Events = Bookshelf.Events = Backbone.Events;
      Events.removeAllListeners = function(event) { this.off(event, null, null); };
      Events.emit = function() { this.trigger.apply(this, arguments); };

  // `Bookshelf` may be used as a top-level pub-sub bus.
  _.extend(Bookshelf, Events);

  // Shared functions which are mixed-in to the
  // `Model`, `Collection`, and `EagerRelation` prototypes.
  var Shared = {

    // If there are no arguments, return the current object's
    // query builder (or create a new one). If there are arguments,
    // call the query builder with the first argument, applying the
    // rest.
    query: function() {
      this._builder || (this._builder = Bookshelf.Knex(_.result(this, 'tableName')));
      var args = _.toArray(arguments);
      if (args.length === 0) return this._builder;
      this._builder[args[0]].apply(this._builder, args.slice(1));
      return this;
    },

    // Reset the query builder, called internally
    // after a query completes.
    resetQuery: function() {
      delete this._builder;
      return this;
    },

    // Eager loads relationships onto an already populated
    // `Model` or `Collection` instance.
    load: function(relations, options) {
      var target, data;
      if (!_.isArray(relations)) relations = relations ? [relations] : [];
      options = _.extend({}, options, {
        shallow: true,
        withRelated: relations
      });
      if (this instanceof Collection) {
        target = new this.model();
        data = this.toJSON(options);
      } else {
        target = this;
        data = [this.toJSON(options)];
      }
      var model = this;
      return new EagerRelation(this, target, data)
        .processRelated(options)
        .then(function() {
          return model;
        });
    },

    // Creates and returns a new `Bookshelf.Sync` instance.
    sync: function(model, options) {
      return new Bookshelf.Sync(model, options);
    },

    // Returns the related item
    related: function(item) {
      return this.relations[item];
    }
  };

  // Bookshelf.Model
  // -------------------

  // A Bookshelf Model represents an individual row in the database table --
  // It is a similar implementation to the `Backbone.Model`
  // constructor, except that defaults are not set until the
  // object is persisted, and the collection property is not used.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Bookshelf.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    this.relations = {};
    this._configure(options);
    if (options && options.parse) attrs = this.parse(attrs, options) || {};
    options.protect || (options.protect = false);
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // List of attributes attached directly from the constructor's options object.
  var modelProps = ['tableName', 'fillable', 'guarded', 'hasTimestamps'];

  // Extend `Bookshelf.Model.prototype` with all necessary methods and properties.
  _.extend(Model.prototype, Backbone.Model.prototype, Events, Shared, {

    // The database table associated with the model.
    tableName: null,

    // Array of attributes which can be set with
    // mass-assignment (whitelisting).
    fillable: null,

    // Array of attributes which cannot be set with
    // mass-assignment (blacklisting).
    guarded: null,

    // Indicates if the model should be timestamped.
    hasTimestamps: false,

    // Set "exists" to true to override the `idAttribute` check in `Model#isNew`
    exists: null,

    // Ensures the options sent to the model are properly attached.
    _configure: function(options) {
      if (this.options) options = _.extend({}, _.result(this, 'options'), options);
      _.extend(this, _.pick(options, modelProps));
    },

    // Sets an attribute on the `Model`. If the key is an object, 
    // check for any mass-assignment guards defined on the model
    // and filter as appropriate. If any filtered items are detected,
    // fire an event on the model and on the `Bookshelf` object.
    // Passes through to `set` on `Backbone.Model`.
    set: function(key, val, options) {
      if (key == null) return this;
      var attrs;
      
      if (typeof key === 'object') {
        attrs = key;
        options = (val || {});
        
        var fillable = this.fillable;
        var guarded  = this.guarded;
        
        if ((fillable || guarded) && options.guard !== false) {
          var sanitized = attrs;
          if (fillable) sanitized = _.pick(sanitized, fillable);
          if (guarded) sanitized = _.omit(sanitized, guarded);
          var filtered = _.omit(attrs, _.keys(sanitized));
          if (!_.isEmpty(filtered)) {
            this.trigger('inaccessible', this, filtered, options);
            Bookshelf.trigger('inaccessible', this, filtered, options);
          }
          attrs = sanitized;
        }
      } else {
        (attrs = {})[key] = val;
        options || (options = {});
      }

      // A validation skip is required to continue using the existing `Backbone#set`
      // method, as we want to chain here rather than returning a promise.
      options.validate = false;
      return Backbone.Model.prototype.set.call(this, attrs, options);
    },

    // The `hasOne` relation specifies that this table has exactly one of
    // another type of object, specified by a foreign key in the other table. The foreign key is assumed
    // to be the singular of this object's `tableName` with an `_id` suffix, but a custom `foreignKey`
    // attribute may also be specified.
    hasOne: function(Target, foreignKey) {
      return this._relatesTo(Target, {
        type: 'hasOne',
        foreignKey: foreignKey || inflection.singularize(_.result(this, 'tableName')) + '_id'
      });
    },

    // The `hasMany` relation specifies that this object has one or
    // more rows in another table which match on this object's primary key. The foreign key is assumed
    // to be the singular of this object's `tableName` with an `_id` suffix, but a custom `foreignKey`
    // attribute may also be specified.
    hasMany: function(Target, foreignKey) {
      return this._relatesTo(Target, {
        type: 'hasMany',
        foreignKey: foreignKey || inflection.singularize(_.result(this, 'tableName')) + '_id'
      });
    },

    // A reverse `hasOne` relation, the `belongsTo`, where the specified key in this table
    // matches the primary `idAttribute` of another table.
    belongsTo: function(Target, otherKey) {
      return this._relatesTo(Target, {
        type: 'belongsTo',
        foreignKey: Target.prototype.idAttribute,
        otherKey: otherKey || inflection.singularize(_.result(Target.prototype, 'tableName')) + '_id'
      });
    },

    // A `belongsToMany` relation is when there are many-to-many relation
    // between two models, with a joining table. The joinTableName may be replaced with another
    // object, will serve as the joining model.
    belongsToMany: function(Target, joinTableName, foreignKey, otherKey) {
      return this._relatesTo(Target, {
        type: 'belongsToMany',
        otherKey: otherKey     || inflection.singularize(_.result(this, 'tableName')) + '_id',
        foreignKey: foreignKey || inflection.singularize(_.result(Target.prototype, 'tableName')) + '_id',
        joinTableName: joinTableName || [
          _.result(this, 'tableName'), 
          _.result(Target.prototype, 'tableName')
        ].sort().join('_')
      });
    },

    // Fetch a model based on the currently set attributes,
    // returning a model to the callback, along with any options.
    // Returns a deferred promise through the Bookshelf.sync.
    fetch: function(options) {
      options = _.extend(options || {}, {guard: false});
      return this.sync(this, options).first();
    },

    // Sets and saves the hash of model attributes,
    // If the server returns an attributes hash that differs,
    // the model's state will be `set` again.
    save: function(key, val, options) {
      var id, attrs, success;
      
      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === "object") {
        attrs = key;
        options = val || {};
      } else {
        options || (options = {});
        (attrs = {})[key] = val;
      }

      // Don't allow setting an id attribute on save, unless the
      // `{existing: true}` flag is set on the options hash.
      if (attrs) id = attrs[this.idAttribute];
      if (id && id !== this.id && !options.existing) {
        Q.reject(new Error('The model cannot be saved with an idAttribute'));
      }

      // Handle the defaults at the `save` level rather than the
      // object creation level.
      var defaults = _.result(this, 'defaults');
      if (defaults) {
        attrs = _.extend({}, defaults, this.attributes);
      }

      options = _.extend({validate: true}, options);

      var model = this;

      return Q.fcall(_.bind(this._validate, this), attrs, options).then(function() {

        model.set(attrs);

        // If the model has timestamp columns,
        // set them as attributes on the model
        if (model.hasTimestamps) {
          model.timestamp(options);
        }

        var sync = model.sync(model, options);
        var method = options.method || (model.isNew(options) ? 'insert' : 'update');

        return sync[method]();

      }).then(function(resp) {

        // After a successful database save, the id is updated
        // if the model was created, otherwise the success function is called
        model.resetQuery();
        if (resp.insertId) model.set(model.idAttribute, resp.insertId);
        if (success) success(model, resp, options);
        model.trigger('fetched', model, resp, options);
        
        return model;
      });
    },

    // Destroy a model, calling a delete based on its `idAttribute`.
    destroy: function(options) {
      options || (options = {});
      var model = this;
      return this.sync(this, options).del().then(function() {
        model.trigger('destroy', model, model.collection, options);
        Bookshelf.trigger('destroy', model, model.collection, options);
      });
    },

    // Returns an object containing a shallow copy of the model attributes,
    // along with the `toJSON` value of any relations,
    // unless `{shallow: true}` is passed in the `options`.
    toJSON: function(options) {
      var attrs = _.extend({}, this.attributes);
      if (options && options.shallow) return attrs;
      var relations = this.relations;
      for (var key in relations) {
        attrs[key] = relations[key].toJSON();
      }
      return attrs;
    },

    // Sets the timestamps before saving the model.
    timestamp: function(options) {
      var d = new Date();
      this.set('updated_at', d);
      if (this.isNew(options)) {
        this.set('created_at', d);
      }
    },

    // Check the validity of a model.
    isValid: function(options) {
      return this._validate(null, _.extend({}, options, {validate: true}));
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      var model = new this.constructor(this.attributes);
      model.relations = _.map(this.relations, function (relation) {
        return relation.clone();
      });
      return model;
    },

    // Creates a new relation, from the current object to the
    // 'target' object (collection or model), passing a hash of
    // options which can include the `type` of relation.
    // The `hasOne` and `belongsTo` relations may only "target" a `Model`.
    _relatesTo: function(Target, options) {
      var target;
      var type = options.type;
      var multi = (type === 'hasMany' || type === 'belongsToMany');
      if (!multi) {
        if (!Target.prototype instanceof Model) {
          throw new Error('The `'+type+'` related object must be a Bookshelf.Model');
        }
      } else if (Target.prototype instanceof Model) {
        Target = Bookshelf.Collection.extend({model: Target});
      }

      // If we're handling an eager loaded related model,
      // we need to keep a reference to the original constructor,
      // to assemble the correct object once the eager matching is finished.
      // Otherwise, we need to grab the `foreignKey` value for building the query.
      if (this._isEager) {
        if (multi) {
          options.modelCtor = Target.prototype.model;
          options.collectionCtor = Target;
        } else {
          options.modelCtor = Target;
        }
      } else {
        if (type === 'belongsTo') {
          options.fkValue = this.get(options.otherKey);
        } else {
          options.fkValue = this.id;
        }
      }

      // Create a new instance of the `Model` or `Collection`, and set the
      // `_relation` options as a property on the instance.
      target = new Target();
      target._relation = options;

      // Extend the relation with relation-specific methods.
      if (type === 'belongsToMany') {
        _.extend(target, pivotHelpers);
      }
      
      return target;
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire a general
    // `"error"` event and call the error callback, if specified.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return Q.resolve(true);
      attrs = _.extend({}, this.attributes, attrs);
      var model = this;
      return Q.fcall(_.bind(this.validate, this), attrs, options)
        .then(function(resp) {
          if (resp && resp !== true) {
            model.validationError = resp;
            model.trigger('invalid', model, error, options);
            Bookshelf.trigger('invalid', model, error, options);
            return Q.reject(new Error(resp));
          }
          return Q.resolve(true);
      });
    }
  });

  // Bookshelf.Collection
  // -------------------

  // A Bookshelf Collection contains a number of database rows, represented by 
  // models, so they can be easily sorted, serialized, and manipulated.
  var Collection = Bookshelf.Collection = function(models, options) {
    if (options) _.extend(this, _.pick(options, collectionProps));
    var model = this.model;
    if (!_.isEqual(model, Model) && !(model.prototype instanceof Model)) {
      throw new Error('Only Bookshelf Model constructors are allowed as the Collection#model attribute.');
    }
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // List of attributes attached directly from the constructor's options object.
  var collectionProps = [
    'model', 'comparator', 'perPage', 'forPage'
  ];

  // Extend the Collection's prototype with the base methods
  _.extend(Collection.prototype, _.omit(Backbone.Collection.prototype, 'model'), Events, Shared, {

    model: Model,

    // Fetch the models for this collection, resetting the models for the query
    // when they arrive.
    fetch: function(options) {
      options = _.extend(options || {}, {guard: false});
      return this.sync(this, options).select();
    },

    // The `tableName` on the associated Model, used in relation building.
    tableName: function() {
      return _.result(this.model.prototype, 'tableName');
    },

    // The `idAttribute` on the associated Model, used in relation building.
    idAttribute: function() {
      return this.model.prototype.idAttribute;
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      return new this.model(attrs, options);
    }

  });

  // Bookshelf.EagerRelation
  // ---------------

  // Temporary helper object for handling the response of an `EagerRelation` load.
  var RelatedModels = function(models) {
    this.models = models;
    this.length = this.models.length;
  };
  _.extend(RelatedModels.prototype, _.pick(Collection.prototype, 'find', 'where', 'filter', 'findWhere'));

  // An `EagerRelation` object temporarily stores the models from an eager load,
  // and handles matching eager loaded objects with their parent(s).
  var EagerRelation = Bookshelf.EagerRelation = function(parent, target, parentResponse) {
    this.parent = parent;
    this.target = target;
    this.parentResponse = parentResponse;
  };

  _.extend(EagerRelation.prototype, Shared, {

    // Fetch the nested related items, and handle the responses.
    // Returns a deferred object, with the cumulative handling of
    // multiple (potentially nested) relations.
    fetch: function(options) {
      options = _.extend(options || {}, {guard: false});
      
      var current = this;
      var models  = this.models = [];
      var opts    = this._relation;

      Bookshelf.addEagerConstraints(opts.type, this, opts.parentResponse);
      
      return this.query().select(opts.columns).then(function(resp) {

        current.resetQuery();

        // Only find additional related items & process if
        // there is a response from the query.
        if (resp && resp.length > 0) {

          var filteredResp = skim(resp);

          // We can just push the models onto the collection, rather than resetting.
          for (var i = 0, l = filteredResp.length; i < l; i++) {
            models.push(new opts.modelCtor(filteredResp[i], {parse: true}));
          }

          if (options.withRelated) {
            var model = new opts.modelCtor();
            return new EagerRelation(current, model, resp).processRelated(options);
          }
        }

        return models;
      });
    },

    // This helper function is used internally to determine which relations
    // are necessary for fetching based on the `model.load` or `withRelated` option.
    processRelated: function(options) {
      var name, related, relation;
      var target = this.target;
      var handled = this.handled = {};
      var withRelated = options.withRelated;
      var subRelated = {};
      if (!_.isArray(withRelated)) withRelated = withRelated ? [withRelated] : [];

      // Eager load each of the `withRelated` relation item, splitting on '.'
      // which indicates a nested eager load.
      for (var i = 0, l = options.withRelated.length; i < l; i++) {
        related = options.withRelated[i].split('.');
        name = related[0];

        // Add additional eager items to an array, to load at the next level in the query.
        if (related.length > 1) {
          subRelated[name] || (subRelated[name] = []);
          subRelated[name].push(related.slice(1).join('.'));
        }

        // Only allow one of a certain nested type per-level.
        if (handled[name]) continue;
        
        // Internal flag to determine whether to set the ctor(s) on the _relation hash.
        target._isEager = true;
        relation = target[name]();
        target._isEager = null;

        // Set the parent's response, for purposes of setting query constraints.
        relation._relation.parentResponse = this.parentResponse;

        if (!relation) {
          throw new Error(name + ' is not defined on the model.');
        }

        handled[name] = relation;
      }

      // Fetch all eager loaded models.
      var pendingDeferred = [];
      var pendingNames = this.pendingNames = [];
      
      for (name in handled) {
        pendingNames.push(name);
        pendingDeferred.push(this.fetch.call(handled[name], {
          transacting: options.transacting,
          withRelated: subRelated[name]
        }));
      }

      // Return a deferred handler for all of the nested object sync
      // returning the original response when these syncs are complete.
      return Q.all(pendingDeferred).spread(_.bind(this.matchResponses, this));
    },

    // Handles the matching against an eager loaded relation.
    matchResponses: function() {
      var args = _.toArray(arguments);
      var parent  = this.parent;
      var handled = this.handled;
      
      // Pair each of the query responses with the parent models.
      for (var i = 0, l = args.length; i < l; i++) {
        
        // Get the current relation this response matches up with, based
        // on the pendingNames array.
        var name = this.pendingNames[i];
        var relation = handled[name];
        var type = relation._relation.type;
        var relatedModels = new RelatedModels(relation.models);

        // If the parent is a collection, we need to loop over each of the
        // models and attach the appropriate sub-models, since they are
        // fetched eagerly. We will re-use the same models for each association level.
        if (parent instanceof Collection) {
          var models = parent.models;
          
          // Attach the appropriate related items onto the parent model.
          for (var i2 = 0, l2 = models.length; i2 < l2; i2++) {
            var m = models[i2];
            var result = Bookshelf.eagerRelated(type, relation, relatedModels, m.id);
            m.relations[name] = result;
          }
        } else {
          // If this is a hasOne or belongsTo, we only choose a single item from
          // the relation.
          if (type === 'hasOne' || type === 'belongsTo') {
            parent.relations[name] = relation.models[0];
          } else {
            parent.relations[name] = new relation._relation.collectionCtor(relation.models);
          }
        }
      }

      return this.parentResponse;
    }
  });

  // Adds the basic relation constraints onto the query.
  Bookshelf.addConstraints = function(type, target) {
    if (type !== 'belongsToMany') {
      return constraints(target);
    } else {
      return belongsToMany(target);
    }
  };

  // Adds eager loading relationship constraints onto the query.
  Bookshelf.addEagerConstraints = function(type, target, resp) {
    if (type !== 'belongsToMany') {
      return constraints(target, resp);
    } else {
      return belongsToMany(target, resp);
    }
  };

  // Handles the "eager related" relationship matching.
  Bookshelf.eagerRelated = function(type, target, eager, id) {
    var relation = target._relation;
    var where = {};
    switch (type) {
      case "hasOne":
      case "belongsTo":
        where[relation.foreignKey] = id;
        return eager.findWhere(where);
      case "hasMany":
        where[relation.foreignKey] = id;
        return new relation.collectionCtor(eager.where(where), {parse: true});
      case "belongsToMany":
        where['_pivot_' + relation.otherKey] = id;
        return new relation.collectionCtor(eager.where(where), {parse: true});
    }
  };

  // Standard constraints for regular or eager loaded relations.
  var constraints = function(target, resp) {
    var relation = target._relation;
    if (resp) {
      target.query('whereIn', relation.foreignKey, _.pluck(resp, _.result(target, 'idAttribute')));
    } else {
      target.query('where', relation.foreignKey, '=', relation.fkValue);
    }
    return target;
  };

  // Helper function for adding the constraints needed on a eager load.
  var belongsToMany = function(target, resp) {
    var relation, columns, builder, idAttribute, tableName, 
    otherKey, foreignKey, pivotColumns, joinTableName;

    relation      = target._relation;
    columns       = relation.columns || (relation.columns = []);
    builder       = target.query();
    
    tableName     = _.result(target, 'tableName');
    idAttribute   = _.result(target, 'idAttribute');

    otherKey      = relation.otherKey;
    foreignKey    = relation.foreignKey;
    pivotColumns  = relation.pivotColumns;
    joinTableName = relation.joinTableName;

    if (builder.columns.length === 0 && columns.length === 0) {
      columns.push(tableName + '.*');
    }

    columns.push(
      joinTableName + '.' + otherKey + ' as ' + '_pivot_' + otherKey,
      joinTableName + '.' + foreignKey + ' as ' + '_pivot_' + foreignKey
    );
    
    if (pivotColumns) columns.push.apply(columns, pivotColumns);
    
    builder.join(joinTableName, tableName + '.' + idAttribute, '=', joinTableName + '.' + foreignKey);
    
    if (resp) {
      builder.whereIn(joinTableName + '.' + otherKey, _.pluck(resp, idAttribute));
    } else {
      builder.where(joinTableName + '.' + otherKey, '=', relation.fkValue);
    }
    return target;
  };

  // Set up inheritance for the model and collection.
  Model.extend = Collection.extend = Bookshelf.Backbone.Model.extend;

  // Bookshelf.Sync
  // -------------------

  // Sync is the dispatcher for any database queries,
  // taking the `model` or `collection` being queried, along with
  // a hash of options that are used in the various query methods.
  // If the `transacting` option is set, the query is assumed to be
  // part of a transaction, and this information is passed along to Knex.
  var Sync = Bookshelf.Sync = function(model, options) {
    options || (options = {});
    this.model = model;
    this.options = options;
    this.query = model.query();
    var relation = model._relation;
    if (relation && relation.fkValue) {
      Bookshelf.addConstraints(relation.type, model);
    }
    if (options.transacting) this.query.transacting(options.transacting);
  };

  _.extend(Sync.prototype, {

    // Select the first item from the database.
    first: function() {
      this.query.where(_.extend({}, this.model.attributes)).limit(1);
      return this.select();
    },

    // Runs a `select` query on the database, adding any necessary relational
    // constraints, resetting the query when complete. If there are results and
    // eager loaded relations, those are fetched and returned on the model before
    // the promise is resolved. Any `success` or `error` handlers passed in the
    // options will be called. An empty response will reject the deferred
    // with an `emptyResponse` message, and call/trigger the appropriate handlers.
    select: function() {
      var model = this.model;
      var options = this.options;
      var columns = options.columns;
      if (!_.isArray(columns)) columns = columns ? [columns] : ['*'];
      return this.query.select(columns).then(function(resp) {
        var target, filteredResp;
        model.resetQuery();
        
        if (resp && resp.length > 0) {
          filteredResp = skim(resp);

          // If this is a model fetch, then we set the parsed attributes
          // on the model, otherwise, we reset the collection.
          if (model instanceof Model) {
            model.set(model.parse(filteredResp[0], options), options);
          } else {
            model.reset(filteredResp, {silent: true, parse: true});
          }
          
          // If the `withRelated` property is specified on the options hash, we dive
          // into the `EagerRelation`. If the current querying object is a collection, 
          // we find the associated `model` to determine necessary eager relations.
          // Once the `EagerRelation` is complete, we return the original response from the query.
          if (options.withRelated) {
            target = (model instanceof Collection ? new model.model() : model);
            return new EagerRelation(model, target, filteredResp)
              .processRelated(options)
              .then(function() {
                return resp;
              });
          }
          
          return resp;
        }
        
        if (options.error) options.error(model, 'emptyResponse', options);
        model.trigger('error', model, 'emptyResponse', options);
        
        if (model instanceof Model) {
          model.clear();
          return {};
        } else {
          model.reset([], {silent: true});
          return [];
        }
        
      }).then(function(resp) {
        if (resp.length > 0) {
          if (options.success) options.success(model, resp, options);
          model.trigger('fetched', model, resp, options);
        }
        return model;
      });
    },

    // Issues an `insert` command on the query.
    insert: function() {
      return this.query.insert(this.model.toJSON({shallow: true}));
    },

    // Issues an `update` command on the query.
    update: function() {
      return this.query.where(this.model.idAttribute, this.model.id).update(this.model.toJSON({shallow: true}));
    },

    // Issues a `delete` command on the query.
    del: function() {
      var wheres;
      if (this.model.id != null) {
        wheres = {};
        wheres[this.model.idAttribute] = this.model.id;
      }
      if (!wheres && this.query.wheres.length === 0) {
        return Q.reject('A model cannot be destroyed without a "where" clause or an idAttribute.');
      }
      return this.query.where(wheres).del();
    }
  });

  // Helpers
  // -------------------

  // Specific to many-to-many relationships, these methods are mixed
  // into the `belongsToMany` relationships when they are created,
  // providing helpers for attaching and detaching related models.
  var pivotHelpers = {

    _handler: function(method, ids, transacting) {
      if (ids == void 0 && method === 'insert') return Q.resolve();
      if (!_.isArray(ids)) ids = ids ? [ids] : [];
      var pivot = this._relation;
      return Q.allResolved(_.map(ids, function(item) {
        var data = {};
        data[pivot.otherKey] = pivot.fkValue;

        // If the item is an object, it's either a model
        // that we're looking to attach to this model, or
        // a hash of attributes to set in the relation.
        if (_.isObject(item)) {
          if (item instanceof Model) {
            data[pivot.foreignKey] = item.id;
          } else {
            _.extend(data, item);
          }
        } else if (item) {
          data[pivot.foreignKey] = item;
        }
        var builder = Bookshelf.Knex(pivot.joinTableName);
        if (transacting) {
          builder.transacting(transacting);
        }
        if (method === 'delete') return builder.where(data).del();
        return builder.insert(data);
      }));
    },

    // Attach one or more "ids" from a foreign
    // table to the current. Creates & saves a new model
    // and attaches the model with a join table entry.
    attach: function(ids, options) {
      return this._handler('insert', ids, (options && options.transacting));
    },

    // Detach related object from their pivot tables.
    // If a model or id is passed, it attempts to remove the
    // pivot table based on that foreign key. If a hash is passed,
    // it attempts to remove the item based on a where clause with
    // these parameters. If no parameters are specified, we assume we will 
    // detach all related associations.
    detach: function(ids, options) {
      return this._handler('delete', ids, (options && options.transacting));
    },

    // Selects any additional columns on the pivot table,
    // taking a hash of columns which specifies the pivot
    // column name, and the value the column should take on the
    // output to the model attributes.
    withPivot: function(columns) {
      if (!_.isArray(columns)) columns = columns ? [columns] : [];
      var joinString, relation = this._relation;
      relation.pivotColumns || (relation.pivotColumns = []);
      for (var i = 0, l = columns.length; i < l; i++) {
        var column = columns[i];
        if (_.isString(column)) {
          relation.pivotColumns.push(relation.joinTableName + '.' + column + ' as pivot_' + column);
        } else {
          for (var key in column) {
            relation.pivotColumns.push(relation.joinTableName + '.' + key + ' as ' + column[key]);
          }
        }
      }
      return this;
    }
  };

  // Inherit standard Backbone.js Collections & Models from the client,
  // transforming a client `Backbone.Model` or `Backbone.Collection` to a
  // `Bookshelf` compatible object, to reuse validations, defaults, user methods, etc.
  Model.convert = Collection.convert = function(Target, protoProps, staticProps) {
    var parent = this;
 
    // Don't allow convert to work with an object instance.
    if (!Target.prototype) {
      throw new Error('Bookshelf.convert can only work with a constructor object');
    }

    // Traverse the prototype chain, breaking once we hit the prototype of the
    // Model or Collection we're converting. This way we can put the prototype chain
    // back together starting from the base "extend" so inheritance works properly.
    var current = Target;
    var depth   = [];
    var passed = false;

    while (passed !== true) {
      if (_.isEqual(current.prototype, Backbone.Model.prototype) || _.isEqual(current.prototype, Backbone.Collection.prototype)) {
        passed = true;
      } else if (!current.__super__) {
        throw new Error("Only Backbone objects may be converted.");
      } else {
        depth.push(_.pick(current.prototype, _.keys(current.prototype)));
        current = current.__super__.constructor;
      }
    }

    // Setup the prototype chain.
    var currentObj = this;
    for (var i = depth.length; i > 0; i--) {
      currentObj = currentObj.extend(depth[i-1]);
    }
    
    return currentObj.extend(protoProps, staticProps);
  };

  // Filters an array of objects, cleaning out any nested properties.
  var skim = function(data) {
    return _.map(data, function(obj) {
      return _.pick(obj, _.keys(obj));
    });
  };

  // Bookshelf.Initialize
  // -------------------

  // Configure the `Bookshelf` settings (database adapter, etc.) once,
  // so it is ready on first model initialization.
  Bookshelf.Initialize = function(options) {
    return Knex.Initialize(options);
  };

  module.exports = Bookshelf;

}).call(this);