// Virtuals Plugin
// Allows getting/setting virtual (computed) properties on model instances.
// -----
module.exports = function (Bookshelf) {
  "use strict";
  var _         = require('lodash');
  var proto     = Bookshelf.Model.prototype;

  var Model = Bookshelf.Model.extend({
    outputVirtuals: true,

    // If virtual properties have been defined they will be created
    // as simple getters on the model.
    constructor: function (attributes, options) {
      proto.constructor.apply(this, arguments);
      var virtuals = this.virtuals;
      if (_.isObject(virtuals)) {
        for (var virtualName in virtuals) {
          var getter, setter;
          if (virtuals[virtualName].get) {
            getter = virtuals[virtualName].get;
            setter = virtuals[virtualName].set ? virtuals[virtualName].set : undefined;
          } else {
            getter = virtuals[virtualName];
          }
          Object.defineProperty(this, virtualName, {
            enumerable: true,
            get: getter,
            set: setter
          });
        }
      }
    },

    // Passing `{virtuals: true}` or `{virtuals: false}` in the `options`
    // controls including virtuals on function-level and overrides the
    // model-level setting
    toJSON: function(options) {
      var attrs = proto.toJSON.call(this, options);
      if (!options || options.virtuals !== false) {
        if ((options && options.virtuals === true) || this.outputVirtuals) {
          attrs = _.extend(attrs, getVirtuals(this));
        }
      }
      return attrs;
    },

    // Allow virtuals to be fetched like normal properties
    get: function (attr) {
      var virtuals = this.virtuals;
      if (_.isObject(virtuals) && virtuals[attr]) {
        return getVirtual(this, attr);
      }
      return proto.get.apply(this, arguments);
    },

    // Allow virtuals to be set like normal properties
    set: function(key, val, options) {
      if (key == null) {
        return this;
      }
      if (_.isObject(key)) {
        return proto.set.call(this, _.omit(key, setVirtual, this), val, options);
      }
      if (setVirtual.call(this, val, key)) {
        return this;
      }
      return proto.set.apply(this, arguments);
    }
  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = _.toArray(arguments);
      args.unshift(_.extend({}, this.attributes, getVirtuals(this)));
      return _[method].apply(_, args);
    };
  });

  function getVirtual(model, virtualName) {
    var virtuals = model.virtuals;
    if (_.isObject(virtuals) && virtuals[virtualName]) {
      return virtuals[virtualName].get ? virtuals[virtualName].get.call(model)
        : virtuals[virtualName].call(model);
    }
  }

  function getVirtuals(model) {
    var virtuals, attrs = {};
    if (virtuals = model.virtuals) {
      for (var virtualName in virtuals) {
        attrs[virtualName] = getVirtual(model, virtualName);
      }
    }
    return attrs;
  }

  function setVirtual(value, key) {
    var virtual = this.virtuals && this.virtuals[key];
    if (virtual && virtual.set) {
      virtual.set.call(this, value);
      return true;
    }
  }

  Bookshelf.Model = Model;
};