//     Bookshelf.js 0.3.0

//     (c) 2013 Tim Griesser
//     Bookshelf may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://bookshelfjs.org
(function(define) { "use strict";

define(function(require, exports, module) {

  // Initial Setup
  // -------------
  var Backbone   = require('./lib/ext/backbone').Backbone;
  var _          = require('./lib/ext/underscore')._;
  var Knex       = require('./lib/ext/knex').Knex;

  var Events     = require('./lib/events').Events;
  var Model      = require('./lib/model').Model;
  var Collection = require('./lib/collection').Collection;
  var Eager      = require('./lib/eager').Eager;

  // Constructor for a new `Bookshelf` object, it accepts
  // an active `knex` instance and initializes the appropriate `Model`,
  // `Collection`, and `Eager` constructors for use in the current object.
  var Bookshelf = function(knex) {

    if (!(this instanceof Bookshelf)) {
      return new Bookshelf(knex);
    }

    // If the knex isn't a `Knex` instance, we'll assume it's
    // a compatible config object and pass it through to create a new instance.
    // if (!(knex instanceof Knex)) {
    //   knex = new Knex(knex);
    // }

    this.Model = Model.extend({
      builder: function(tableName) {
        return knex(tableName);
      }
    });

    this.Collection = Collection.extend({
      model: this.Model,
      builder: function(tableName) {
        return knex(tableName);
      }
    });

    this.Eager = Eager.extend({
      builder: function(tableName) {
        return knex(tableName);
      }
    });

    this.knex = knex;
  };

  // `Bookshelf` may be used as a top-level pub-sub bus.
  _.extend(Bookshelf.prototype, Events, {

    // Keep in sync with `package.json`.
    VERSION: '0.5.0',

    // Wrap a series of Bookshelf actions in a `knex` transaction block;
    Transaction: function() {
      return this.knex.transaction.apply(this, arguments);
    }

  });

  // Set up inheritance for the model and collection.
  Model.extend = Collection.extend = Eager.extend = Backbone.Model.extend;

  // The `forge` function properly instantiates a new Model or Collection
  // without needing the `new` operator... to make object creation cleaner
  // and more chainable.
  Model.forge = Collection.forge = function() {
    var inst = Object.create(this.prototype);
    var obj = this.apply(inst, arguments);
    return (Object(obj) === obj ? obj : inst);
  };

  module.exports = Bookshelf;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);