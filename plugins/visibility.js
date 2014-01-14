module.exports = function(Bookshelf) {
  "use strict";
  var _      = require('lodash');
  var proto  = Bookshelf.Model.prototype;
  var toJSON = proto.toJSON;

  var Model = Bookshelf.Model.extend({

    constructor: function() {
      proto.constructor.apply(this, arguments);
      var options = arguments[1] || {};
      if (options.visible) {
        this.visible = _.clone(options.visible);
      }
      if (options.hidden) {
        this.hidden = _.clone(options.hidden);
      }
    },

    toJSON: function() {
      var json = toJSON.apply(this, arguments);
      if (this.visible) {
        json = _.pick.apply(_, [json].concat(this.visible));
      }
      if (this.hidden) {
        json = _.omit.apply(_, [json].concat(this.hidden));
      }
      return json;
    }

  });

  Bookshelf.Model = Model;
};