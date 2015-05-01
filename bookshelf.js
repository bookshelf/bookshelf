// Bookshelf.js 0.8.0
// ---------------

//     (c) 2014 Tim Griesser
//     Bookshelf may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://bookshelfjs.org
var _          = require('lodash');
var inherits   = require('inherits');
var semver     = require('semver');
var helpers    = require('./lib/helpers')

// We've supplemented `Events` with a `triggerThen`
// method to allow for asynchronous event handling via promises. We also
// mix this into the prototypes of the main objects in the library.
var Events = require('./lib/base/events');

// All core modules required for the bookshelf instance.
var BookshelfModel      = require('./lib/model');
var BookshelfCollection = require('./lib/collection');
var BookshelfRelation   = require('./lib/relation');
var Errors              = require('./lib/errors');

function Bookshelf(knex) {
  var bookshelf  = {
    VERSION: '0.8.0'
  };

  var range = '>=0.6.10 <0.9.0';
  if (!semver.satisfies(knex.VERSION, range)) {
    throw new Error('The knex version is ' + knex.VERSION + ' which does not satisfy the Bookshelf\'s requirement ' + range);
  }

  var Model = bookshelf.Model = BookshelfModel.extend({
    
    _builder: builderFn,

    // The `Model` constructor is referenced as a property on the `Bookshelf` instance,
    // mixing in the correct `builder` method, as well as the `relation` method,
    // passing in the correct `Model` & `Collection` constructors for later reference.
    _relation: function(type, Target, options) {
      if (type !== 'morphTo' && !_.isFunction(Target)) {
        throw new Error('A valid target model must be defined for the ' +
          _.result(this, 'tableName') + ' ' + type + ' relation');
      }
      return new Relation(type, Target, options);
    }

  }, {

    forge: forge,

    collection: function(rows, options) {
      return new Collection((rows || []), _.extend({}, options, {model: this}));
    },

    fetchAll: function(options) {
      return this.forge().fetchAll(options); 
    }
  })

  var Collection = bookshelf.Collection = BookshelfCollection.extend({
    
    _builder: builderFn
  
  }, {
  
    forge: forge
  
  });

  // The collection also references the correct `Model`, specified above, for creating
  // new `Model` instances in the collection.
  Collection.prototype.model = Model;
  Model.prototype.Collection = Collection;

  var Relation = BookshelfRelation.extend({
    Model: Model,
    Collection: Collection
  })

  // A `Bookshelf` instance may be used as a top-level pub-sub bus, as it mixes in the
  // `Events` object. It also contains the version number, and a `Transaction` method
  // referencing the correct version of `knex` passed into the object.
  _.extend(bookshelf, Events, Errors, {

    // Helper method to wrap a series of Bookshelf actions in a `knex` transaction block;
    transaction: function() {
      return this.knex.transaction.apply(this, arguments);
    },

    // Provides a nice, tested, standardized way of adding plugins to a `Bookshelf` instance,
    // injecting the current instance into the plugin, which should be a module.exports.
    plugin: function(plugin, options) {
      if (_.isString(plugin)) {
        try {
          require('./plugins/' + plugin)(this, options);
        } catch (e) {
          if (!process.browser) {
            require(plugin)(this, options)  
          }
        }
      } else if (_.isArray(plugin)) {
        _.each(plugin, function (plugin) {
          this.plugin(plugin, options);
        }, this);
      } else {
        plugin(this, options);
      }
      return this;
    }

  });

  // Grab a reference to the `knex` instance passed (or created) in this constructor,
  // for convenience.
  bookshelf.knex = knex;

  // The `forge` function properly instantiates a new Model or Collection
  // without needing the `new` operator... to make object creation cleaner
  // and more chainable.
  function forge() {
    var inst = Object.create(this.prototype);
    var obj = this.apply(inst, arguments);
    return (Object(obj) === obj ? obj : inst);
  }

  function builderFn(tableName) {
    var builder  = knex(tableName);
    var instance = this;
    return builder.on('query', function(data) {
      instance.trigger('query', data);
    });
  }

  // Attach `where`, `query`, and `fetchAll` as static methods.
  ['where', 'query'].forEach(function(method) {
    Model[method] =
    Collection[method] = function() {
      var model = this.forge();
      return model[method].apply(model, arguments);
    };
  });
  
  return bookshelf;
}

// Constructor for a new `Bookshelf` object, it accepts
// an active `knex` instance and initializes the appropriate
// `Model` and `Collection` constructors for use in the current instance.
Bookshelf.initialize = function(knex) {
  helpers.warn("Bookshelf.initialize is deprecated, pass knex directly: require('bookshelf')(knex)")
  return new Bookshelf(knex)
};

// Finally, export `Bookshelf` to the world.
module.exports = Bookshelf;
