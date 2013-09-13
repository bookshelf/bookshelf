(function(define) { "use strict";

define(function(require, exports, module) {

  var _ = require('underscore');

  module.exports = function(Bookshelf) {

    // Used to optionally add `exec` support for those who prefer node-style callbacks.
    var wrapExec = function(target, method) {
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

