// Case converter plugin
// Handles the conversion between the DB's snake_cased and JS's camelCased
// Model properties automatically.
// -----
module.exports = function (bookshelf) {
  'use strict';
  var _ = require('lodash');

  var Model = bookshelf.Model.extend({
    parse: function (attrs) {
      return _.reduce(attrs, function (memo, val, key) {
        memo[_.camelCase(key)] = val;
        return memo;
      }, {});
    },

    format: function (attrs) {
      return _.reduce(attrs, function (memo, val, key) {
        memo[_.snakeCase(key)] = val;
        return memo;
      }, {});
    }
  });

  bookshelf.Model = Model;
};
