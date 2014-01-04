module.exports = function (Bookshelf) {
  "use strict";
  var _         = require('lodash');
  var proto     = Bookshelf.Model.prototype;
  
  function getVirtual(model, virtualName) {
    var virtuals = _.isObject(model.virtuals) ? model.virtuals : {};
    
    if (typeof virtuals[virtualName] === 'undefined') {
      return undefined;
    }

    return virtuals[virtualName].get ? virtuals[virtualName].get.call(model) : virtuals[virtualName].call(model);
  }

  function getVirtuals(model) {
    if (!_.isObject(model.virtuals)) {
      return {};
    }

    var attrs = {};
    var virtuals = model.virtuals;

    for (var virtualName in virtuals) {
      attrs[virtualName] = getVirtual(model, virtualName);
    }

    return attrs;
  }

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
        attrs = _.merge(attrs, getVirtuals(this));
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
  
  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {

      if (!_.isObject(this.virtuals)) {
        return Bookshelf.Model.prototype[method].apply(this, arguments);
      }

      var args = _.toArray(arguments);
      var virtuals = getVirtuals(this);

      args.unshift(_.merge({}, this.attributes, virtuals));

      return _[method].apply(_, args);
    };
  });

  Bookshelf.Model = Model;
};
