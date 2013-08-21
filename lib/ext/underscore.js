(function(define) { "use strict";

define(function(require, exports, module) {

  exports._ = require('underscore');

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);