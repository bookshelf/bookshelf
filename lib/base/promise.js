'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.prototype.yield = function () {
  (0, _helpers.deprecate)('.yield', '.return');
  return this.return.apply(this, arguments);
};
_bluebird2.default.prototype.ensure = function () {
  (0, _helpers.deprecate)('.ensure', '.finally');
  return this.finally.apply(this, arguments);
};
_bluebird2.default.prototype.otherwise = function () {
  (0, _helpers.deprecate)('.otherwise', '.catch');
  return this.catch.apply(this, arguments);
};
_bluebird2.default.prototype.exec = function () {
  (0, _helpers.deprecate)('bookshelf.exec', 'bookshelf.asCallback');
  return this.nodeify.apply(this, arguments);
};

exports.default = _bluebird2.default;