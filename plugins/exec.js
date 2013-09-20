// Exec plugin
// ---------------
(function(define) { "use strict";

// The `exec` plugin is used to optionally add
// support node-style callbacks, delegating to the promise
// method under the hood:

// `Bookshelf.plugin(require('bookshelf/plugins/exec'))`
define(function(require, exports, module) {

  var _ = require('underscore');

  // Accept the instance of `Bookshelf` we'd like to add `exec` support to.
  module.exports = function(Bookshelf) {

    // A method which is passed the `target` object and `method` we're
    // looking to extend with the `exec` interface.
    var wrapExec = function(target, method) {
      var targetMethod = target[method];
      target[method] = function() {
        var result, args = arguments;
        var ctx = this;
        return {

          // The then method is essentially the same as it was before,
          // just is not automatically called.
          then: function(onFulfilled, onRejected) {
            result || (result = targetMethod.apply(ctx, args));
            return result.then(onFulfilled, onRejected);
          },

          // A facade for the `then` method, throwing any uncaught errors
          // rather than swallowing them.
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

    // Wrap the appropriate methods on each object prototype, exposing the new API.
    _.each(['load', 'fetch', 'save', 'destroy'], function(method) {
      wrapExec(Bookshelf.Model.prototype, method);
    });
    _.each(['load', 'fetch'], function(method) {
      wrapExec(Bookshelf.Collection.prototype, method);
    });
  };

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);

