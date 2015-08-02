// Base Model
// ---------------
var _        = require('lodash');
var inherits = require('inherits');

var Events   = require('./events');
var slice    = Array.prototype.slice

// List of attributes attached directly from the `options` passed to the constructor.
var modelProps = ['tableName', 'hasTimestamps'];

/**
 * @class
 * @classdesc
 *
 * The "ModelBase" is similar to the 'Active Model' in Rails, it defines a
 * standard interface from which other objects may inherit.
 */
function ModelBase(attributes, options) {
  var attrs = attributes || {};
  options   = options    || {};
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
}
inherits(ModelBase, Events);

ModelBase.prototype.initialize = function() {};

/**
 * @name ModelBase#tableName
 * @member {string} 
 * @description
 *
 * A required property for any database usage, The
 * {@linkcode Model#tableName tableName} property refers to the database
 * table name the model will query against.
 *
 * @example
 *
 * var Television = bookshelf.Model.extend({
 *   tableName: 'televisions'
 * });
 */

/**
 * @member {string}
 * @default "id"
 * @description
 *
 * This tells the model which attribute to expect as the unique identifier
 * for each database row (typically an auto-incrementing primary key named
 * `"id"`). Note that if you are using {@link Model#parse parse} and {@link
 * Model#format format} (to have your model's attributes in `camelCase`,
 * but your database's columns in `snake_case`, for example) this refers to
 * the name returned by parse (`myId`), not the database column (`my_id`).
 *
 */
ModelBase.prototype.idAttribute = 'id';

/**
 * @method
 * @description  Get the current value of an attribute from the model.
 * @example      note.get("title")
 *
 * @param {string} attribute - The name of the attribute to retrieve.
 * @returns {mixed} Attribute value.
 */
ModelBase.prototype.get = function(attr) {
  return this.attributes[attr];
};

/**
 * @method
 * @description  Set a hash of attributes (one or many) on the model.
 * @example
 *
 * customer.set({first_name: "Joe", last_name: "Customer"});
 * customer.set("telephone", "555-555-1212");
 *
 * @param {string|Object} attribute Attribute name, or hash of attribute names and values.
 * @param {mixed=} value If a string was provided for `attribute`, the value to be set.
 * @param {Object=} options
 * @param {Object} [options.unset=false] Remove attributes instead of setting them.
 * @returns {Model} This model.
 */
ModelBase.prototype.set = function(key, val, options) {
  if (key == null) return this;
  var attrs;

  // Handle both `"key", value` and `{key: value}` -style arguments.
  if (typeof key === 'object') {
    attrs = key;
    options = val;
  } else {
    (attrs = {})[key] = val;
  }
  options = _.clone(options) || {};

  // Extract attributes and options.
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
    } else {
      delete this.changed[attr];
    }
    if (unset) {
      delete current[attr]
    } else {
      current[attr] = val
    }
  }
  return this;
};

/**
 * @method
 * @description
 *
 * Checks for the existence of an id to determine whether the model is
 * considered "new".
 *
 * @example
 *
 * var modelA = new bookshelf.Model();
 * modelA.isNew(); // true
 * 
 * var modelB = new bookshelf.Model({id: 1});
 * modelB.isNew(); // false
 */
ModelBase.prototype.isNew = function() {
  return this.id == null;
};

/**
 * @method
 * @description
 *
 * Return a copy of the model's {@link ModelBase#attributes attributes} for JSON
 * stringification. If the {@link Model model} has any relations defined, this
 * will also call {@link ModelBase ModelBase#toJSON} on each of the related
 * objects, and include them on the object unless `{shallow: true}` is
 * passed as an option.
 *
 * `serialize` is called internally by {@link ModelBase#toJSON toJSON}. Override
 * this function if you want to customize its output.
 *
 * @example
 * var artist = new bookshelf.Model({
 *   firstName: "Wassily",
 *   lastName: "Kandinsky"
 * });
 *
 * artist.set({birthday: "December 16, 1866"});
 *
 * console.log(JSON.stringify(artist));
 * // {firstName: "Wassily", lastName: "Kandinsky", birthday: "December 16, 1866"}
 *
 * @param {Object=} options
 * @param {bool}    [options.shallow=false]   Exclude relations.
 * @param {bool}    [options.omitPivot=false] Exclude pivot values.
 * @returns {Object} Serialized model as a plain object.
 */
ModelBase.prototype.serialize = function(options) {
  var attrs = _.clone(this.attributes);
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
}

/**
 * @method
 * @description
 *
 * Called automatically by {@link
 * https://developer.mozilla.org/en-US/docs/Glossary/JSON#toJSON()_method
 * `JSON.stringify`}. To customize serialization, override {@link
 * BaseModel#serialize serialize}.
 *
 * @param {Object=} options Options passed to {@link BaseModel#serialize}.
 */
ModelBase.prototype.toJSON = function(options) {
  return this.serialize(options)
};

/**
 * @method
 * @private
 * @returns String representation of the object.
 */
ModelBase.prototype.toString = function() {
  return '[Object Model]';
};

/**
 * @method
 * @description Get the HTML-escaped value of an attribute.
 * @param {string} attribute The attribute to escape.
 * @returns {string} HTML-escaped value of an attribute.
 */
ModelBase.prototype.escape = function(key) {
  return _.escape(this.get(key));
};

/**
 * @method
 * @description
 * Returns `true` if the attribute contains a value that is not null or undefined.
 * @param {string} attribute The attribute to check.
 * @returns {bool} True if `attribute` is set, otherwise null.
 */
ModelBase.prototype.has = function(attr) {
  return this.get(attr) != null;
};

/**
 * @method
 * @description
 *
 * The parse method is called whenever a {@link Model model}'s data is returned
 * in a {@link Model#fetch fetch} call. The function is passed the raw database
 * response object, and should return the {@link ModelBase#attributes
 * attributes} hash to be {@link ModelBase#set set} on the model. The default
 * implementation is a no-op, simply passing through the JSON response.
 * Override this if you need to format the database responses - for example
 * calling {@link
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
 * JSON.parse} on a text field containing JSON, or explicitly typecasting a
 * boolean in a sqlite3 database response.
 *
 * @example
 *
 * // Example of a "parse" to convert snake_case to camelCase, using `underscore.string`
 * model.parse = function(attrs) {
 *   return _.reduce(attrs, function(memo, val, key) {
 *     memo[_.str.camelize(key)] = val;
 *     return memo;
 *   }, {});
 * };
 *
 * @param {Object} response Hash of attributes to parse.
 * @returns {Object} Parsed attributes.
 */
ModelBase.prototype.parse = function(resp) {
  return resp;
};

/**
 * @method
 * @description
 *
 * Remove an attribute from the model. `unset` is a noop if the attribute
 * doesn't exist.
 *
 * @param attribute Attribute to unset.
 * @returns {Model} This model.
 */
ModelBase.prototype.unset = function(attr, options) {
  return this.set(attr, void 0, _.extend({}, options, {unset: true}));
};

/**
 * @method
 * @description Clear all attributes on the model.
 * @returns {Model} This model.
 */
ModelBase.prototype.clear = function(options) {
  var attrs = {};
  for (var key in this.attributes) attrs[key] = void 0;
  return this.set(attrs, _.extend({}, options, {unset: true}));
};

/**
 * @method
 * @description
 *
 * The `format` method is used to modify the current state of the model before
 * it is persisted to the database. The `attributes` passed are a shallow clone
 * of the {@link Model model}, and are only used for inserting/updating - the
 * current values of the model are left intact.
 *
 * @param {Object} attributes The attributes to be converted.
 * @returns {Object} Formatted attributes.
 */
ModelBase.prototype.format = function(attrs) {
  return attrs;
};

/**
 * @method
 * @description
 *
 * The `related` method returns a specified relation loaded on the relations
 * hash on the model, or calls the associated relation method and adds it to
 * the relations hash if one exists and has not yet been loaded.
 *
 * @example
 *
 * new Photo({id: 1}).fetch({
 *   withRelated: ['account']
 * }).then(function(photo) {
 *   if (photo) {
 *     var account = photo.related('account');
 *     if (account.id) {
 *        return account.related('trips').fetch();
 *     }
 *   }
 * });
 *
 * @returns {Model|Collection|undefined} The specified relation as defined by a
 *   method on the model, or undefined if it does not exist.
 */
ModelBase.prototype.related = function(name) {
  return this.relations[name] || (this[name] ? this.relations[name] = this[name]() : void 0);
};

/**
 * @method
 * @description
 * Returns a new instance of the model with identical {@link
 * ModelBase#attributes attributes}, including any relations from the cloned
 * model.
 *
 * @returns {Model} Cloned instance of this model.
 */
ModelBase.prototype.clone = function() {
  var model = new this.constructor(this.attributes);
  var relations = this.relations;
  for (var key in relations) {
    model.relations[key] = relations[key].clone();
  }
  model._previousAttributes = _.clone(this._previousAttributes);
  model.changed = _.clone(this.changed);
  return model;
};

/**
 * @method
 * @private
 * @description
 *
 * Returns the method that will be used on save, either 'update' or 'insert'.
 * This is an internal helper that uses `isNew` and `options.method` to
 * determine the correct method. If `option.method` is provided, it will be
 * returned, but lowercased for later comparison.
 *
 * @returns {string} Either `'insert'` or `'update'`.
 */
ModelBase.prototype.saveMethod = function(options) {
  var method = options && options.method && options.method.toLowerCase();
  return method || (this.isNew(options) ? 'insert' : 'update');
};

/**
 * @method
 * @description
 * Sets the timestamp attributes on the model, if {@link Model#hasTimestamps
 * hasTimestamps} is set to `true` or an array. Check if the model {@link
 * Model#isNew isNew} or if `{method: 'insert'}` is provided as an option and
 * set the `created_at` and `updated_at` attributes to the current date if it
 * is being inserted, and just the `updated_at` attribute if it's being updated.
 * This method may be overriden to use different column names or types for the
 * timestamps.
 *
 * @param {Object=} options
 * @param {string} [options.method="update"]
 *   Either `'insert'` or `'update'`. Specify what kind of save the attribute
 *   update is for.
 *
 * @returns {Object} A hash of timestamp attributes that were set.
 */
ModelBase.prototype.timestamp = function(options) {
  if (!this.hasTimestamps) return {};

  var now          = new Date();
  var attributes   = {};
  var method       = this.saveMethod(options);
  var keys         = _.isArray(this.hasTimestamps) ? this.hasTimestamps : ['created_at', 'updated_at'];
  var createdAtKey = keys[0];
  var updatedAtKey = keys[1];

  if (updatedAtKey) {
    attributes[updatedAtKey] = now;
  }

  if (createdAtKey && method === 'insert') {
    attributes[createdAtKey] = now;
  }

  this.set(attributes, options);

  return attributes;
};

/**
 * @method
 * @description
 *
 * Returns true if any {@link Model#attributes attribute} attribute has changed
 * since the last {@link Model#fetch fetch}, {@link Model#save save}, or {@link
 * Model#destroy destroy}. If an attribute is passed, returns true only if that
 * specific attribute has changed.
 *
 * @param {string=} attribute 
 * @returns {bool}
 * `true` if any attribute has changed. Or, if `attribute` was specified, true
 * if it has changed.
 */
ModelBase.prototype.hasChanged = function(attr) {
  if (attr == null) return !_.isEmpty(this.changed);
  return _.has(this.changed, attr);
};

/**
 * @method
 * @description
 *
 * Returns the this previous value of a changed {@link Model#attributes
 * attribute}, or `undefined` if one had not been specified previously.
 *
 * @param {string} attribute The attribute to check
 * @returns {mixed} The previous value
 */
ModelBase.prototype.previous = function(attr) {
  if (attr == null || !this._previousAttributes) return null;
  return this._previousAttributes[attr];
};

/**
 * @method
 * @description
 *
 * Return a copy of the {@link Model model}'s previous attributes from the
 * model's last {@link Model#fetch fetch}, {@link Model#save save}, or {@link
 * Model#destroy destroy}. Useful for getting a diff between versions of a
 * model, or getting back to a valid state after an error occurs.
 *
 * @returns {Object} The attributes as they were before the last change.
 */
ModelBase.prototype.previousAttributes = function() {
  return _.clone(this._previousAttributes);
};

/**
 * @method
 * @private
 * @description
 *
 * Resets the `_previousAttributes` and `changed` hash for the model.
 * Typically called after a `sync` action (save, fetch, delete) -
 *
 * @returns {Model} This model.
 */
ModelBase.prototype._reset = function() {
  this._previousAttributes = _.clone(this.attributes);
  this.changed = Object.create(null);
  return this;
};

/**
 * @method ModelBase#keys
 * @see http://lodash.com/docs/#keys
 */
/**
 * @method ModelBase#values
 * @see http://lodash.com/docs/#values
 */
/**
 * @method ModelBase#pairs
 * @see http://lodash.com/docs/#pairs
 */
/**
 * @method ModelBase#invert
 * @see http://lodash.com/docs/#invert
 */
/**
 * @method ModelBase#pick
 * @see http://lodash.com/docs/#pick
 */
/**
 * @method ModelBase#omit
 * @see http://lodash.com/docs/#omit
 */
// "_" methods that we want to implement on the Model.
var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

// Mix in each "_" method as a proxy to `Model#attributes`.
_.each(modelMethods, function(method) {
  ModelBase.prototype[method] = function() {
    var args = slice.call(arguments);
    args.unshift(this.attributes);
    return _[method].apply(_, args);
  };
});

/**
 * @method Model.extend
 * @description
 *
 * To create a Model class of your own, you extend {@link Model bookshelf.Model}.
 *
 * `extend` correctly sets up the prototype chain, so subclasses created with
 * `extend` can be further extended and subclassed as far as you like.
 *
 *     var checkit  = require('checkit');
 *     var Promise  = require('bluebird');
 *     var bcrypt   = Promise.promisifyAll(require('bcrypt'));
 *     
 *     var Customer = bookshelf.Model.extend({
 *     
 *       initialize: function() {
 *         this.on('saving', this.validateSave);
 *       },
 *     
 *       validateSave: function() {
 *         return checkit(rules).run(this.attributes);
 *       },
 *     
 *       account: function() {
 *         return this.belongsTo(Account);
 *       },
 *     
 *     }, {
 *     
 *       login: Promise.method(function(email, password) {
 *         if (!email || !password) throw new Error('Email and password are both required');
 *         return new this({email: email.toLowerCase().trim()}).fetch({require: true}).tap(function(customer) {
 *           return bcrypt.compareAsync(customer.get('password'), password);
 *         });
 *       })
 *     
 *     });
 *     
 *     Customer.login(email, password)
 *       .then(function(customer) {
 *         res.json(customer.omit('password'));
 *       }).catch(Customer.NotFoundError, function() {
 *         res.json(400, {error: email + ' not found'});
 *       }).catch(function(err) {
 *         console.error(err);
 *       });
 *
 * _Brief aside on `super`: JavaScript does not provide a simple way to call
 * `super` — the function of the same name defined higher on the prototype
 * chain. If you override a core function like {@link Model#set set}, or {@link
 * Model#save save}, and you want to invoke the parent object's implementation,
 * you'll have to explicitly call it, along these lines:_
 *
 *     var Customer = bookshelf.Model.extend({
 *       set: function() {
 *         ...
 *         bookshelf.Model.prototype.set.apply(this, arguments);
 *         ...
 *       }
 *     });
 *
 * @param {Object=} prototypeProperties
 *   Instance methods and properties to be attached to instances of the new
 *   class.
 * @param {Object=} classProperties
 *   Class (ie. static) functions and properties to be attached to the
 *   constructor of the new class.
 * @returns {Function} Constructor for new `Model` subclass.
 */
ModelBase.extend = require('../extend');

module.exports = ModelBase;
