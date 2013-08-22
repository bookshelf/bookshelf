(function(define) { "use strict";

define(function(require, exports, module) {

  // All external dependencies are referenced through a local module,
  // so that you can modify the `exports` and say... swap out `underscore`
  // for `lodash` if you really wanted to.
  var _           = require('./ext/underscore')._;
  var Backbone    = require('./ext/backbone').Backbone;
  var Events      = require('./events').Events;

  // A dummy constructor, for setting up an object inherited by the `Bookshelf.Model`, but providing
  // a valid instanceof check in the `Relation` and `Collection` modules.
  var ModelBase = function() {};

  // A list of properties that are omitted from the `Backbone.Model.prototype`, since we're not
  // handling validations, or tracking changes in the same fashion as `Backbone`, we can drop these
  // specific methods.
  var modelOmitted = ['changedAttributes', 'isValid', 'validationError', '_validate'];

  // Mixin the modified `Events` and selected `Backbone` methods into the `ModelBase` prototype.
  _.extend(ModelBase.prototype, _.omit(Backbone.Model.prototype, modelOmitted), Events);

  // Provide a standard `extend` on the ModelBase, for convenience.
  ModelBase.extend = Backbone.Model.extend;

  exports.ModelBase = ModelBase;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);