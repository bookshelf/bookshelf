if (!global._babelPolyfill) { require('babel-polyfill'); }

/**
 * (c) 2014 Tim Griesser
 * Bookshelf may be freely distributed under the MIT license.
 * For all details and documentation:
 * http://bookshelfjs.org
 *
 * version 0.9.2
 *
 */
module.exports = require('./lib/bookshelf').default;
