var _       = require('lodash');

module.exports = function (Bookshelf) {

  var proto = Bookshelf.Model.prototype;

  var Model = Bookshelf.Model.extend({

    set: function (key, value, options) {
      if (!key) {
        return this;
      }
      var attrs, value;
      if (_.isObject(key)) {
        attrs = key;
        options = value;
      } else {
        (attrs = {})[key] = value;
      }
      if (this.cast) {
        var cast;
        for (var attr in attrs) {
          if (cast = _cast(this, attr, attrs[attr])) {
            attrs[attr] = cast;
          }
        }
      }
      return proto.set.call(this, attrs, options);
    },

  });

  Bookshelf.Model = Model;

}

function _cast (model, attr, value) {
  if (!value) return;
  var cast = model.cast[attr];
  if (cast) return cast(value);
}
