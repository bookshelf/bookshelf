// Helpers
// ---------------
(function(define) {

"use strict";

define(function(require, exports) {

  var _ = require('underscore');

  exports.Helpers = {

    // Preps the `idAttribute` based on whether or not it's a
    // composite key. If any of the pieces of the key are missing,
    // the entire `id` is considered to not exist.
    idValue: function(attrs, idAttribute, existing) {
      if (_.isArray(idAttribute)) {
        var filled = true, newId = [];
        for (var i = 0, l = idAttribute.length; i < l; i++) {
          if (idAttribute[i] in attrs) {
            newId[i] = attrs[idAttribute[i]];
          } else {
            newId[i] = existing[i];
          }
          if (newId[i] == null) filled = false;
        }
        return filled ? newId : [];
      }
      if (idAttribute in attrs) return attrs[idAttribute];
    },

    // Preps the `id`, turning an array into a '-'
    // separated value for the `idAttribute`.
    prepId: function(value) {
      if (_.isArray(value)) {
        value = value.join('-');
      }
      return value;
    }

  };

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);