// Update
// ---------------
(function(define) {

"use strict";

define(function(require, exports) {

  var UpdateInterface = {

    updateAll: function() {

    },

    // Updates an object, basically just an alias for `save`.
    update: function(attrs, options) {
      return this.save(attrs, options);
    }

  };

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);