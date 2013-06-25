var Bookshelf = require('../bookshelf');
var _         = require('underscore');

// Used to optionally add `exec` support for those who prefer node-style callbacks.
Bookshelf.wrapExec = function(target, method) {
  var targetMethod = target[method];
  target[method] = function() {
    var result, args = arguments;
    var ctx = this;
    return {
      then: function(onFulfilled, onRejected) {
        result || (result = targetMethod.apply(ctx, args));
        return result.then(onFulfilled, onRejected);
      },
      exec: function(callback) {
        result || (result = targetMethod.apply(ctx, args));
        return result.then(function(resp) {
          callback(null, resp);
        }, function(err) {
          callback(err, null);
        }).then(null, function(err) {
          setTimeout(function() { throw err; }, 0);
        });
      }
    };
  };
};

_.each(['load', 'fetch', 'save', 'destroy'], function(method) {
  Bookshelf.wrapExec(Bookshelf.Model.prototype, method);
});

_.each(['load', 'fetch'], function(method) {
  Bookshelf.wrapExec(Bookshelf.Collection.prototype, method);
});

// Export the `Bookshelf` object.
module.exports = Bookshelf;