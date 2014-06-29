// Base Model
// ---------------
var _        = require('lodash');
var Backbone = require('backbone');

var Events   = require('./events');
var Promise  = require('./promise');

// A list of properties that are omitted from the `Backbone.Model.prototype`, to create
// a generic model base.
var modelOmitted = [
  'changedAttributes', 'isValid', 'validationError',
  'save', 'sync', 'fetch', 'destroy', 'url',
  'urlRoot', '_validate'
];

// List of attributes attached directly from the `options` passed to the constructor.
var modelProps = ['tableName', 'hasTimestamps'];

// The "ModelBase" is similar to the 'Active Model' in Rails,
// it defines a standard interface from which other objects may
// inherit.
var ModelBase = function(attributes, options) {
  var attrs = attributes || {};
  options || (options = {});
  this.attributes = Object.create(null);
  this._reset();
  this.relations = {};
  this.cid  = _.uniqueId('c');
  if (options) {
    _.extend(this, _.pick(options, modelProps));
    if (options.parse) attrs = this.parse(attrs, options) || {};
  }
  this.set(attrs, options);
  this.initialize.apply(this, arguments);
};

_.extend(ModelBase.prototype, _.omit(Backbone.Model.prototype, modelOmitted), Events, {

  // Similar to the standard `Backbone` set method, but without individual
  // change events, and adding different meaning to `changed` and `previousAttributes`
  // defined as the last "sync"'ed state of the model.
  set: function(key, val, options) {
    if (key == null) return this;
    var attrs;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }
    options || (options = {});

    // Extract attributes and options.
    var hasChanged = false;
    var unset   = options.unset;
    var current = this.attributes;
    var prev    = this._previousAttributes;

    // Check for changes of `id`.
    if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

    // For each `set` attribute, update or delete the current value.
    for (var attr in attrs) {
      val = attrs[attr];
      if (!_.isEqual(prev[attr], val)) {
        this.changed[attr] = val;
        if (!_.isEqual(current[attr], val)) hasChanged = true;
      } else {
        delete this.changed[attr];
      }
      unset ? delete current[attr] : current[attr] = val;
    }

    if (hasChanged && !options.silent) this.trigger('change', this, options);
    return this;
  },

  // Returns an object containing a shallow copy of the model attributes,
  // along with the `toJSON` value of any relations,
  // unless `{shallow: true}` is passed in the `options`.
  // Also includes _pivot_ keys for relations unless `{omitPivot: true}` 
  // is passed in `options`.
  toJSON: function(options) {
    var attrs = _.extend({}, this.attributes);
    if (options && options.shallow) return attrs;
    var relations = this.relations;
    for (var key in relations) {
      var relation = relations[key];
      attrs[key] = relation.toJSON ? relation.toJSON(options) : relation;
    }
    if (options && options.omitPivot) return attrs;
    if (this.pivot) {
      var pivot = this.pivot.attributes;
      for (key in pivot) {
        attrs['_pivot_' + key] = pivot[key];
      }
    }
    return attrs;
  },

  // **parse** converts a response into the hash of attributes to be `set` on
  // the model. The default implementation is just to pass the response along.
  parse: function(resp, options) {
    return resp;
  },

  // **format** converts a model into the values that should be saved into
  // the database table. The default implementation is just to pass the data along.
  format: function(attrs, options) {
    return attrs;
  },

  // Returns the related item, or creates a new
  // related item by creating a new model or collection.
  related: function(name) {
    return this.relations[name] || (this[name] ? this.relations[name] = this[name]() : void 0);
  },

  // Create a new model with identical attributes to this one,
  // including any relations on the current model.
  clone: function() {
    var model = new this.constructor(this.attributes);
    var relations = this.relations;
    for (var key in relations) {
      model.relations[key] = relations[key].clone();
    }
    model._previousAttributes = _.clone(this._previousAttributes);
    model.changed = _.clone(this.changed);
    return model;
  },

  // Sets the timestamps before saving the model.
  timestamp: function(options) {
    var d = new Date();
    var keys = (_.isArray(this.hasTimestamps) ? this.hasTimestamps : ['created_at', 'updated_at']);
    var vals = {};
    if (keys[1]) vals[keys[1]] = d;
    if (this.isNew(options) && keys[0] && (!options || options.method !== 'update')) vals[keys[0]] = d;
    return vals;
  },

  // Called after a `sync` action (save, fetch, delete) -
  // resets the `_previousAttributes` and `changed` hash for the model.
  _reset: function() {
    this._previousAttributes = _.extend(Object.create(null), this.attributes);
    this.changed = Object.create(null);
    return this;
  },

  fetch: function() {},

  save: function() {},

  // Destroy a model, calling a "delete" based on its `idAttribute`.
  // A "destroying" and "destroyed" are triggered on the model before
  // and after the model is destroyed, respectively. If an error is thrown
  // during the "destroying" event, the model will not be destroyed.
  destroy: Promise.method(function(options) {
    options = options ? _.clone(options) : {};
    var sync = this.sync(options);
    options.query = sync.query;
    return Promise.bind(this).then(function() {
      return this.triggerThen('destroying', this, options);
    }).then(function() {
      return sync.del();
    }).then(function(resp) {
      this.clear();
      return this.triggerThen('destroyed', this, resp, options);
    }).then(this._reset);
  })

});

ModelBase.extend = require('simple-extend');

module.exports = ModelBase;
