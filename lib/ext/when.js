(function(define) { "use strict";

define(function(require, exports, module) {

  exports.when = require('when');

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);