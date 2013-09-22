// Finder Interface
// ---------------
(function(define) {

"use strict";

define(function(require, exports) {

  var FinderInterface = {

    // Creates a new collection from the model,
    // and fetches all of the attributes.
    all: function(options) {
      var collection = new Collection({model: this});
      return collection.fetch(options);
    },

    // Model.first finds the first record ordered by the primary key.
    first: function(options) {
      return this.query('orderBy', this.idAttribute, 'asc').fetch(options);
    },

    // Model.last finds the last record ordered by the primary key.
    last: function(options) {
      return this.query('orderBy', this.idAttribute, 'desc').fetch(options);
    },

    // findBySql provides you with a simple way of making custom calls to the
    // database and retrieving instantiated objects.
    findBySql: function(sql, bindings, options) {
      var model = new this();
      var collection = new Collection([], {model: model});
      return collection.query('whereRaw', sql, bindings).fetch(options);
    },

    // Add a "where" clause to the model.
    where: function() {
      var query = this.query();
      query.where.apply(query, arguments);
      return this;
    },

    // Adds a raw `where` clause to the model.
    whereRaw: function() {
      var query = this.query();
      query.whereRaw.apply(query, arguments);
      return this;
    },

    // Find one, by the primary key.
    find: function(id, options) {
      if (_.isArray(id)) {
        var collection = new Collection([], {model: this});
        return collection.query('whereIn', model.idAttribute, id).fetch(options).tap(function(collection) {
          if (collection.length !== id.length) throw new ActiveError.RecordNotFound(collection);
        });
      }
      return this.set(this.idAttribute, id).fetch(_.extend(options, {require: true}));
    },

    // Find, with conditions... for example:
    // `user.findBy({'first_name': 'Tim'})`
    findBy: function(options) {
      return this.fetch(options);
    },

    // Find each of the items, with an iterator.
    findEach: function(iterator, options) {
      var model = new this();

    },

    // Finds a bunch of items, in batches.
    findInBatches: function(iterator, options) {
      var model = new this();

    },

    // Model.take retrieves a record without any implicit ordering.
    take: function(options) {
      return this.fetch(options);
    }

  };

  exports.FinderInterface = FinderInterface;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);