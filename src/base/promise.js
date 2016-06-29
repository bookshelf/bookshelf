import Promise from 'bluebird';
import { deprecate } from '../helpers';

Promise.prototype.yield = function() {
  deprecate('.yield', '.return')
  return this.return.apply(this, arguments);
}
Promise.prototype.ensure = function() {
  deprecate('.ensure', '.finally')
  return this.finally.apply(this, arguments);
}
Promise.prototype.otherwise = function() {
  deprecate('.otherwise', '.catch')
  return this.catch.apply(this, arguments);
}
Promise.prototype.exec = function() {
  deprecate('bookshelf.exec', 'bookshelf.asCallback')
  return this.nodeify.apply(this, arguments);
};

export default Promise;
