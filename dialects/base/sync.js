// Sync
// ---------------
(function(define) {

"use strict";

define(function(require, exports) {

  var when     = require('when');
  var Backbone = require('backbone');
  var BaseSync = function() {};

  BaseSync.prototype = {

    initialize: function() {},

    first: function() {
      return when.resolve({});
    },

    select: function() {
      return when.resolve([]);
    },

    insert: function() {
      return when.resolve({});
    },

    update: function() {
      return when.resolve({});
    },

    del: function() {
      return when.resolve({});
    }

  };

  BaseSync.extend = Backbone.Model.extend;

  exports.BaseSync = BaseSync;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);