'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Virtuals Plugin
// Allows getting/setting virtual (computed) properties on model instances.
// -----
module.exports = function (Bookshelf) {

  var proto = Bookshelf.Model.prototype;
  var Model = Bookshelf.Model.extend({
    outputVirtuals: true,

    // If virtual properties have been defined they will be created
    // as simple getters on the model.
    constructor: function constructor(attributes, options) {
      proto.constructor.apply(this, arguments);
      var virtuals = this.virtuals;

      if (_lodash2.default.isObject(virtuals)) {
        for (var virtualName in virtuals) {
          var getter = void 0,
              setter = void 0;
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
    toJSON: function toJSON(options) {
      var attrs = proto.toJSON.call(this, options);
      if (!options || options.virtuals !== false) {
        if (options && options.virtuals === true || this.outputVirtuals) {
          attrs = _lodash2.default.extend(attrs, getVirtuals(this));
        }
      }
      return attrs;
    },

    // Allow virtuals to be fetched like normal properties
    get: function get(attr) {
      var virtuals = this.virtuals;

      if (_lodash2.default.isObject(virtuals) && virtuals[attr]) {
        return getVirtual(this, attr);
      }
      return proto.get.apply(this, arguments);
    },

    // Allow virtuals to be set like normal properties
    set: function set(key, value, options) {

      if (key == null) {
        return this;
      }

      // Determine whether we're in the middle of a patch operation based on the
      // existance of the `patchAttributes` object.
      var isPatching = this.patchAttributes != null;

      // Handle `{key: value}` style arguments.
      if (_lodash2.default.isObject(key)) {
        var nonVirtuals = _lodash2.default.omitBy(key, _lodash2.default.bind(setVirtual, this));
        if (isPatching) {
          _lodash2.default.extend(this.patchAttributes, nonVirtuals);
        }
        // Set the non-virtual attributes as normal.
        return proto.set.call(this, nonVirtuals, options);
      }

      // Handle `"key", value` style arguments for virtual setter.
      if (setVirtual.call(this, value, key)) {
        return this;
      }

      // Handle `"key", value` style assignment call to be added to patching
      // attributes if set("key", value, ...) called from inside a virtual setter.
      if (isPatching) {
        this.patchAttributes[key] = value;
      }

      return proto.set.apply(this, arguments);
    },

    // Override `save` to keep track of state while doing a `patch` operation.
    save: function save(key, value, options) {
      var attrs = void 0;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || (typeof key === 'undefined' ? 'undefined' : (0, _typeof3.default)(key)) === "object") {
        attrs = key && _lodash2.default.clone(key) || {};
        options = _lodash2.default.clone(value) || {};
      } else {
        (attrs = {})[key] = value;
        options = options ? _lodash2.default.clone(options) : {};
      }

      // Determine whether which kind of save we will do, update or insert.
      options.method = this.saveMethod(options);

      // Check if we're going to do a patch, in which case deal with virtuals now.
      if (options.method === 'update' && options.patch) {

        // Extend the model state to collect side effects from the virtual setter
        // callback. If `set` is called, this object will be updated in addition
        // to the normal `attributes` object.
        this.patchAttributes = {};

        // Any setter could throw. We need to reject `save` if they do.
        try {

          // Check if any of the patch attribues are virtuals. If so call their
          // setter. Any setter that calls `this.set` will be modifying
          // `this.patchAttributes` instead of `this.attributes`.
          _lodash2.default.each(attrs, function (value, key) {

            if (setVirtual.call(this, value, key)) {
              // This was a virtual, so remove it from the attributes to be
              // passed to `Model.save`.
              delete attrs[key];
            }
          }.bind(this));

          // Now add any changes that occurred during the update.
          _lodash2.default.extend(attrs, this.patchAttributes);
        } catch (e) {
          return _bluebird2.default.reject(e);
        } finally {
          // Delete the temporary object.
          delete this.patchAttributes;
        }
      }

      return proto.save.call(this, attrs, options);
    }
  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'toPairs', 'invert', 'pick', 'omit'];

  // Mix in each Lodash method as a proxy to `Model#attributes`.
  _lodash2.default.each(modelMethods, function (method) {
    Model.prototype[method] = function () {
      return _lodash2.default[method].apply(_lodash2.default, [_lodash2.default.extend({}, this.attributes, getVirtuals(this))].concat(Array.prototype.slice.call(arguments)));
    };
  });

  function getVirtual(model, virtualName) {
    var virtuals = model.virtuals;

    if (_lodash2.default.isObject(virtuals) && virtuals[virtualName]) {
      return virtuals[virtualName].get ? virtuals[virtualName].get.call(model) : virtuals[virtualName].call(model);
    }
  }

  function getVirtuals(model) {
    var virtuals = model.virtuals;

    var attrs = {};
    if (virtuals != null) {
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