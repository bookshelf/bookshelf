'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;
const DEFAULT_PAGE = 1;

/**
 * The plugin attaches two instance methods to the bookshelf
 * Model object: orderBy and fetchPage.
 *
 * Model#orderBy calls the underlying query builder's orderBy method, and
 * is useful for ordering the paginated results.
 *
 * Model#fetchPage works like Model#fetchAll, but returns a single page of
 * results instead of all results, as well as the pagination information
 *
 * See methods below for details.
 *
 * @example
 * const config = require('./knexfile');
 * const knex = require('knex');
 * const bookshelf = require('bookshelf');
 * const ORM = bookshelf(knex(config));
 *
 * ORM.plugin('bookshelf-pagination-plugin');
 */
module.exports = function paginationPlugin(bookshelf) {
  const Model = bookshelf.Model;

  /**
   * **Note**: In order to use this method, you must have the
   * {@link https://github.com/bookshelf/bookshelf/wiki/Plugin:-Pagination Pagination plugin} installed.
   *
   * This method is similar to {@link Model#fetchAll}, but fetches a single page of results as specified by the limit
   * (page size) and offset (page number).
   *
   * Any options that may be passed to {@link Model#fetchAll} may also be passed in the options to this method.
   * Additionally, to perform pagination, you may include **either** an `offset` and `limit`, **or** a `page` and
   * `pageSize`.
   *
   * By default, with no parameters or some missing parameters, `fetchPage` will use default values of
   * `{page: 1, pageSize: 10}`.
   *
   * @example
   * Car
   *   .query(function(qb) {
   *     qb.innerJoin('manufacturers', 'cars.manufacturer_id', 'manufacturers.id')
   *     qb.groupBy('cars.id')
   *     qb.where('manufacturers.country', '=', 'Sweden')
   *   })
   *   .fetchPage({
   *     pageSize: 15, // Defaults to 10 if not specified
   *     page: 3, // Defaults to 1 if not specified
   *     withRelated: ['engine'] // Passed to Model#fetchAll
   *   })
   *   .then(function (results) {
   *     console.log(results) // Paginated results object with metadata example below
   *   })
   *
   * // Pagination results:
   * {
   *   models: [
   *     // Regular bookshelf Collection
   *   ],
   *   // other standard Collection attributes
   *   // ...
   *   pagination: {
   *     rowCount: 53, // Total number of rows found for the query before pagination
   *     pageCount: 4, // Total number of pages of results
   *     page: 3, // The requested page number
   *     pageSize: 15 // The requested number of rows per page
   *    }
   * }
   *
   * @method Model#fetchPage
   * @param {Object} [options]
   *   Besides the basic options that can be passed to {@link Model#fetchAll}, there are some additional pagination
   *   options that can be specified.
   * @param {number} [options.pageSize]
   *   How many models to include in each page, defaulting to 10 if not specified. Used only together with the `page`
   *   option.
   * @param {number} [options.page]
   *   Page number to retrieve. If greater than the available rows it will return an empty Collection. The first page is
   *   number `1`. Used only with the `pageSize` option.
   * @param {number} [options.limit]
   *   How many models to include in each page, defaulting to 10 if not specified. Used only together with the `offset`
   *   option.
   * @param {number} [options.offset]
   *   Index to begin fetching results from. The default and initial value is `0`. Used only with the `limit` option.
   * @returns {Promise<Collection>}
   *   Returns a Promise that will resolve to the paginated collection of models. Note that if there are no results the
   *   return value will be an empty Collection.
   */
  function fetchPage(options) {
    if (!options) options = {};

    const isModel = this instanceof Model;
    const page = options.page;
    const pageSize = options.pageSize;
    const limit = options.limit;
    const offset = options.offset;
    const fetchOptions = _.omit(options, ['page', 'pageSize', 'limit', 'offset']);
    const countOptions = _.omit(fetchOptions, ['require', 'columns', 'withRelated', 'lock']);
    const fetchMethodName = isModel ? 'fetchAll' : 'fetch';
    const targetModel = isModel ? this.constructor : this.target || this.model;
    const tableName = targetModel.prototype.tableName;
    const idAttribute = targetModel.prototype.idAttribute || 'id';
    const targetIdColumn = [`${tableName}.${idAttribute}`];
    let usingPageSize = false; // usingPageSize = false means offset/limit, true means page/pageSize
    let _page;
    let _pageSize;
    let _limit;
    let _offset;

    function ensureIntWithDefault(val, def) {
      if (!val) return def;
      const _val = parseInt(val);
      if (Number.isNaN(_val)) return def;

      return _val;
    }

    if (!limit && !offset) {
      usingPageSize = true;
      _pageSize = ensureIntWithDefault(pageSize, DEFAULT_LIMIT);
      _page = ensureIntWithDefault(page, DEFAULT_PAGE);
      _limit = _pageSize;
      _offset = _limit * (_page - 1);
    } else {
      _pageSize = _limit; // not used, just for eslint `const` error
      _limit = ensureIntWithDefault(limit, DEFAULT_LIMIT);
      _offset = ensureIntWithDefault(offset, DEFAULT_OFFSET);
    }

    const paginate = () => {
      const pager = this.clone();

      return pager
        .query((qb) => {
          Object.assign(qb, this.query().clone());
          qb.limit.apply(qb, [_limit]);
          qb.offset.apply(qb, [_offset]);

          return null;
        })
        [fetchMethodName](fetchOptions);
    };

    const count = () => {
      const notNeededQueries = ['orderByBasic', 'orderByRaw', 'groupByBasic', 'groupByRaw'];
      const counter = this.clone();
      const groupColumns = [];

      return counter
        .query((qb) => {
          Object.assign(qb, this.query().clone());

          // Remove grouping and ordering. Ordering is unnecessary
          // for a count, and grouping returns the entire result set
          // What we want instead is to use `DISTINCT`
          _.remove(qb._statements, (statement) => {
            if (statement.grouping === 'group') statement.value.forEach((value) => groupColumns.push(value));
            if (statement.grouping === 'columns' && statement.distinct)
              statement.value.forEach((value) => groupColumns.push(value));

            return notNeededQueries.indexOf(statement.type) > -1 || statement.grouping === 'columns';
          });

          if (!isModel && counter.relatedData) {
            // Remove joining columns that break COUNT operation.
            // eg. pivotal coulmns for belongsToMany relation.
            counter.relatedData.joinColumns = function() {};
          }

          qb.countDistinct.apply(qb, groupColumns.length > 0 ? groupColumns : targetIdColumn);
        })
        [fetchMethodName](countOptions)
        .then((result) => {
          const metadata = usingPageSize ? {page: _page, pageSize: _limit} : {offset: _offset, limit: _limit};

          if (result && result.length == 1) {
            // We shouldn't have to do this, instead it should be
            // result.models[0].get('count')
            // but SQLite uses a really strange key name.
            const keys = Object.keys(result.models[0].attributes);

            if (keys.length === 1) {
              const key = Object.keys(result.models[0].attributes)[0];
              metadata.rowCount = parseInt(result.models[0].attributes[key]);
            }
          }

          return metadata;
        });
    };

    return Promise.join(paginate(), count(), (rows, metadata) => {
      const pageCount = Math.ceil(metadata.rowCount / _limit);
      const pageData = Object.assign(metadata, {pageCount});
      return Object.assign(rows, {pagination: pageData});
    });
  }

  bookshelf.Model.prototype.fetchPage = fetchPage;

  bookshelf.Model.fetchPage = function() {
    var model = this.forge();
    return model.fetchPage.apply(model, arguments);
  };

  bookshelf.Collection.prototype.fetchPage = fetchPage;
};
