import _ from 'lodash';

// Visibility plugin -
// Useful for hiding/showing particular attributes on `toJSON`.
// -----
module.exports = function(Bookshelf) {
  const proto  = Bookshelf.Model.prototype;
  const toJSON = proto.toJSON;

  const Model = Bookshelf.Model.extend({

    // Replace with an array of properties to blacklist on `toJSON`.
    hidden: null,

    // Replace with an array of properties to whitelist on `toJSON`.
    visible: null,

    // If `visible` or `hidden` are specified in the `options` hash,
    // they're assumed to override whatever is on the model's prototype.
    constructor: function() {
      proto.constructor.apply(this, arguments);
      const options = arguments[1] || {};
      if (options.visible) {
        this.visible = _.clone(options.visible);
      }
      if (options.hidden) {
        this.hidden = _.clone(options.hidden);
      }
    },

    // Checks the `visible` and then `hidden` properties to see if there are
    // any keys we don't want to show when the object is json-ified.
    toJSON: function() {
      let json = toJSON.apply(this, arguments);
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
