'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

// We've supplemented `Events` with a `triggerThen`
// method to allow for asynchronous event handling via promises. We also
// mix this into the prototypes of the main objects in the library.

var _baseEvents = require('./base/events');

var _baseEvents2 = _interopRequireDefault(_baseEvents);

// All core modules required for the bookshelf instance.

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _collection = require('./collection');

var _collection2 = _interopRequireDefault(_collection);

var _relation2 = require('./relation');

var _relation3 = _interopRequireDefault(_relation2);

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

function Bookshelf(knex) {
  var bookshelf = {
    VERSION: '0.8.1'
  };

  var range = '>=0.6.10 <0.9.0';
  if (!_semver2['default'].satisfies(knex.VERSION, range)) {
    throw new Error('The knex version is ' + knex.VERSION + ' which does not satisfy the Bookshelf\'s requirement ' + range);
  }

  var Model = bookshelf.Model = _model2['default'].extend({

    _builder: builderFn,

    // The `Model` constructor is referenced as a property on the `Bookshelf` instance,
    // mixing in the correct `builder` method, as well as the `relation` method,
    // passing in the correct `Model` & `Collection` constructors for later reference.
    _relation: function _relation(type, Target, options) {
      if (type !== 'morphTo' && !_lodash2['default'].isFunction(Target)) {
        throw new Error('A valid target model must be defined for the ' + _lodash2['default'].result(this, 'tableName') + ' ' + type + ' relation');
      }
      return new Relation(type, Target, options);
    }

  }, {

    forge: forge,

    collection: function collection(rows, options) {
      return new bookshelf.Collection(rows || [], _lodash2['default'].extend({}, options, { model: this }));
    },

    count: function count(column, options) {
      return this.forge().count(column, options);
    },

    fetchAll: function fetchAll(options) {
      return this.forge().fetchAll(options);
    }
  });

  var Collection = bookshelf.Collection = _collection2['default'].extend({

    _builder: builderFn

  }, {

    forge: forge

  });

  // The collection also references the correct `Model`, specified above, for creating
  // new `Model` instances in the collection.
  Collection.prototype.model = Model;
  Model.prototype.Collection = Collection;

  var Relation = _relation3['default'].extend({
    Model: Model, Collection: Collection
  });

  // A `Bookshelf` instance may be used as a top-level pub-sub bus, as it mixes in the
  // `Events` object. It also contains the version number, and a `Transaction` method
  // referencing the correct version of `knex` passed into the object.
  _lodash2['default'].extend(bookshelf, _baseEvents2['default'], _errors2['default'], {

    // Helper method to wrap a series of Bookshelf actions in a `knex` transaction block;
    transaction: function transaction() {
      return this.knex.transaction.apply(this, arguments);
    },

    // Provides a nice, tested, standardized way of adding plugins to a `Bookshelf` instance,
    // injecting the current instance into the plugin, which should be a module.exports.
    plugin: function plugin(_plugin, options) {
      var _this = this;

      if (_lodash2['default'].isString(_plugin)) {
        try {
          require('../plugins/' + _plugin)(this, options);
        } catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
          }
          if (!process.browser) {
            require(_plugin)(this, options);
          }
        }
      } else if (_lodash2['default'].isArray(_plugin)) {
        _lodash2['default'].each(_plugin, function (p) {
          _this.plugin(p, options);
        });
      } else {
        _plugin(this, options);
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
    return Object(obj) === obj ? obj : inst;
  }

  function builderFn(tableName) {
    var _this2 = this;

    var builder = tableName ? knex(tableName) : knex.queryBuilder();

    return builder.on('query', function (data) {
      return _this2.trigger('query', data);
    });
  }

  // Attach `where`, `query`, and `fetchAll` as static methods.
  ['where', 'query'].forEach(function (method) {
    Model[method] = Collection[method] = function () {
      var model = this.forge();
      return model[method].apply(model, arguments);
    };
  });

  return bookshelf;
}

// Constructor for a new `Bookshelf` object, it accepts
// an active `knex` instance and initializes the appropriate
// `Model` and `Collection` constructors for use in the current instance.
Bookshelf.initialize = function (knex) {
  _helpers2['default'].warn('Bookshelf.initialize is deprecated, pass knex directly: require(\'bookshelf\')(knex)');
  return new Bookshelf(knex);
};

// Finally, export `Bookshelf` to the world.
exports['default'] = Bookshelf;
module.exports = exports['default'];