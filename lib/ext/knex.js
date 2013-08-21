(function(define) { "use strict";

define(function(require, exports, module) {

  exports.Knex = require('knex');

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);