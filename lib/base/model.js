// Base Model
// ---------------
'use strict';

const _ = require('lodash');
const inherits = require('util').inherits;
const Events = require('./events');
const constants = require('../constants');

// List of attributes attached directly from the `options` passed to the constructor.
const modelProps = ['tableName', 'hasTimestamps'];

/**
 * @class
 * @classdesc
 * @extends Events
 * @inheritdoc
 * @description
 *
 * The "ModelBase" is similar to the 'Active Model' in Rails, it defines a
 * standard interface from which other objects may inherit.
 */
function ModelBase(attributes, options) {
  let attrs = attributes || {};
  options = options || {};
  this.attributes = Object.create(null);
  this._previousAttributes = {};
  this._reset();
  this.relations = {};
  this.cid = _.uniqueId('c');
  if (options) {
    _.extend(this, _.pick(options, modelProps));
    if (options.parse) attrs = this.parse(attrs, options) || {};
  }
  this.set(attrs, options);
  this.initialize.apply(this, arguments);
}

/**
 * Registers an event listener.
 *
 * @method ModelBase#on
 * @example
 * customer.on('fetching', function(model) {
 *   // Do something before the data is fetched from the database
 * })
 * @see Events#on
 */

/**
 * @method ModelBase#off
 * @example
 *
 * customer.off('fetched fetching');
 * ship.off(); // This will remove all event listeners
 *
 * @see Events#off
 */

/**
 * @method ModelBase#trigger
 * @example
 *
 * ship.trigger('fetched');
 *
 * @see Events#trigger
 */
inherits(ModelBase, Events);

/**
 * @method ModelBase#initialize
 * @description
 *
 * Called by the {@link Model Model constructor} when creating a new instance.
 * Override this function to add custom initialization, such as event listeners.
 * Because plugins may override this method in subclasses, make sure to call
 * your super (extended) class.  e.g.
 *
 *     initialize: function() {
 *         this.constructor.__super__.initialize.apply(this, arguments);
 *         // Your initialization code ...
 *     }
 *
 * @see Model
 *
 * @param {Object} attributes
 *   Initial values for this model's attributes.
 * @param {Object=}  options
 *   The hash of options passed to {@link Model constructor}.
 */
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
 * `'id'`). Note that if you are using {@link Model#parse parse} and {@link
 * Model#format format} (to have your model's attributes in `camelCase`,
 * but your database's columns in `snake_case`, for example) this refers to
 * the name returned by parse (`myId`), not the actual database column
 * (`my_id`).
 *
 * You can also get the parsed id attribute value by using the model's
 * {@link Model#parsedIdAttribute parsedIdAttribute} method.
 *
 * If the table you're working with does not have a Primary-Key in the form
 * of a single column you'll have to override it with a getter that returns
 * `null`. Overriding with `undefined` does not cascade the default behavior of
 * the value `'id'`. Such a getter in ES6 would look like
 * `get idAttribute() { return null }`.
 */
ModelBase.prototype.idAttribute = 'id';

/**
 * @member {Object|Null}
 * @default null
 * @description
 *
 * This can be used to define any default values for attributes that are not
 * present when creating or updating a model in a {@link Model#save save} call.
 * The default behavior is to *not* use these default values on updates unless
 * the `defaults: true` option is passed to the {@link Model#save save} call.
 * For inserts the default values will always be used if present.
 *
 * @example
 *
 * var MyModel = bookshelf.Model.extend({
 *   defaults: {property1: 'foo', property2: 'bar'},
 *   tableName: 'my_table'
 * })
 *
 * MyModel.forge({property1: 'blah'}).save().then(function(model) {
 *   // {property1: 'blah', property2: 'bar'}
 * })
 */
ModelBase.prototype.defaults = null;

/**
 * @member {Boolean|Array}
 * @default false
 * @description
 *
 * Automatically sets the current date and time on the timestamp attributes
 * `created_at` and `updated_at` based on the type of save method. The *update*
 * method will only update `updated_at`, while the *insert* method will set
 * both values.
 *
 * To override the default attribute names, assign an array to this property.
 * The first element will be the *created* column name and the second will be
 * the *updated* one. If any of these elements is set to `null` that particular
 * timestamp attribute will not be used in the model. For example, to
 * automatically update only the `created_at` attribute set this property to
 * `['created_at', null]`.
 *
 * You can override the timestamp attribute values of a model and those values
 * will be used instead of the automatic ones when saving.
 *
 * @example
 *
 * var MyModel = bookshelf.Model.extend({
 *   hasTimestamps: true,
 *   tableName: 'my_table'
 * })
 *
 * var myModel = MyModel.forge({name: 'blah'}).save().then(function(savedModel) {
 *   // {
 *   //   name: 'blah',
 *   //   created_at: 'Sun Mar 25 2018 15:07:11 GMT+0100 (WEST)',
 *   //   updated_at: 'Sun Mar 25 2018 15:07:11 GMT+0100 (WEST)'
 *   // }
 * })
 *
 * myModel.save({created_at: new Date(2015, 5, 2)}).then(function(updatedModel) {
 *   // {
 *   //   name: 'blah',
 *   //   created_at: 'Tue Jun 02 2015 00:00:00 GMT+0100 (WEST)',
 *   //   updated_at: 'Sun Mar 25 2018 15:07:11 GMT+0100 (WEST)'
 *   // }
 * })
 */
ModelBase.prototype.hasTimestamps = false;

/**
 * @method
 * @private
 * @description
 *
 * Converts the timestamp keys to actual Date objects. This will not run if the
 * model doesn't have {@link Model#hasTimestamps hasTimestamps} set to either
 * `true` or an array of key names.
 * This method is run internally when reading data from the database to ensure
 * data consistency between the several database implementations.
 * It returns the model instance that called it, so it allows chaining of other
 * model methods.
 *
 * @returns {Model} The model that called this.
 */
ModelBase.prototype.formatTimestamps = function formatTimestamps() {
  if (!this.hasTimestamps) return this;

  this.getTimestampKeys().forEach((key) => {
    if (this.get(key)) this.set(key, new Date(this.get(key)));
  });

  return this;
};

/**
 * @method
 * @description  Get the current value of an attribute from the model.
 * @example      note.get("title");
 *
 * @param {string} attribute - The name of the attribute to retrieve.
 * @returns {mixed} Attribute value.
 */
ModelBase.prototype.get = function(attr) {
  return this.attributes[attr];
};

/**
 * @method
 * @private
 * @description
 *
 * Returns the model's {@link Model#idAttribute idAttribute} after applying the
 * model's {@link Model#parse parse} method to it. Doesn't mutate the original
 * value of {@link Model#idAttribute idAttribute} in any way.
 *
 * @example
 *
 * var Customer = bookshelf.Model.extend({
 *   idAttribute: 'id',
 *   parse: function(attrs) {
 *     return _.mapKeys(attrs, function(value, key) {
 *       return 'parsed_' + key;
 *     });
 *   }
 * });
 *
 * customer.parsedIdAttribute() // 'parsed_id'
 *
 * @returns {mixed} Whatever value the parse method returns.
 */
ModelBase.prototype.parsedIdAttribute = function() {
  var parsedAttributes = this.parse({[this.idAttribute]: null});
  return parsedAttributes && Object.keys(parsedAttributes)[0];
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
 * @param {Object} [options.unset=false] Remove attributes from the model instead of setting them.
 * @returns {Model} This model.
 */
ModelBase.prototype.set = function(key, val, options) {
  if (key == null) return this;
  let attrs;

  // Handle both `"key", value` and `{key: value}` -style arguments.
  if (typeof key === 'object') {
    attrs = key;
    options = val;
  } else {
    (attrs = {})[key] = val;
  }
  options = _.clone(options) || {};

  // Extract attributes and options.
  const unset = options.unset;
  const current = this.attributes;
  const prev = this.previousAttributes();

  // Check for changes of `id`.
  if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];
  else if (this.parsedIdAttribute() in attrs) this.id = attrs[this.parsedIdAttribute()];

  // For each `set` attribute, update or delete the current value.
  for (const attr in attrs) {
    val = attrs[attr];
    if (!_.isEqual(prev[attr], val)) {
      this.changed[attr] = val;
    } else {
      delete this.changed[attr];
    }
    if (unset) {
      delete current[attr];
    } else {
      current[attr] = val;
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
 * Return a copy of the model's {@link Model#attributes attributes} for JSON
 * stringification. If the {@link Model model} has any relations defined, this
 * will also call {@link Model#toJSON toJSON} on each of the related
 * objects, and include them on the object unless `{shallow: true}` is
 * passed as an option.
 *
 * `serialize` is called internally by {@link Model#toJSON toJSON}. Override
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
 * @param {Boolean}    [options.shallow=false]   Exclude relations.
 * @param {Boolean}    [options.omitPivot=false] Exclude pivot values.
 * @returns {Object} Serialized model as a plain object.
 */
ModelBase.prototype.serialize = function(options) {
  if (!options) options = {};

  if (options.omitNew && this.isNew()) {
    return null;
  }

  if (!options.shallow) {
    let relations = _.mapValues(this.relations, (relation) => (relation.toJSON ? relation.toJSON(options) : relation));
    // Omit null relations from the omitNew option
    relations = _.omitBy(relations, _.isNull);

    const pivot = this.pivot && !options.omitPivot && this.pivot.attributes;
    const pivotAttributes = _.mapKeys(pivot, (value, key) => `${constants.PIVOT_PREFIX}${key}`);

    return Object.assign({}, this.attributes, relations, pivotAttributes);
  }

  return Object.assign({}, this.attributes);
};

/**
 * @method
 * @description
 *
 * Called automatically by {@link
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior
 * `JSON.stringify`}. To customize serialization, override {@link
 * Model#serialize serialize}.
 *
 * @param {Object=} options Options passed to {@link Model#serialize}.
 */
ModelBase.prototype.toJSON = function(options) {
  return this.serialize(options);
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
 * @returns {Boolean} True if `attribute` is set, otherwise `false`.
 */
ModelBase.prototype.has = function(attr) {
  return this.get(attr) != null;
};

/**
 * @method
 * @description
 *
 * The `parse` method is called whenever a {@link Model model}'s data is
 * returned in a {@link Model#fetch fetch} call. The function is passed the raw
 * database response object, and should return the {@link Model#attributes
 * attributes} hash to be {@link Model#set set} on the model. The default
 * implementation is a no-op, simply passing through the JSON response.
 * Override this if you need to format the database responses - for example
 * calling {@link
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
 * JSON.parse} on a text field containing JSON, or explicitly typecasting a
 * boolean in a sqlite3 database response.
 *
 * If you need to format your data before it is saved to the database, override
 * the {@link Model#format format} method in your models. That method does the
 * opposite operation of `parse`.
 *
 * @example
 * // Example of a parser to convert snake_case to camelCase, using lodash
 * // This is just an example. You can use the built-in case-converter plugin
 * // to achieve the same functionality.
 * model.parse = function(attrs) {
 *   return _.mapKeys(attrs, function(value, key) {
 *     return _.camelCase(key);
 *   });
 * };
 *
 * @param {Object} attributes Hash of attributes to parse.
 * @returns {Object} Parsed attributes.
 */
ModelBase.prototype.parse = _.identity;

/**
 * @method
 * @description
 *
 * Remove an attribute from the model. `unset` is a noop if the attribute
 * doesn't exist.
 *
 * Note that unsetting an attribute from the model will not affect the related
 * record's column value when saving the model. In order to clear the value of a
 * column in the database record, set the attribute value to `null` instead:
 * `model.set("column_name", null)`.
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
  const undefinedKeys = _.mapValues(this.attributes, () => undefined);
  return this.set(undefinedKeys, Object.assign({}, options, {unset: true}));
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
 * Do note that `format` is used to modify the state of the model when
 * accessing the database, so if you remove an attribute in your `format`
 * method, that attribute will never be persisted to the database, but it will
 * also never be used when doing a `fetch()`, which may cause unexpected
 * results. You should be very cautious with implementations of this method
 * that may remove the primary key from the list of attributes.
 *
 * If you need to modify the database data before it is given to the model,
 * override the {@link Model#parse parse} method instead. That method does the
 * opposite operation of `format`.
 *
 * @param {Object} attributes The attributes to be converted.
 * @returns {Object} Formatted attributes.
 */
ModelBase.prototype.format = _.identity;

/**
 * This method returns a specified relation loaded on the relations hash on the model, or calls the associated relation
 * method and adds it to the relations hash if one exists and has not yet been loaded.
 *
 * @example
 * new Photo({id: 1}).fetch({
 *   withRelated: ['account']
 * }).then(function(photo) {
 *   var account = photo.related('account') // Get the eagerly loaded account
 *
 *   if (account.id) {
 *     // Fetch a relation that has not been eager loaded yet
 *     return account.related('trips').fetch()
 *   }
 * })
 *
 * @param {string} name The name of the relation to retrieve.
 * @returns {Model|Collection|undefined}
 *   The specified relation as defined by a method on the model, or `undefined` if it does not exist.
 */
ModelBase.prototype.related = function(name) {
  return this.relations[name] || (this[name] ? (this.relations[name] = this[name]()) : void 0);
};

/**
 * @method
 * @description
 * Returns a new instance of the model with identical {@link
 * Model#attributes attributes}, including any relations from the cloned
 * model.
 *
 * @returns {Model} Cloned instance of this model.
 */
ModelBase.prototype.clone = function() {
  const model = new this.constructor(this.attributes);
  Object.assign(model.relations, _.mapValues(this.relations, (r) => r.clone()));
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
  if (!options) options = {};

  if (options.patch) {
    if (options.method === 'insert')
      throw new TypeError(`Cannot accept incompatible options: method=insert, patch=${options.patch}`);

    options.method = 'update';
  }
  return ((options.patch && 'update') || options.method) == null
    ? this.isNew()
      ? 'insert'
      : 'update'
    : options.method.toLowerCase();
};

/**
 * @method
 * @private
 * @description
 *
 * Returns the automatic timestamp key names set on this model. Note that this
 * will always return a value even if the model has {@link Model#hasTimestamps
 * hasTimestamps} set to `false`. In this case and when set to `true` the
 * return value will be the default names of `created_at` and `updated_at`.
 *
 * @returns {Array<string>} The two timestamp key names.
 */
ModelBase.prototype.getTimestampKeys = function() {
  return Array.isArray(this.hasTimestamps) ? this.hasTimestamps : constants.DEFAULT_TIMESTAMP_KEYS;
};

/**
 * @method
 * @description
 * Automatically sets the timestamp attributes on the model, if
 * {@link Model#hasTimestamps hasTimestamps} is set to `true` or an array. It
 * checks if the model is new and sets the `created_at` and `updated_at`
 * attributes (or any other custom attribute names you have set) to the current
 * date. If the model is not new and is just being updated then only the
 * `updated_at` attribute gets automatically updated.
 *
 * If the model contains any user defined `created_at` or `updated_at` values,
 * there won't be any automatic updated of these attributes and the user
 * supplied values will be used instead.
 *
 * @param {Object=} options
 * @param {string} [options.method]
 *   Either `'insert'` or `'update'` to specify what kind of save the attribute
 *   update is for.
 * @param {string} [options.date]
 *   Either a Date object or ms since the epoch. Specify what date is used for
 *   updateing the timestamps, i.e. if something other than `new Date()` should be used.
 * @returns {Object} A hash of timestamp attributes that were set.
 */
ModelBase.prototype.timestamp = function(options) {
  if (!this.hasTimestamps) return {};

  const now = (options || {}).date ? new Date(options.date) : new Date();
  const attributes = {};
  const method = this.saveMethod(options);
  const timestampKeys = this.getTimestampKeys();
  const createdAtKey = timestampKeys[0];
  const updatedAtKey = timestampKeys[1];
  const isNewModel = method === 'insert';

  if (updatedAtKey && (isNewModel || this.hasChanged()) && !this.hasChanged(updatedAtKey)) {
    attributes[updatedAtKey] = now;
  }

  if (createdAtKey && isNewModel && !this.hasChanged(createdAtKey)) {
    attributes[createdAtKey] = now;
  }

  this.set(attributes, _.extend(options, {silent: true}));

  return attributes;
};

/**
 * @method
 * @description
 *
 * Returns `true` if any {@link Model#attributes attribute} has changed since
 * the last {@link Model#fetch fetch} or {@link Model#save save}. If an
 * attribute name is passed as argument, returns `true` only if that specific
 * attribute has changed.
 *
 * Note that even if an attribute is changed by using the {@link Model#set set}
 * method, but the new value is exactly the same as the existing one, the
 * attribute is not considered *changed*.
 *
 * @example
 * Author.forge({id: 1}).fetch().then(function(author) {
 *   author.hasChanged() // false
 *   author.set('name', 'Bob')
 *   author.hasChanged('name') // true
 * })
 *
 * @param {string=} attribute A specific attribute to check for changes.
 * @returns {Boolean}
 *   `true` if any attribute has changed, `false` otherwise. Alternatively, if
 *   the `attribute` argument was specified, checks if that particular
 *   attribute has changed.
 */
ModelBase.prototype.hasChanged = function(attr) {
  if (attr == null) return !_.isEmpty(this.changed);
  return _.has(this.changed, attr);
};

/**
 * @method
 * @description
 *
 * Returns the value of an attribute like it was before the last change. A
 * change is usually done with the {@link Model#set set} method, but it can
 * also be done with the {@link Model#save save} method. This is useful for
 * getting back the original attribute value after it's been changed. It can
 * also be used to get the original value after a model has been saved to the
 * database or destroyed.
 *
 * In case you want to get the previous value of all attributes at once you
 * should use the {@link Model#previousAttributes previousAttributes} method.
 *
 * Note that this will return `undefined` if the model hasn't been fetched,
 * saved, destroyed or eager loaded. However, in case one of these operations
 * did take place, it will return the current value if an attribute hasn't
 * changed. If you want to check if an attribute has changed see the
 * {@link Model#hasChanged hasChanged} method.
 *
 * @example
 * Author.forge({id: 1}).fetch().then(function(author) {
 *   author.get('name') // Alice
 *   author.set('name', 'Bob')
 *   author.previous('name') // 'Alice'
 * })
 *
 * @param {string} attribute The attribute to check.
 * @returns {mixed} The previous value.
 */
ModelBase.prototype.previous = function(attribute) {
  return this._previousAttributes[attribute];
};

/**
 * @method
 * @description
 *
 * Returns a copy of the {@link Model model}'s attributes like they were before
 * the last change. A change is usually done with the {@link Model#set set}
 * method, but it can also be done with the {@link Model#save save} method.
 * This is mostly useful for getting a diff of the model's attributes after
 * changing some of them. It can also be used to get the previous state of a
 * model after it has been saved to the database or destroyed.
 *
 * In case you want to get the previous value of a single attribute you should
 * use the {@link Model#previous previous} method.
 *
 * Note that this will return an empty object if no changes have been made to
 * the model and it hasn't been fetched, saved or eager loaded.
 *
 * @example
 * Author.forge({id: 1}).fetch().then(function(author) {
 *   author.get('name') // Alice
 *   author.set('name', 'Bob')
 *   author.previousAttributes() // {id: 1, name: 'Alice'}
 * })
 *
 * Author.forge({id: 1}).fetch().then(function(author) {
 *   author.get('name') // Alice
 *   return author.save({name: 'Bob'})
 * }).then(function(author) {
 *   author.get('name') // Bob
 *   author.previousAttributes() // {id: 1, name: 'Alice'}
 * })
 *
 * @returns {Object}
 *   The attributes as they were before the last change, or an empty object in
 *   case the model data hasn't been fetched yet.
 */
ModelBase.prototype.previousAttributes = function() {
  return _.clone(this._previousAttributes) || {};
};

/**
 * @method
 * @private
 * @description
 *
 * Resets the `changed` hash for the model. Typically called after a `sync`
 * action (save, fetch, destroy).
 *
 * @returns {Model} This model.
 */
ModelBase.prototype._reset = function() {
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
 * @method ModelBase#toPairs
 * @see http://lodash.com/docs/#toPairs
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
const modelMethods = ['keys', 'values', 'toPairs', 'invert', 'pick', 'omit'];

// Mix in each "_" method as a proxy to `Model#attributes`.
_.each(modelMethods, function(method) {
  ModelBase.prototype[method] = function() {
    return _[method].apply(_, [this.attributes].concat(Array.from(arguments)));
  };
});

/**
 * This static method allows you to create your own Model classes by extending {@link Model bookshelf.Model}.
 *
 * It correctly sets up the prototype chain, which means that subclasses created this way can be further extended and
 * subclassed as far as you need.
 *
 * @example
 * const Promise = require('bluebird')
 * const compare = require('some-crypt-library')
 *
 * const Customer = bookshelf.Model.extend({
 *   initialize() {
 *     this.constructor.__super__.initialize.apply(this, arguments)
 *
 *     // Setting up a listener for the 'saving' event
 *     this.on('saving', this.validateSave)
 *   },
 *
 *   validateSave() {
 *     return doValidation(this.attributes)
 *   },
 *
 *   account() {
 *     // Defining a relation with the Account model
 *     return this.belongsTo(Account)
 *   }
 * }, {
 *   login: Promise.method(function(email, password) {
 *     if (!email || !password)
 *       throw new Error('Email and password are both required')
 *
 *     return new this({email: email.toLowerCase()})
 *       .fetch({require: true})
 *       .tap(function(customer) {
 *         if (!compare(password, customer.get('password'))
 *           throw new Error('Invalid password')
 *       })
 *   })
 * })
 *
 * @method Model.extend
 * @param {Object} [prototypeProperties] Instance methods and properties to be attached to instances of the new class.
 * @param {Object} [classProperties]
 *   Class (i.e. static) functions and properties to be attached to the constructor of the new class.
 * @returns {Function} Constructor for new Model subclass.
 */
ModelBase.extend = require('../extend');

module.exports = ModelBase;
