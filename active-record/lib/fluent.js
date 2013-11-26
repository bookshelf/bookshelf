// Fluent Interface
// ---------------
(function(define) {

"use strict";

define(function(require, exports) {

  function Fluent(base, method, args) {
    this.base   = base;
    this.method = method;
    this.args   = args;
  }

  var FluentInterface = {};

  var fluentMethods = [
    'all', 'first', 'last', 'related', 'findBySql',
    'where', 'whereRaw', 'find', 'findBy', 'findEach',
    'findInBatches', 'take', 'createWith', 'findOrCreateBy',
    'findOrInitializeBy', 'update', 'updateAll'
  ];

  _.each(fluentMethods, function(item) {
    FluentInterface[item] =
    Fluent.prototype[item] = function() {
      return pushMethod(this, item, slicedArgs.apply(null, arguments));
    };
  });

  // Creates a new link in the active record chain.
  Fluent.prototype.link = function(method, args) {
    return new Fluent(this.base.concat(this), method, args);
  };

  // The meat of this entire chaining interface. Coerces the
  // current object into a promise chain, then-ing as appropriate.
  Fluent.prototype.then = Promise.method(function() {
    var base = this.base;

  });

  var FluentMethods = {

    // Creates a new collection from the model,
    // and fetches all of the attributes.
    all: Promise.method(function() {
      var collection = new Collection({model: this});
      return collection.fetch(options);
    }),

    // Model.first finds the first record ordered by the primary key.
    first: Promise.method(function() {
      return this.query('orderBy', this.idAttribute, 'asc').fetch(options);
    }),

    // Model.last finds the last record ordered by the primary key.
    last: Promise.method(function() {
      return this.query('orderBy', this.idAttribute, 'desc').fetch(options);
    }),

    // findBySql provides you with a simple way of making custom calls to the
    // database and retrieving instantiated objects.
    findBySql: Promise.method(function(sql, bindings, options) {
      var model = new this();
      var collection = new Collection([], {model: model});
      return collection.query('whereRaw', sql, bindings).fetch(options);
    }),

    // Add a "where" clause to the model.
    where: Promise.method(function() {
      var query = this.query();
      query.where.apply(query, arguments);
      return this;
    }),

    // Adds a raw `where` clause to the model.
    whereRaw: Promise.method(function() {
      var query = this.query();
      query.whereRaw.apply(query, arguments);
      return this;
    }),

    // Find one, by the primary key.
    find: Promise.method(function(id, options) {
      if (_.isArray(id)) {
        var collection = new Collection([], {model: this});
        return collection.query('whereIn', model.idAttribute, id).fetch(options).tap(function(collection) {
          if (collection.length !== id.length) throw new FluentError.RecordNotFound(collection);
        });
      }
      return this.set(this.idAttribute, id).fetch(_.extend(options, {require: true}));
    }),

    // Find, with conditions... for example:
    // `user.findBy({'first_name': 'Tim'})`
    findBy: Promise.method(function(options) {
      return this.fetch(options);
    }),

    // Find each of the items, with an iterator.
    findEach: Promise.method(function(iterator, options) {
      var model = new this();
    }),

    // Finds a bunch of items, in batches.
    findInBatches: Promise.method(function(iterator, options) {
      var model = new this();
    }),

    // Model.take retrieves a record without any implicit ordering.
    take: Promise.method(function(options) {
      return this.fetch(options);
    }),

    // Create a new object, specifying what attributes it should be created with.
    createWith: Promise.method(function(attrs) {
      return this.set(attrs);
    }),

    // The `findOrCreateBy` method checks whether a record with the attributes exists.
    // If it doesn't, then `create` is called.
    findOrCreateBy: Promise.method(function(attrs, options) {
      var model = this;
      options = options || {};
      options.require = true;
      this.set(attrs).fetch(options).otherwise(function() {
        return model.create(attrs, options);
      });
    }),

    // Works just like `findOrCreateBy` but it will call new instead of create.
    findOrInitializeBy: Promise.method(function() {
      var model = this;
      options = options || {};
      this.set(attrs).fetch(options).otherwise(function() {
        return model;
      });
    }),

    // `ids` can be used to pluck all the IDs for the relation
    // using the table's primary key.
    ids: Promise.method(function(options) {

      // For consistency, we need to assume a transaction may be
      // passed to every query.
      if (options.transacting) {
        this.query('transacting', options.transacting);
      }

      return this.query().select(this.idAttribute).then(function(results) {
        return _.pluck(results, this.idAttribute);
      });
    }),

    // Convenience for creating a new transaction,
    // this doesn't actually do anything with the
    // object specifically.
    transaction: Promise.method(function(container) {
      return bookshelf.transaction(container);
    }),

    // Specify which items to eager-load.
    includes: Promise.method(function() {
      this._includes = this._includes || [];

      return this;
    }),

    // Specify which items are being joined on the model.
    joins: Promise.method(function() {
      this._joins = this._joins || [];

      return this;
    }),

    explain: Promise.method(function() {

    })

  };

  // Adds a method to the stack.
  function pushMethod(ctx, method, args) {
    if (ctx instanceof Fluent) {
      return ctx.link(method, args);
    }
    return new Fluent(ctx, method, args);
  }

  // Efficiently capture the arguments for each of the finder methods.
  var slicedArgs = function() {
    var args = {};
    for (var i = 0, l = arguments.length; i < l; i++) {
      args[i] = arguments[i];
    }
    return args;
  };

  exports.FluentInterface = FluentInterface;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);