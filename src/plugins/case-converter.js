/**
 * Case Converter Plugin
 *
 * Handles the conversion between the database's snake_cased and a model's camelCased properties automatically.
 */
module.exports = function(bookshelf) {
  const _ = require('lodash');

  bookshelf.Model = bookshelf.Model.extend({
    parse: function(attrs) {
      return _.mapKeys(attrs, function(value, key) {
        return _.camelCase(key);
      });
    },

    format: function(attrs) {
      return _.mapKeys(attrs, function(value, key) {
        return _.snakeCase(key);
      });
    }
  });
};
