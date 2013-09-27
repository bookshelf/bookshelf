//     Bookshelf Active Record
//     (c) 2013 Tim Griesser

//     Bookshelf Active Record may be freely distributed under the MIT license.
//     An extension of the "Bookshelf.js" library, this module
//     provides features & syntax similar to Rails' ActiveRecord.
(function(define) {

"use strict";

define(function(require, exports) {

  // Require `Bookshelf`, which gives us all of the core
  // relational & database functionality. Also create the
  // public interface for the library.
  var Bookshelf    = require('../sql');
  var activeRecord = require('./lib');

  var ActiveRecord = function(bookshelf) {

    if (!(this instanceof ActiveRecord)) {
      return new ActiveRecord(config);
    }

    if (!(bookshelf instanceof Bookshelf)) {
      bookshelf = new Bookshelf(bookshelf);
    }

    // Augment the `bookshelf` instance with all of the
    // Active Record helper methods we're after.
    return activeRecord(bookshelf);
  };

  // The initialize method gives us the ability to create and store
  // a new ActiveRecord instance.
  ActiveRecord.initialize = function(bookshelf) {
    return new ActiveRecord(bookshelf);
  };

  // A function which augments the target object with
  // various `scope` methods... which are essentially just
  // methods that are also now available for chaining directly on the
  // constructor.
  ActiveRecord.scope = function(Target, scopes) {
    _.each(scopes, function(name, scope) {
      Target[name] = function() {
        var model = new this();
        return model[name].apply(model, arguments);
      };
      Target.prototype[name] = scope;
    });
  };

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);