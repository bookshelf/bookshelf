(function(define) { "use strict";

define(function(require, exports, module) {

  // All external dependencies are referenced through a local module,
  // so that you can modify the `exports` and say... swap out `underscore`
  // for `lodash` if you really wanted to.
  var _           = require('./ext/underscore')._;
  var Backbone    = require('./ext/backbone').Backbone;
  var Events      = require('./events').Events;

  // A dummy constructor, for setting up an object inherited by the `Bookshelf.Collection`, but providing
  // a valid instanceof check in the `Relation` and `Collection` modules.
  var CollectionBase = function() {};

  // A list of properties that are omitted from the `Backbone.Collection.prototype`.
  var collectionOmitted = ['model', 'set', 'fetch', 'create', 'sync', '_prepareModel'];

  // Mixin the modified `Events` and most `Backbone` methods into the `CollectionBase` prototype.
  _.extend(CollectionBase.prototype, _.omit(Backbone.Collection.prototype, collectionOmitted), Events);

  // Provide a standard `extend` on the CollectionBase, for convenience.
  CollectionBase.extend = Backbone.Collection.extend;

  exports.CollectionBase = CollectionBase;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);