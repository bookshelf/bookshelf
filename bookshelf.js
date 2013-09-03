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
  var Bookshelf = exports;
  var knex      = require('knex');
  var _         = require('underscore');
  var Events    = require('./dialects/base/events').Events;

  var SqlModel      = require('./dialects/sql/model').Model;
  var SqlCollection = require('./dialects/sql/collection').Collection;
  var SqlRelation   = require('./dialects/sql/relation').Relation;

  // Keep in sync with `package.json`.
  Bookshelf.VERSION = '0.3.1';

  // We're using a modified `Backbone.Events` rather than `EventEmitter`,
  // for consistency and portability.
  // `Bookshelf` may be used as a top-level pub-sub bus.
  _.extend(Bookshelf, Events);

  // The `forge` function properly instantiates a new Model or Collection
  // without needing the `new` operator... to make object creation cleaner
  // and more chainable.
  SqlModel.forge = SqlCollection.forge = function() {
    var inst = Object.create(this.prototype);
    var obj = this.apply(inst, arguments);
    return (Object(obj) === obj ? obj : inst);
  };

  // Bookshelf.Model
  // -------------------

  // A Bookshelf Model represents an individual row in the database table --
  // It has a similar implementation to the `Backbone.Model`
  // constructor, except that defaults are not set until the
  // object is persisted, and the collection property is not used.
  var Model = Bookshelf.Model = SqlModel.extend({

    relation: function(type, Target, options) {
      return new Relation(type, Target, options);
    },

    // Returns a `knex` instance with the specified table name.
    builder: function(table) {
      return knex(table);
    }

  });

  // Bookshelf.Collection
  // -------------------

  // A Bookshelf Collection contains a number of database rows, represented by
  // models, so they can be easily sorted, serialized, and manipulated.
  var Collection = Bookshelf.Collection = SqlCollection.extend({

    model: Model,

    // Returns a `knex` instance with the specified table name.
    builder: function(table) {
      return knex(table);
    }

  });

  // Used internally, the `Relation` helps in simplifying the relationship building,
  // centralizing all logic dealing with type & option handling.
  var Relation = Bookshelf.Relation = SqlRelation.extend({

    Model: Model,

    Collection: Collection

  });

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

      Target.Model = SqlModel.extend({
        builder: function(table) {
          return Builder(table);
        },
        relation: function(type, Target, options) {
          return new Relation(type, Target, options);
        }
      });

      Target.Collection = SqlCollection.extend({
        model: Target.Model,
        builder: function(table) {
          return Builder(table);
        }
      });

      var Relation = Target.Relation = SqlRelation.extend({
        Model: Target.Model,
        Collection: Target.Collection
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