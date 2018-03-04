var _ = require('lodash');

exports.formatNumber = function(dialect) {
  return {
    mysql: _.identity,
    sqlite3: _.identity,
    postgresql: function(count) { return count.toString() }
  }[dialect];
}

exports.countModels = function countModels(Model, options) {
  return function() {
    return Model.forge().count(options).then(function(count) {
      if (typeof count === 'string') return parseInt(count);
      return count;
    });
  }
}
