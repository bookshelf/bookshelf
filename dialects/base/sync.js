// Base Sync
// ---------------
(function(define) {

"use strict";

// An example "sync" object which is extended
// by dialect-specific sync implementations,
// making Bookshelf effectively a data store
// agnostic "Data Mapper".
define(function(require, exports) {

  var Promise  = require('./promise').Promise;
  var Backbone = require('backbone');

  // Used as the base of the prototype chain,
  // a convenient object for any `instanceof`
  // checks you may need.
  var BaseSync = function() {};

  BaseSync.prototype = {

    // Return a single model object.
    first: function() {
      return Promise.fulfilled({});
    },

    // Select one or more models, returning an array
    // of data objects.
    select: function() {
      return Promise.fulfilled([]);
    },

    // Insert a single row, returning an object
    // (typically containing an "insert id").
    insert: function() {
      return Promise.fulfilled({});
    },

    // Update an object in the data store.
    update: function() {
      return Promise.fulfilled({});
    },

    // Delete a record from the data store.
    del: function() {
      return Promise.fulfilled({});
    }

  };

  BaseSync.extend = Backbone.Model.extend;

  exports.BaseSync = BaseSync;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);