
var Promise = require('bluebird/js/main/promise')();

Promise.prototype.yield = function(value) {
  return this.then(function() {
    return value;
  });
};

Promise.prototype.tap = function(handler) {
  return this.then(handler).yield(this);
};

Promise.prototype.ensure = Promise.prototype.lastly;
Promise.prototype.otherwise = Promise.prototype.caught;

Promise.resolve = Promise.fulfilled;
Promise.reject  = Promise.rejected;

Promise.nodeMethod = function Promise$_NodeMethod(fn) {
  return function Promise$_nodeMethod() {
    var nodeFn, $_len = arguments.length;
    var args = new Array($_len);
    for (var $_i = 0; $_i < $_len; ++$_i) {
      args[$_i] = arguments[$_i];
    }
    if ($_len > 0) {
      nodeFn = args[$_len - 1];
      if (typeof nodeFn === "function") args.pop();
    }
    return Promise.method(fn).apply(this, args).nodeify(nodeFn);
  };
};

module.exports = Promise;