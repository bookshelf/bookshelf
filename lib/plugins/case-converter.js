/**
 * Case Converter Plugin
 *
 * Handles the conversion between the database's snake_cased and a model's camelCased properties automatically. You just
 * need to load it somewhere in your code.
 *
 * @example
 * var bookshelf = Bookshelf(knex);
 * bookshelf.plugin('case-converter');
 *
 * @module plugins/case-converter
 */
module.exports = function caseConverter(bookshelf) {
  const _ = require('lodash');

  /**
   * Monkey-patched Model class.
   * @extends Model
   */
  bookshelf.Model = bookshelf.Model.extend({
    /**
     * @description Converts attribute keys to camel case when fetching data from the database.
     */
    parse: function(attrs) {
      return _.mapKeys(attrs, function(value, key) {
        return _.camelCase(key);
      });
    },

    /**
     * @method
     * @description
     *    Converts attribute keys to snake case just before saving a model to the database. The converted attributes
     *    will not be set on the model.
     * @override
     */
    format: function(attrs) {
      return _.mapKeys(attrs, function(value, key) {
        return _.snakeCase(key);
      });
    }
  });
};
