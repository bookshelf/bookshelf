'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _promise = require('./base/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Sync is the dispatcher for any database queries,
// taking the "syncing" `model` or `collection` being queried, along with
// a hash of options that are used in the various query methods.
// If the `transacting` option is set, the query is assumed to be
// part of a transaction, and this information is passed along to `Knex`.
// Sync
// ---------------
var Sync = function Sync(syncing, options) {
  options = options || {};
  this.query = syncing.query();
  this.syncing = syncing.resetQuery();
  this.options = options;
  if (options.debug) this.query.debug();
  if (options.transacting) this.query.transacting(options.transacting);
};

_lodash2.default.extend(Sync.prototype, {

  // Prefix all keys of the passed in object with the
  // current table name
  prefixFields: function prefixFields(fields) {
    var tableName = this.syncing.tableName;
    var prefixed = {};
    for (var key in fields) {
      prefixed[tableName + '.' + key] = fields[key];
    }
    return prefixed;
  },

  // Select the first item from the database - only used by models.
  first: _promise2.default.method(function (attributes) {

    var model = this.syncing;
    var query = this.query;

    // We'll never use an JSON object for a search, because even
    // PostgreSQL, which has JSON type columns, does not support the `=`
    // operator.
    //
    // NOTE: `_.omit` returns an empty object, even if attributes are null.
    var whereAttributes = _lodash2.default.omit(attributes, _lodash2.default.isPlainObject);

    if (!_lodash2.default.isEmpty(whereAttributes)) {

      // Format and prefix attributes.
      var formatted = this.prefixFields(model.format(whereAttributes));
      query.where(formatted);
    }

    // Limit to a single result.
    query.limit(1);

    return this.select();
  }),

  // Runs a `count` query on the database, adding any necessary relational
  // constraints. Returns a promise that resolves to an integer count.
  count: _promise2.default.method(function (column) {
    var knex = this.query,
        options = this.options,
        relatedData = this.syncing.relatedData,
        fks = {};

    return _promise2.default.bind(this).then(function () {
      // Inject all appropriate select costraints dealing with the relation
      // into the `knex` query builder for the current instance.
      if (relatedData) return _promise2.default.try(function () {
        if (relatedData.isThrough()) {
          fks[relatedData.key('foreignKey')] = relatedData.parentFk;
          var through = new relatedData.throughTarget(fks);
          relatedData.pivotColumns = through.parse(relatedData.pivotColumns);
        } else if (relatedData.type === 'hasMany') {
          var fk = relatedData.key('foreignKey');
          knex.where(fk, relatedData.parentFk);
        }
      });
    }).then(function () {
      return this.syncing.triggerThen('counting', this.syncing, options);
    }).then(function () {
      return knex.count((column || '*') + ' as count');
    }).then(function (rows) {
      return rows[0].count;
    });
  }),

  // Runs a `select` query on the database, adding any necessary relational
  // constraints, resetting the query when complete. If there are results and
  // eager loaded relations, those are fetched and returned on the model before
  // the promise is resolved. Any `success` handler passed in the
  // options will be called - used by both models & collections.
  select: _promise2.default.method(function () {
    var _this = this;

    var knex = this.query;
    var options = this.options;
    var relatedData = this.syncing.relatedData;
    var fks = {};
    var columns = null;

    // Check if any `select` style statements have been called with column
    // specifications. This could include `distinct()` with no arguments, which
    // does not affect inform the columns returned.
    var queryContainsColumns = (0, _lodash2.default)(knex._statements).where({ grouping: 'columns' }).some('value.length');

    return _promise2.default.bind(this).then(function () {
      // Set the query builder on the options, in-case we need to
      // access in the `fetching` event handlers.
      options.query = knex;

      // Inject all appropriate select costraints dealing with the relation
      // into the `knex` query builder for the current instance.
      if (relatedData) return _promise2.default.try(function () {
        if (relatedData.isThrough()) {
          var _ret = (function () {
            fks[relatedData.key('foreignKey')] = relatedData.parentFk;
            var through = new relatedData.throughTarget(fks);

            return {
              v: through.triggerThen('fetching', through, relatedData.pivotColumns, options).then(function () {
                relatedData.pivotColumns = through.parse(relatedData.pivotColumns);
              })
            };
          })();

          if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
        }
      });
    }).tap(function () {

      // If this is a relation, apply the appropriate constraints.
      if (relatedData) {
        relatedData.selectConstraints(knex, options);
      } else {

        // Call the function, if one exists, to constrain the eager loaded query.
        if (options._beforeFn) options._beforeFn.call(knex, knex);

        if (options.columns) {

          // Normalize single column name into array.
          columns = _lodash2.default.isArray(options.columns) ? options.columns : [options.columns];
        } else if (!queryContainsColumns) {

          // If columns have already been selected via the `query` method
          // we will use them. Otherwise, select all columns in this table.
          columns = [_lodash2.default.result(_this.syncing, 'tableName') + '.*'];
        }
      }

      // Set the query builder on the options, for access in the `fetching`
      // event handlers.
      options.query = knex;

      /**
       * Fired before a `fetch` operation. A promise may be returned from the
       * event handler for async behaviour.
       *
       * @event Model#fetching
       * @param {Model} model
       *   The model which is about to be fetched.
       * @param {string[]} columns
       *   The columns to be retrieved by the query.
       * @param {Object} options
       *   Options object passed to {@link Model#fetch fetch}.
       * @param {QueryBuilder} options.query
       *   Query builder to be used for fetching. This can be modified to
       *   change the query before it is executed.
       *
       * @returns {Promise}
       */
      return _this.syncing.triggerThen('fetching', _this.syncing, columns, options);
    }).then(function () {
      return knex.select(columns);
    });
  }),

  // Issues an `insert` command on the query - only used by models.
  insert: _promise2.default.method(function () {
    var syncing = this.syncing;
    return this.query.insert(syncing.format(_lodash2.default.extend(Object.create(null), syncing.attributes)), syncing.idAttribute);
  }),

  // Issues an `update` command on the query - only used by models.
  update: _promise2.default.method(function (attrs) {
    var syncing = this.syncing,
        query = this.query;
    if (syncing.id != null) query.where(syncing.idAttribute, syncing.id);
    if (_lodash2.default.where(query._statements, { grouping: 'where' }).length === 0) {
      throw new Error('A model cannot be updated without a "where" clause or an idAttribute.');
    }
    return query.update(syncing.format(_lodash2.default.extend(Object.create(null), attrs)));
  }),

  // Issues a `delete` command on the query.
  del: _promise2.default.method(function () {
    var query = this.query,
        syncing = this.syncing;
    if (syncing.id != null) query.where(syncing.idAttribute, syncing.id);
    if (_lodash2.default.where(query._statements, { grouping: 'where' }).length === 0) {
      throw new Error('A model cannot be destroyed without a "where" clause or an idAttribute.');
    }
    return this.query.del();
  })

});

module.exports = Sync;