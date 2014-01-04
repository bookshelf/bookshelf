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
        for(var virtualName in virtuals) {
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
    toJSON: function (options) {
      var attrs = proto.toJSON.call(this, options);

      var includeVirtuals = this.outputVirtuals;
      var includeVirtualsOpts = options && options.virtuals;

      includeVirtuals = (includeVirtuals && includeVirtuals === true);
      includeVirtualsOpts = _.isBoolean(includeVirtualsOpts) ? includeVirtualsOpts : includeVirtuals;

      if (includeVirtuals && includeVirtualsOpts) {
        var virtuals = this.virtuals;
        var getter;
        if (_.isObject(virtuals)) {
          for(var virtualName in virtuals) {
            attrs[virtualName] =  virtuals[virtualName].get ? virtuals[virtualName].get.call(this) : virtuals[virtualName].call(this);
          }
        }
      }

      return attrs;
    },

    // Allow virtuals to be fetched like normal properties
    get: function (attr) {
      var virtuals = this.virtuals;
      if (virtuals && virtuals[attr]) {
        return virtuals[attr].get ? virtuals[attr].get.call(this) : virtuals[attr].call(this);
      }

      return proto.get.apply(this, arguments);
    },

    // Allow virtuals to be set like normal properties
    set: function (key, val, options) {
      if (key == null) return this;

      var virtuals = this.virtuals;
      var virtual = virtuals && virtuals[key];
      if (virtual && virtual.set) {
        virtual.set.call(this, val);
        return this;
      }

      return proto.set.apply(this, arguments);
    }
  });
  
  var slice = [].slice;
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // override the `underscore` methods to work with the virtuals
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      var attrs = _.clone(this.attributes);
      var virtuals = this.virtuals;

      if (virtuals) {
        for (var virtualName in virtuals) {
          attrs[virtualName] = virtuals[virtualName].get ? virtuals[virtualName].get.call(this) : virtuals[virtualName].call(this);
        }
      }

      args.unshift(attrs);
      return _[method].apply(_, args);
    };
  });
  
  Bookshelf.Model = Model;
};
