(function(define) { "use strict";

define(function(require, exports, module) {

  exports.inflection = require('inflection');

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);