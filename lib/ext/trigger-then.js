(function(define) { "use strict";

define(function(require, exports, module) {

  exports.triggerThen = require('trigger-then');

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);