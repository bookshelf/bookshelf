// Events
// ---------------
(function(define) {

"use strict";

define(function(require, exports) {

  var Promise     = require('./promise').Promise;
  var Backbone    = require('backbone');
  var triggerThen = require('trigger-then');

  // Mixin the `triggerThen` function into all relevant Backbone objects,
  // so we can have event driven async validations, functions, etc.
  triggerThen(Backbone, Promise);

  exports.Events = Backbone.Events;
});

})(
  typeof define === 'function' && define.amd ? define : function(factory) { factory(require, exports); }
);