(function(define) { "use strict";

define(function(require, exports, module) {

  var Backbone    = require('./ext/backbone').Backbone;
  var when        = require('./ext/when').when;
  var triggerThen = require('./ext/trigger-then').triggerThen;

  // Mixin the `triggerThen` function into all relevant Backbone objects,
  // so we can have event driven async validations, functions, etc.
  triggerThen(Backbone, when);

  exports.Events = Backbone.Events;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);