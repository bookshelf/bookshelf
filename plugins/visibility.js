module.exports = function (Bookshelf) {
  "use strict";
  var _         = require('lodash');
  var proto     = Bookshelf.Model.prototype;

  var Model = Bookshelf.Model.extend({

    // Attributes are filtered based on
    // `this.hidden` or `this.visible`.
    toJSON: function(options) {
      var attrs = proto.toJSON.call(this, options);

      attrs =
       this.hidden ? _.omit(attrs, this.hidden) :
       this.visible ? _.pick(attrs, this.visible) :
       attrs;

      return attrs;
    },
  });

  Bookshelf.Model = Model;
};