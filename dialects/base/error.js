// Error Base
// ---------------
(function(define) {

"use strict";

define(function(require, exports) {

  var BaseError = function(name) {
    Error.apply(this, arguments);
  };

  BaseError.prototype = new Error;

  BaseError.extend = Backbone.Model.extend;

  exports.BaseError = BaseError;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);