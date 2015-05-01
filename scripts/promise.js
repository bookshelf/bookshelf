var Promise = require('bluebird')
var helpers = require('../helpers')

Promise.prototype.yield = function() {
  helpers.deprecate('.yield', '.return')
  return this.return.apply(this, arguments);
}
Promise.prototype.ensure = function() {
  helpers.deprecate('.ensure', '.finally')
  return this.finally.apply(this, arguments);
}
Promise.prototype.otherwise = function() {
  helpers.deprecate('.otherwise', '.catch')
  return this.catch.apply(this, arguments);
}
Promise.prototype.exec = function() {
  helpers.deprecate('bookshelf.exec', 'bookshelf.asCallback')
  return this.nodeify.apply(this, arguments);
};

module.exports = Promise