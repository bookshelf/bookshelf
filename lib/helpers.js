// Helpers
// ---------------
'use strict';

var _ = require('lodash');
var chalk = require('chalk');

var helpers = {

  // Sets the constraints necessary during a `model.save` call.
  saveConstraints: function saveConstraints(model, relatedData) {
    var data = {};
    if (relatedData && !relatedData.isThrough() && relatedData.type !== 'belongsToMany' && relatedData.type !== 'belongsTo') {
      data[relatedData.key('foreignKey')] = relatedData.parentFk || model.get(relatedData.key('foreignKey'));
      if (relatedData.isMorph()) data[relatedData.key('morphKey')] = relatedData.key('morphValue');
    }
    return model.set(model.parse(data));
  },

  // Finds the specific `morphTo` table we should be working with, or throws
  // an error if none is matched.
  morphCandidate: function morphCandidate(candidates, foreignTable) {
    var Target = _.find(candidates, function (Candidate) {
      return _.result(Candidate.prototype, 'tableName') === foreignTable;
    });
    if (!Target) {
      throw new Error('The target polymorphic model was not found');
    }
    return Target;
  },

  // If there are no arguments, return the current object's
  // query builder (or create and return a new one). If there are arguments,
  // call the query builder with the first argument, applying the rest.
  // If the first argument is an object, assume the keys are query builder
  // methods, and the values are the arguments for the query.
  query: function query(obj, args) {

    // Ensure the object has a query builder.
    if (!obj._knex) {
      var tableName = _.result(obj, 'tableName');
      obj._knex = obj._builder(tableName);
    }

    // If there are no arguments, return the query builder.
    if (args.length === 0) return obj._knex;

    var method = args[0];

    if (_.isFunction(method)) {

      // `method` is a query builder callback. Call it on the query builder
      // object.
      method.call(obj._knex, obj._knex);
    } else if (_.isObject(method)) {

      // `method` is an object. Use keys as methods and values as arguments to
      // the query builder.
      for (var key in method) {
        var target = _.isArray(method[key]) ? method[key] : [method[key]];
        obj._knex[key].apply(obj._knex, target);
      }
    } else {

      // Otherwise assume that the `method` is string name of a query builder
      // method, and use the remaining args as arguments to that method.
      obj._knex[method].apply(obj._knex, args.slice(1));
    }
    return obj;
  },

  error: function error(msg) {
    console.log(chalk.red(msg));
  },

  warn: function warn(msg) {
    console.log(chalk.yellow(msg));
  },

  deprecate: function deprecate(a, b) {
    helpers.warn(a + ' has been deprecated, please use ' + b + ' instead');
  }

};

module.exports = helpers;