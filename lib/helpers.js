/* eslint no-console: 0 */

// Helpers
// ---------------

const _ = require('lodash');
const Promise = require('bluebird');
const Model = require('./base/model');

function ensureIntWithDefault(number, defaultValue) {
  if (!number) return defaultValue;
  const parsedNumber = parseInt(number, 10);
  if (Number.isNaN(parsedNumber)) return defaultValue;

  return parsedNumber;
}

module.exports = {
  // This is used by both Model and Collection methods to paginate the results.
  fetchPage(options) {
    const DEFAULT_LIMIT = 10;
    const DEFAULT_OFFSET = 0;
    const DEFAULT_PAGE = 1;

    const isModel = this instanceof Model;
    const fetchOptions = _.omit(options, ['page', 'pageSize', 'limit', 'offset']);
    const countOptions = _.omit(fetchOptions, ['require', 'columns', 'withRelated', 'lock']);
    const fetchMethodName = isModel ? 'fetchAll' : 'fetch';
    const targetModel = isModel ? this.constructor : this.target || this.model;
    const tableName = targetModel.prototype.tableName;
    const idAttribute = targetModel.prototype.idAttribute || 'id';
    const targetIdColumn = [`${tableName}.${idAttribute}`];
    let page;
    let pageSize;
    let limit;
    let offset;

    if (!options.limit && !options.offset) {
      pageSize = ensureIntWithDefault(options.pageSize, DEFAULT_LIMIT);
      page = ensureIntWithDefault(options.page, DEFAULT_PAGE);
      limit = pageSize;
      offset = limit * (page - 1);
    } else {
      limit = ensureIntWithDefault(options.limit, DEFAULT_LIMIT);
      offset = ensureIntWithDefault(options.offset, DEFAULT_OFFSET);
    }

    const paginate = () => {
      return this.clone()
        .query((qb) => {
          Object.assign(qb, this.query().clone());
          qb.limit.apply(qb, [limit]);
          qb.offset.apply(qb, [offset]);

          return null;
        })
        [fetchMethodName](fetchOptions);
    };

    const metadata = !options.limit && !options.offset ? {page, pageSize} : {offset, limit};

    if (options.disableCount) {
      return paginate().then((rows) => {
        return Object.assign(rows, {pagination: metadata});
      });
    }

    const count = () => {
      const notNeededQueries = ['orderByBasic', 'orderByRaw', 'groupByBasic', 'groupByRaw'];
      const counter = this.clone();
      const groupColumns = [];

      return counter
        .query((qb) => {
          Object.assign(qb, this.query().clone());

          // Remove grouping and ordering. Ordering is unnecessary for a count, and grouping returns the entire result
          // set. What we want instead is to use `DISTINCT`.
          _.remove(qb._statements, (statement) => {
            if (statement.grouping === 'group') statement.value.forEach((value) => groupColumns.push(value));
            if (statement.grouping === 'columns' && statement.distinct)
              statement.value.forEach((value) => groupColumns.push(value));

            return notNeededQueries.indexOf(statement.type) > -1 || statement.grouping === 'columns';
          });

          if (!isModel && counter.relatedData) {
            // Remove joining columns that break COUNT operation, eg. pivotal coulmns for belongsToMany relation.
            counter.relatedData.joinColumns = function() {};
          }

          qb.countDistinct.apply(qb, groupColumns.length > 0 ? groupColumns : targetIdColumn);
        })
        [fetchMethodName](countOptions)
        .then((result) => {
          if (result && result.length == 1) {
            // We shouldn't have to do this, instead it should be result.models[0].get('count') but SQLite and MySQL
            // return a really strange key name and Knex doesn't abstract that away yet:
            // https://github.com/tgriesser/knex/issues/3315.
            const keys = Object.keys(result.models[0].attributes);

            if (keys.length === 1) {
              const key = Object.keys(result.models[0].attributes)[0];
              metadata.rowCount = parseInt(result.models[0].attributes[key]);
            }
          }
        });
    };

    return Promise.join(paginate(), count(), (rows) => {
      const pageCount = Math.ceil(metadata.rowCount / limit);
      const pageData = Object.assign(metadata, {pageCount});
      return Object.assign(rows, {pagination: pageData});
    });
  },

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
