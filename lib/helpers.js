/* eslint no-console: 0 */

// Helpers
// ---------------
'use strict';

const _ = require('lodash');

module.exports = {
  // Sets the constraints necessary during a `model.save` call.
  saveConstraints: function(model, relatedData) {
    const data = {};

    if (
      relatedData &&
      !relatedData.isThrough() &&
      relatedData.type !== 'belongsToMany' &&
      relatedData.type !== 'belongsTo'
    ) {
      data[relatedData.key('foreignKey')] = relatedData.parentFk || model.get(relatedData.key('foreignKey'));
      if (relatedData.isMorph()) data[relatedData.key('morphKey')] = relatedData.key('morphValue');
    }

    return model.set(model.parse(data));
  },

  // Finds the specific `morphTo` target Model we should be working with, or throws
  // an error if none is matched.
  morphCandidate: function(candidates, morphValue) {
    const Target = _.find(candidates, (candidate) => candidate[1] === morphValue);

    if (!Target)
      throw new Error('The target polymorphic type "' + morphValue + '" is not one of the defined target types');

    return Target[0];
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
      // `method` is a query builder callback. Call it on the query builder object.
      method.call(obj._knex, obj._knex);
    } else if (_.isObject(method)) {
      // `method` is an object. Use keys as methods and values as arguments to
      // the query builder.
      for (const key in method) {
        const target = Array.isArray(method[key]) ? method[key] : [method[key]];
        obj._knex[key].apply(obj._knex, target);
      }
    } else {
      // Otherwise assume that the `method` is string name of a query builder
      // method, and use the remaining args as arguments to that method.
      obj._knex[method].apply(obj._knex, args.slice(1));
    }

    return obj;
  },

  orderBy: function(obj, sort, order) {
    let tableName;
    let idAttribute;
    let _sort;

    if (obj.model) {
      tableName = obj.model.prototype.tableName;
      idAttribute = obj.model.prototype.idAttribute || 'id';
    } else {
      tableName = obj.constructor.prototype.tableName;
      idAttribute = obj.constructor.prototype.idAttribute || 'id';
    }

    if (sort && sort.indexOf('-') === 0) {
      _sort = sort.slice(1);
    } else if (sort) {
      _sort = sort;
    } else {
      _sort = idAttribute;
    }

    const _order = order || (sort && sort.indexOf('-') === 0 ? 'DESC' : 'ASC');

    if (_sort.indexOf('.') === -1) {
      _sort = `${tableName}.${_sort}`;
    }

    return obj.query((qb) => {
      qb.orderBy(_sort, _order);
    });
  }
};
