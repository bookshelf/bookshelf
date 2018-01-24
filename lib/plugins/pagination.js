'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_LIMIT = 10;
var DEFAULT_OFFSET = 0;
var DEFAULT_PAGE = 1;

/**
 * Exports a plugin to pass into the bookshelf instance, i.e.:
 *
 *      import config from './knexfile';
 *      import knex from 'knex';
 *      import bookshelf from 'bookshelf';
 *
 *      const ORM = bookshelf(knex(config));
 *
 *      ORM.plugin('bookshelf-pagination-plugin');
 *
 *      export default ORM;
 *
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
 */
module.exports = function paginationPlugin(bookshelf) {

  /**
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
   *        pageSze: 15, // The requested number of rows per page
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
  function fetchPage() {
    var _this = this;

    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var page = options.page;
    var pageSize = options.pageSize;
    var limit = options.limit;
    var offset = options.offset;
    var fetchOptions = (0, _objectWithoutProperties3.default)(options, ['page', 'pageSize', 'limit', 'offset']);


    var usingPageSize = false; // usingPageSize = false means offset/limit, true means page/pageSize
    var _page = void 0;
    var _pageSize = void 0;
    var _limit = void 0;
    var _offset = void 0;

    function ensureIntWithDefault(val, def) {
      if (!val) {
        return def;
      }

      var _val = parseInt(val);
      if (Number.isNaN(_val)) {
        return def;
      }

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

    var tableName = this.constructor.prototype.tableName;
    var idAttribute = this.constructor.prototype.idAttribute ? this.constructor.prototype.idAttribute : 'id';

    var paginate = function paginate() {
      // const pageQuery = clone(this.query());
      var pager = _this.constructor.forge();

      return pager.query(function (qb) {
        (0, _lodash.assign)(qb, _this.query().clone());
        qb.limit.apply(qb, [_limit]);
        qb.offset.apply(qb, [_offset]);
        return null;
      }).fetchAll(fetchOptions);
    };

    var count = function count() {
      var notNeededQueries = ['orderByBasic', 'orderByRaw', 'groupByBasic', 'groupByRaw'];
      var counter = _this.constructor.forge();

      return counter.query(function (qb) {
        (0, _lodash.assign)(qb, _this.query().clone());

        // Remove grouping and ordering. Ordering is unnecessary
        // for a count, and grouping returns the entire result set
        // What we want instead is to use `DISTINCT`
        (0, _lodash.remove)(qb._statements, function (statement) {
          return notNeededQueries.indexOf(statement.type) > -1 || statement.grouping === 'columns';
        });
        qb.countDistinct.apply(qb, [tableName + '.' + idAttribute]);
      }).fetchAll().then(function (result) {

        var metadata = usingPageSize ? { page: _page, pageSize: _limit } : { offset: _offset, limit: _limit };

        if (result && result.length == 1) {
          // We shouldn't have to do this, instead it should be
          // result.models[0].get('count')
          // but SQLite uses a really strange key name.
          var _count = result.models[0];
          var keys = Object.keys(_count.attributes);
          if (keys.length === 1) {
            var key = Object.keys(_count.attributes)[0];
            metadata.rowCount = parseInt(_count.attributes[key]);
          }
        }

        return metadata;
      });
    };

    return _bluebird2.default.join(paginate(), count()).then(function (_ref) {
      var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

      var rows = _ref2[0];
      var metadata = _ref2[1];

      var pageCount = Math.ceil(metadata.rowCount / _limit);
      var pageData = (0, _lodash.assign)(metadata, { pageCount: pageCount });
      return (0, _lodash.assign)(rows, { pagination: pageData });
    });
  }

  bookshelf.Model.prototype.fetchPage = fetchPage;

  bookshelf.Model.fetchPage = function () {
    var _forge;

    return (_forge = this.forge()).fetchPage.apply(_forge, arguments);
  };

  bookshelf.Collection.prototype.fetchPage = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return fetchPage.apply.apply(fetchPage, [this.model.forge()].concat(args));
  };
};