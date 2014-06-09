// Sync
// ---------------
var _       = require('lodash');
var Promise = require('./base/promise');

// Sync is the dispatcher for any database queries,
// taking the "syncing" `model` or `collection` being queried, along with
// a hash of options that are used in the various query methods.
// If the `transacting` option is set, the query is assumed to be
// part of a transaction, and this information is passed along to `Knex`.
var Sync = function(syncing, options) {
  options = options || {};
  this.query   = syncing.query();
  this.syncing = syncing.resetQuery();
  this.options = options;
  if (options.debug) this.query.debug();
  if (options.transacting) this.query.transacting(options.transacting);
};

_.extend(Sync.prototype, {

  // Prefix all keys of the passed in object with the
  // current table name
  prefixFields: function(fields) {
    var tableName = this.syncing.tableName;
    var prefixed = {};
    for (var key in fields) {
      prefixed[tableName + '.' + key] = fields[key];
    }
    return prefixed;
  },

  // Select the first item from the database - only used by models.
  first: Promise.method(function() {
    this.query.where(this.prefixFields(this.syncing.format(
      _.extend(Object.create(null), this.syncing.attributes)
    ))).limit(1);
    return this.select();
  }),

  // Runs a `select` query on the database, adding any necessary relational
  // constraints, resetting the query when complete. If there are results and
  // eager loaded relations, those are fetched and returned on the model before
  // the promise is resolved. Any `success` handler passed in the
  // options will be called - used by both models & collections.
  select: Promise.method(function() {
    var columns, sync = this,
      options = this.options, relatedData = this.syncing.relatedData;

    // Inject all appropriate select costraints dealing with the relation
    // into the `knex` query builder for the current instance.
    if (relatedData) {
      relatedData.selectConstraints(this.query, options);
    } else {
      columns = options.columns;
      if (!_.isArray(columns)) columns = columns ? [columns] : [_.result(this.syncing, 'tableName') + '.*'];
    }

    // Set the query builder on the options, in-case we need to
    // access in the `fetching` event handlers.
    options.query = this.query;

    // Trigger a `fetching` event on the model, and then select the appropriate columns.
    return Promise.bind(this).then(function() {
      return this.syncing.triggerThen('fetching', this.syncing, columns, options);
    }).then(function() {
      return this.query.select(columns);
    });
  }),

  // Issues an `insert` command on the query - only used by models.
  insert: Promise.method(function() {
    var syncing = this.syncing;
    return this.query.insert(syncing.format(_.extend(Object.create(null), syncing.attributes)), syncing.idAttribute);
  }),

  // Issues an `update` command on the query - only used by models.
  update: Promise.method(function(attrs) {
    var syncing = this.syncing, query = this.query;
    if (syncing.id != null) query.where(syncing.idAttribute, syncing.id);
    if (_.where(query._statements, {grouping: 'where'}).length === 0) {
      throw new Error('A model cannot be updated without a "where" clause or an idAttribute.');
    }
    return query.update(syncing.format(_.extend(Object.create(null), attrs)));
  }),

  // Issues a `delete` command on the query.
  del: Promise.method(function() {
    var query = this.query, syncing = this.syncing;
    if (syncing.id != null) query.where(syncing.idAttribute, syncing.id);
    if (_.where(query._statements, {grouping: 'where'}).length === 0) {
      throw new Error('A model cannot be destroyed without a "where" clause or an idAttribute.');
    }
    return this.query.del();
  })

});

module.exports = Sync;