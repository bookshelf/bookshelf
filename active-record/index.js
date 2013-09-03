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
  var Bookshelf    = require('../bookshelf');
  var extension    = require('./lib');
  var ActiveRecord = module.exports = {};

  // Any active record instance we create is kept here, for convenience.
  ActiveRecord.Instances = {};

  // The initialize method gives us the ability to create and store
  // a new ActiveRecord instance.
  ActiveRecord.initialize = function(name, config) {

    // If there's an object, assume this is the `main` instance of
    // the `ActiveRecord` we're using.
    if (_.isObject(name)) {
      options = name;
      name = 'main';
    }

    // Only allow a single named instance of `ActiveRecord`.
    if (ActiveRecord.Instances[name]) {
      throw new Error('A ' + name + ' instance of ActiveRecord already exists');
    }

    // Create the new `Bookshelf` instance with a specific config, and
    // extend the `Bookshelf.Model` with the correct prototype and static methods
    // to make this into an almost 1-to-1 ActiveRecord clone...
    var instance = extension(Bookshelf(config));

    // For convenience, we'll mixin the first instance to the exports, so that
    // from that point on in the app, you can just call `require('active-record')`
    // and have it give you back the initialized instance. If you don't want it
    // to do that for you, just reproduce the few lines above on your own
    // and you're good to go...
    if (name === 'main') {
      _.extend(ActiveRecord, instance);
    }

    // ...and also, put the instance in an `Instances` object cache, for quick
    // reference later. Again, if you're not a fan of the global state this creates
    // internally in the library, just simply reproduce the three lines needed to
    // create the instance above.
    ActiveRecord.Instances[name] = instance;

    // Finally, return the now properly config'ed instance of AR.
    return instance;
  };

  // Convenience, for getting a particular instance,
  // because `require('active-record').instance('pg')` looks
  // much nicer than `require('active-record').Instances.pg`
  ActiveRecord.instance = function(name) {
    return ActiveRecord.Instances[name];
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