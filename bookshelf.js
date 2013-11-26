// Bookshelf.js 0.6.1
// ---------------

//     (c) 2013 Tim Griesser
//     Bookshelf may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://bookshelfjs.org
(function(define) {

"use strict";

define(function(require, exports, module) {

  // All external libraries needed in this scope.
  var _          = require('lodash');
  var Knex       = require('knex');

  // All local dependencies... These are the main objects that
  // need to be augmented in the constructor to work properly.
  var SqlModel      = require('./dialects/sql/model').Model;
  var SqlCollection = require('./dialects/sql/collection').Collection;
  var SqlRelation   = require('./dialects/sql/relation').Relation;

  // Finally, the `Events`, which we've supplemented with a `triggerThen`
  // method to allow for asynchronous event handling via promises. We also
  // mix this into the prototypes of the main objects in the library.
  var Events        = require('./dialects/base/events').Events;

  // Constructor for a new `Bookshelf` object, it accepts
  // an active `knex` instance and initializes the appropriate
  // `Model` and `Collection` constructors for use in the current instance.
  var Bookshelf = function(knex) {

    // Allows you to construct the library with either `Bookshelf(opts)`
    // or `new Bookshelf(opts)`.
    if (!(this instanceof Bookshelf)) {
      return new Bookshelf(knex);
    }

    // If the knex isn't a `Knex` instance, we'll assume it's
    // a compatible config object and pass it through to create a new instance.
    if (!knex.client || !(knex.client instanceof Knex.ClientBase)) {
      knex = new Knex(knex);
    }

    // The `Model` constructor is referenced as a property on the `Bookshelf` instance,
    // mixing in the correct `builder` method, as well as the `relation` method,
    // passing in the correct `Model` & `Collection` constructors for later reference.
    var ModelCtor = this.Model = SqlModel.extend({
      _builder: function(tableName) {
        return knex(tableName);
      },
      _relation: function(type, Target, options) {
        return new Relation(type, Target, options);
      }
    });

    // The collection also references the correct `Model`, specified above, for creating
    // new `Model` instances in the collection. We also extend with the correct builder /
    // `knex` combo.
    var CollectionCtor = this.Collection = SqlCollection.extend({
      model: ModelCtor,
      _builder: function(tableName) {
        return knex(tableName);
      }
    });

    // Used internally, the `Relation` helps in simplifying the relationship building,
    // centralizing all logic dealing with type & option handling.
    var Relation = Bookshelf.Relation = SqlRelation.extend({
      Model: ModelCtor,
      Collection: CollectionCtor
    });

    // Grab a reference to the `knex` instance passed (or created) in this constructor,
    // for convenience.
    this.knex = knex;
  };

  // A `Bookshelf` instance may be used as a top-level pub-sub bus, as it mixes in the
  // `Events` object. It also contains the version number, and a `Transaction` method
  // referencing the correct version of `knex` passed into the object.
  _.extend(Bookshelf.prototype, Events, {

    // Keep in sync with `package.json`.
    VERSION: '0.6.1',

    // Helper method to wrap a series of Bookshelf actions in a `knex` transaction block;
    transaction: function() {
      return this.knex.transaction.apply(this, arguments);
    },

    // Provides a nice, tested, standardized way of adding plugins to a `Bookshelf` instance,
    // injecting the current instance into the plugin, which should be a module.exports.
    plugin: function(plugin) {
      plugin(this);
      return this;
    }

  });

  // Alias to `new Bookshelf(opts)`.
  Bookshelf.initialize = function(knex) {
    return new this(knex);
  };

  // The `forge` function properly instantiates a new Model or Collection
  // without needing the `new` operator... to make object creation cleaner
  // and more chainable.
  SqlModel.forge = SqlCollection.forge = function() {
    var inst = Object.create(this.prototype);
    var obj = this.apply(inst, arguments);
    return (Object(obj) === obj ? obj : inst);
  };

  // Finally, export `Bookshelf` to the world.
  module.exports = Bookshelf;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);