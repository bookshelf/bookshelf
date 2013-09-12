// Events
// ---------------
(function(define) {

"use strict";

define(function(require, exports) {

  var when        = require('when');
  var Backbone    = require('backbone');
  var triggerThen = require('trigger-then');

  // Mixin the `triggerThen` function into all relevant Backbone objects,
  // so we can have event driven async validations, functions, etc.
  triggerThen(Backbone, when);

  exports.Events = Backbone.Events;

});

})(
  typeof define === 'function' && define.amd ? define : function(factory) { factory(require, exports); }
);