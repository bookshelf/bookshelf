// Base Sync
// ---------------
(function(define) {

"use strict";

// An example "sync" object which is extended
// by dialect-specific sync implementations,
// making Bookshelf effectively a data store
// agnostic "Data Mapper".
define(function(require, exports) {

  var when     = require('when');
  var Backbone = require('backbone');

  // Used as the base of the prototype chain,
  // a convenient object for any `instanceof`
  // checks you may need.
  var BaseSync = function() {};

  BaseSync.prototype = {

    // May be used for any setup for the class.
    initialize: function() {},

    // Return a single model object.
    first: function() {
      return when.resolve({});
    },

    // Select one or more models, returning an array
    // of data objects.
    select: function() {
      return when.resolve([]);
    },

    // Insert a single row, returning an object
    // (typically containing an "insert id").
    insert: function() {
      return when.resolve({});
    },

    // Update an object in the data store.
    update: function() {
      return when.resolve({});
    },

    // Delete a record from the data store.
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