/* eslint no-console: 0 */

// Helpers
// ---------------
const _     = require('lodash');
const chalk = require('chalk')

const helpers = {

  // Sets the constraints necessary during a `model.save` call.
  saveConstraints: function(model, relatedData) {
    const data = {};
    if (relatedData
        && !relatedData.isThrough()
        && relatedData.type !== 'belongsToMany'
        && relatedData.type !== 'belongsTo'
    ) {
      data[relatedData.key('foreignKey')] = relatedData.parentFk || model.get(relatedData.key('foreignKey'));
      if (relatedData.isMorph()) data[relatedData.key('morphKey')] = relatedData.key('morphValue');
    }
    return model.set(model.parse(data));
  },

  // Finds the specific `morphTo` table we should be working with, or throws
  // an error if none is matched.
  morphCandidate: function(candidates, foreignTable) {
    const Target = _.find(candidates, function(Candidate) {
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

    // Ensure the object has a query builder.
    if (!obj._knex) {
      const tableName = _.result(obj, 'tableName');
      obj._knex = obj._builder(tableName);
    }

    // If there are no arguments, return the query builder.
    if (args.length === 0) return obj._knex;

    const method = args[0];

    if (_.isFunction(method)) {

      // `method` is a query builder callback. Call it on the query builder
      // object.
      method.call(obj._knex, obj._knex);
    } else if (_.isObject(method)) {

      // `method` is an object. Use keys as methods and values as arguments to
      // the query builder.
      for (const key in method) {
        const target = _.isArray(method[key]) ?  method[key] : [method[key]];
        obj._knex[key].apply(obj._knex, target);
      }
    } else {

      // Otherwise assume that the `method` is string name of a query builder
      // method, and use the remaining args as arguments to that method.
      obj._knex[method].apply(obj._knex, args.slice(1));
    }
    return obj;
  },

  error: function(msg) {
    console.log(chalk.red(msg))
  },

  warn: function(msg) {
    console.log(chalk.yellow(msg))
  },

  deprecate: function(a, b) {
    helpers.warn(a + ' has been deprecated, please use ' + b + ' instead')
  },

  orderBy (obj, sort, order) {

    let tableName;
    let idAttribute;

    if (obj.model) {
      tableName = obj.model.prototype.tableName;
      idAttribute = obj.model.prototype.idAttribute ?
        obj.model.prototype.idAttribute : 'id';
    } else {
      tableName = obj.constructor.prototype.tableName;
      idAttribute = obj.constructor.prototype.idAttribute ?
        obj.constructor.prototype.idAttribute : 'id';
    }

    let _sort;

    if (sort && sort.indexOf('-') === 0) {
      _sort = sort.slice(1);
    } else if (sort) {
      _sort = sort;
    } else {
      _sort = idAttribute;
    }

    const _order = order || (
      (sort && sort.indexOf('-') === 0) ? 'DESC' : 'ASC'
    );

    if (_sort.indexOf('.') === -1) {
      _sort = `${tableName}.${_sort}`;
    }

    return obj.query(qb => {
      qb.orderBy(_sort, _order);
    });
  }

};


module.exports = helpers
