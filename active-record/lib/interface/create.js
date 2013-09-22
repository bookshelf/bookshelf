// Create Interface
// ---------------
(function(define) {

"use strict";

define(function(require, exports) {

  var CreateInterface = {

    // Create a new object, specifying what attributes it should be created with.
    createWith: function(attrs) {
      return this.set(attrs);
    },

    // The `findOrCreateBy` method checks whether a record with the attributes exists.
    // If it doesn't, then `create` is called.
    findOrCreateBy: function(attrs, options) {
      var model = this;
      options = options || {};
      options.require = true;
      this.set(attrs).fetch(options).otherwise(function() {
        return model.create(attrs, options);
      });
    },

    // Works just like `findOrCreateBy` but it will call new instead of create.
    findOrInitializeBy: function() {
      var model = this;
      options = options || {};
      this.set(attrs).fetch(options).otherwise(function() {
        return model;
      });
    }

  };

  exports.CreateInterface = CreateInterface;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);