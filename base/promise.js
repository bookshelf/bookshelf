
var Promise = require('bluebird/js/main/promise')();
var util    = require('bluebird/js/main/util');

var errorObj  = util.errorObj;
var tryCatch1 = util.tryCatch1;
var tryCatch2 = util.tryCatch2;
var tryCatchApply = util.tryCatchApply;
var tryCatch3 = function tryCatch3(fn, receiver, arg, arg2, arg3) {
  try {
    return fn.call(receiver, arg, arg2, arg3);
  } catch (e) {
    errorObj.e = e;
    return errorObj;
  }
};

var tryCatchApply = util.tryCatchApply;

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
  if (typeof fn !== "function") throw new TypeError("fn must be a function");
  return function Promise$_nodeMethod() {
    var value, nodeFn;
    if (arguments.length > 0) {
      var end = arguments.length - 1;
      nodeFn  = arguments[end];
      if (typeof nodeFn === "function") {
        var $_len = arguments.length;
        var args = new Array(end - 0);
        for (var $_i = 0; $_i < end; ++$_i) {
          args[$_i - 0] = arguments[$_i];
        }
        value = tryCatchApply(fn, args, this);
      } else {
        switch(arguments.length) {
        case 1: value = tryCatch1(fn, this, arguments[0]); break;
        case 2: value = tryCatch2(fn, this, arguments[0], arguments[1]); break;
        case 3: value = tryCatch3(fn, this, arguments[0], arguments[1], arguments[2]); break;
        default:
          var $_len2 = arguments.length;
          var args2 = new Array($_len2);
          for (var $_i2 = 0; $_i2 < $_len2; ++$_i2) {
            args2[$_i2] = arguments[$_i2];
          }
          value = tryCatchApply(fn, args2, this); break;
        }
      }
    } else {
      value = tryCatch1(fn, this, void 0);
    }
    var ret = new Promise(function(){});
        ret._resolveFromSyncValue(value, Promise$_nodeMethod);
    return ret.nodeify(nodeFn);
  };
};

module.exports = Promise;