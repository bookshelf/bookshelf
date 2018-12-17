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
   * In order to use this function, you must have the {@link
   * https://github.com/bookshelf/bookshelf/wiki/Plugin:-Pagination Pagination}
   * plugin installed.
   *
   * @method Model#fetchPage
   * @belongsTo Model
   *
   * Similar to {@link Model#fetchAll}, but fetches a single page of results
   * as specified by the limit (page size) and offset or page number.
   *
   * Any options that may be passed to {@link Model#fetchAll} may also be passed
   * in the options to this method.
   *
   * To perform pagination, you may include *either* an `offset` and `limit`, **or**
   * a `page` and `pageSize`.
   *
   * By default, with no parameters or missing parameters, `fetchPage` will use an
   * options object of `{page: 1, pageSize: 10}`
   *
   *
   * Below is an example showing the user of a JOIN query with sort/ordering,
   * pagination, and related models.
   *
   * @example
   *
   * Car
   * .query(function (qb) {
   *    qb.innerJoin('manufacturers', 'cars.manufacturer_id', 'manufacturers.id');
   *    qb.groupBy('cars.id');
   *    qb.where('manufacturers.country', '=', 'Sweden');
   * })
   * .orderBy('-productionYear') // Same as .orderBy('cars.productionYear', 'DESC')
   * .fetchPage({
   *    pageSize: 15, // Defaults to 10 if not specified
   *    page: 3, // Defaults to 1 if not specified
   *
   *    // OR
   *    // limit: 15,
   *    // offset: 30,
   *
   *    withRelated: ['engine'] // Passed to Model#fetchAll
   * })
   * .then(function (results) {
   *    console.log(results); // Paginated results object with metadata example below
   * })
   *
   * // Pagination results:
   *
   * {
   *    models: [<Car>], // Regular bookshelf Collection
   *    // other standard Collection attributes
   *    ...
   *    pagination: {
   *        rowCount: 53, // Total number of rows found for the query before pagination
   *        pageCount: 4, // Total number of pages of results
   *        page: 3, // The requested page number
   *        pageSize: 15, // The requested number of rows per page
   *
   *  // OR, if limit/offset pagination is used instead of page/pageSize:
   *        // offset: 30, // The requested offset
   *        // limit: 15 // The requested limit
   *    }
   * }
   *
   * @param options {object}
   *    The pagination options, plus any additional options that will be passed to
   *    {@link Model#fetchAll}
   * @returns {Promise<Model|null>}
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
