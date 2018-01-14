var _ = require('lodash');

exports.formatNumber = function(dialect) {
  return {
    mysql: _.identity,
    sqlite3: _.identity,
    postgresql: function(count) { return count.toString() }
  }[dialect];
}
