// Virtuals Plugin
// Allows getting/setting virtual (computed) properties on model instances.
// -----
module.exports = function (Bookshelf) {
  "use strict";
  var _         = require('lodash');
  var Promise   = require('bluebird');
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
    set: function(key, value, options) {

      if (key == null) {
        return this;
      }

      // Determine whether we're in the middle of a patch operation based on the 
      // existance of the `patchAttributes` object.
      var isPatching = this.patchAttributes != null;

      // Handle `{key: value}` style arguments.
      if (_.isObject(key)) {
        var nonVirtuals = _.omit(key, setVirtual, this);
        if (isPatching) {
          _.extend(this.patchAttributes, nonVirtuals);
        }
        // Set the non-virtual attributes as normal.
        return proto.set.call(this, nonVirtuals, value, options);
      }

      // Handle `"key", value` style arguments.
      if (setVirtual.call(this, value, key)) {
        if (isPatching) {
          this.patchAttributes[key] = value;
        }
        return this;
      }
      return proto.set.apply(this, arguments);
    },

    // Override `save` to keep track of state while doing a `patch` operation.
    save: function(key, value, options) {
      var attrs;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === "object") {
        attrs = key && _.clone(key) || {};
        options = _.clone(value) || {};
      } else {
        (attrs = {})[key] = value;
        options = options ? _.clone(options) : {};
      }

      // Determine whether which kind of save we will do, update or insert.
      var method = options.method = this.saveMethod(options);

      // Check if we're going to do a patch, in which case deal with virtuals now.
      if (options.method === 'update' && options.patch) {

         // Extend the model state to collect side effects from the virtual setter
         // callback. If `set` is called, this object will be updated in addition
         // to the normal `attributes` object.
         this.patchAttributes = {}

         // Any setter could throw. We need to reject `save` if they do.
         try {

           // Check if any of the patch attribues are virtuals. If so call their
           // setter. Any setter that calls `this.set` will be modifying
           // `this.patchAttributes` instead of `this.attributes`.
           _.each(attrs, (function (value, key) {

             if (setVirtual.call(this, value, key)) {
               // This was a virtual, so remove it from the attributes to be
               // passed to `Model.save`.
               delete attrs[key];
             }

           }).bind(this));

           // Now add any changes that occurred during the update.
           _.extend(attrs, this.patchAttributes);
         } catch (e) {
           return Promise.reject(e);
         } finally {
           // Delete the temporary object.
           delete this.patchAttributes;
         }
      }

      return proto.save.call(this, attrs, options);
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
    if (virtual) {
      if (virtual.set) {
        virtual.set.call(this, value);
      }
      return true;
    }
  }

  Bookshelf.Model = Model;
};
