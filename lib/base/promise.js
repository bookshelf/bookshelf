'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('bluebird/js/main/promise');

var _promise2 = _interopRequireDefault(_promise);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Promise = (0, _promise2.default)();

Promise.prototype.yield = function () {
  (0, _helpers.deprecate)('.yield', '.return');
  return this.return.apply(this, arguments);
};
Promise.prototype.ensure = function () {
  (0, _helpers.deprecate)('.ensure', '.finally');
  return this.finally.apply(this, arguments);
};
Promise.prototype.otherwise = function () {
  (0, _helpers.deprecate)('.otherwise', '.catch');
  return this.catch.apply(this, arguments);
};
Promise.prototype.exec = function () {
  (0, _helpers.deprecate)('bookshelf.exec', 'bookshelf.asCallback');
  return this.nodeify.apply(this, arguments);
};

exports.default = Promise;