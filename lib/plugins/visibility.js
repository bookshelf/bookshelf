'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Visibility plugin -
// Useful for hiding/showing particular attributes on `toJSON`.
// -----
module.exports = function (Bookshelf) {
  var proto = Bookshelf.Model.prototype;
  var _toJSON = proto.toJSON;

  var Model = Bookshelf.Model.extend({

    // Replace with an array of properties to blacklist on `toJSON`.
    hidden: null,

    // Replace with an array of properties to whitelist on `toJSON`.
    visible: null,

    // If `visible` or `hidden` are specified in the `options` hash,
    // they're assumed to override whatever is on the model's prototype.
    constructor: function constructor() {
      proto.constructor.apply(this, arguments);
      var options = arguments[1] || {};
      if (options.visible) {
        this.visible = (0, _lodash.clone)(options.visible);
      }
      if (options.hidden) {
        this.hidden = (0, _lodash.clone)(options.hidden);
      }
    },

    // Checks the `visible` and then `hidden` properties to see if there are
    // any keys we don't want to show when the object is json-ified.
    toJSON: function toJSON() {
      var json = _toJSON.apply(this, arguments);
      if (this.visible) {
        json = _lodash.pick.apply(undefined, (0, _toConsumableArray3.default)([json].concat(this.visible)));
      }
      if (this.hidden) {
        json = _lodash.omit.apply(undefined, (0, _toConsumableArray3.default)([json].concat(this.hidden)));
      }
      return json;
    }

  });

  Bookshelf.Model = Model;
};