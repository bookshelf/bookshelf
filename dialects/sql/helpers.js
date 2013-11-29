// Helpers
// ---------------

var _ = require('lodash');

exports.Helpers = {

  // Sets the constraints necessary during a `model.save` call.
  saveConstraints: function(model, relatedData) {
    var data = {};
    if (relatedData && relatedData.type && relatedData.type !== 'belongsToMany') {
      data[relatedData.key('foreignKey')] = relatedData.parentFk;
      if (relatedData.isMorph()) data[relatedData.key('morphKey')] = relatedData.key('morphValue');
    }
    return model.set(data);
  },

  // Finds the specific `morphTo` table we should be working with, or throws
  // an error if none is matched.
  morphCandidate: function(candidates, foreignTable) {
    var Target = _.find(candidates, function(Candidate) {
      return (_.result(Candidate.prototype, 'tableName') === foreignTable);
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
  query: function(obj, args) {
    obj._knex = obj._knex || obj._builder(_.result(obj, 'tableName'));
    if (args.length === 0) return obj._knex;
    var method = args[0];
    if (_.isFunction(method)) {
      method.call(obj._knex, obj._knex);
    } else if (_.isObject(method)) {
      for (var key in method) {
        var target = _.isArray(method[key]) ?  method[key] : [method[key]];
        obj._knex[key].apply(obj._knex, target);
      }
    } else {
      obj._knex[method].apply(obj._knex, args.slice(1));
    }
    return obj;
  }

};
