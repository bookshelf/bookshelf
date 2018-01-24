'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _inflection = require('inflection');

var _inflection2 = _interopRequireDefault(_inflection);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _model = require('./base/model');

var _model2 = _interopRequireDefault(_model);

var _relation = require('./base/relation');

var _relation2 = _interopRequireDefault(_relation);

var _promise = require('./base/promise');

var _promise2 = _interopRequireDefault(_promise);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var push = Array.prototype.push; // Relation
// ---------------

var removePivotPrefix = function removePivotPrefix(key) {
  return key.slice(_constants.PIVOT_PREFIX.length);
};
var hasPivotPrefix = function hasPivotPrefix(key) {
  return _lodash2.default.startsWith(key, _constants.PIVOT_PREFIX);
};

exports.default = _relation2.default.extend({

  // Assembles the new model or collection we're creating an instance of,
  // gathering any relevant primitives from the parent object,
  // without keeping any hard references.
  init: function init(parent) {
    this.parentId = parent.id;
    this.parentTableName = _lodash2.default.result(parent, 'tableName');
    this.parentIdAttribute = this.attribute('parentIdAttribute', parent);

    // Use formatted attributes so that morphKey and foreignKey will match
    // attribute keys.
    this.parentAttributes = parent.format(_lodash2.default.clone(parent.attributes));

    if (this.type === 'morphTo' && !parent._isEager) {
      // If the parent object is eager loading, and it's a polymorphic `morphTo` relation,
      // we can't know what the target will be until the models are sorted and matched.
      this.target = _helpers2.default.morphCandidate(this.candidates, this.parentAttributes[this.key('morphKey')]);
      this.targetTableName = _lodash2.default.result(this.target.prototype, 'tableName');
    }

    this.targetIdAttribute = this.attribute('targetIdAttribute', parent);
    this.parentFk = this.attribute('parentFk');

    var target = this.target ? this.relatedInstance() : {};
    target.relatedData = this;

    if (this.type === 'belongsToMany') {
      _lodash2.default.extend(target, pivotHelpers);
    }

    return target;
  },

  // Initializes a `through` relation, setting the `Target` model and `options`,
  // which includes any additional keys for the relation.
  through: function through(source, Target, options) {
    var type = this.type;
    if (type !== 'hasOne' && type !== 'hasMany' && type !== 'belongsToMany' && type !== 'belongsTo') {
      throw new Error('`through` is only chainable from `hasOne`, `belongsTo`, `hasMany`, or `belongsToMany`');
    }

    this.throughTarget = Target;
    this.throughTableName = _lodash2.default.result(Target.prototype, 'tableName');

    _lodash2.default.extend(this, options);
    _lodash2.default.extend(source, pivotHelpers);

    this.parentIdAttribute = this.attribute('parentIdAttribute');
    this.targetIdAttribute = this.attribute('targetIdAttribute');
    this.throughIdAttribute = this.attribute('throughIdAttribute', Target);
    this.parentFk = this.attribute('parentFk');

    // Set the appropriate foreign key if we're doing a belongsToMany, for convenience.
    if (this.type === 'belongsToMany') {
      this.foreignKey = this.throughForeignKey;
    } else if (this.otherKey) {
      this.foreignKey = this.otherKey;
    }

    return source;
  },

  // Generates and returns a specified key, for convenience... one of
  // `foreignKey`, `otherKey`, `throughForeignKey`.
  key: function key(keyName) {
    if (this[keyName]) return this[keyName];
    switch (keyName) {
      case 'otherKey':
        this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
        break;
      case 'throughForeignKey':
        this[keyName] = singularMemo(this.joinTable()) + '_' + this.throughIdAttribute;
        break;
      case 'foreignKey':
        switch (this.type) {
          case 'morphTo':
            {
              var idKeyName = this.columnNames && this.columnNames[1] ? this.columnNames[1] : this.morphName + '_id';
              this[keyName] = idKeyName;
              break;
            }
          case 'belongsTo':
            this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
            break;
          default:
            if (this.isMorph()) {
              this[keyName] = this.columnNames && this.columnNames[1] ? this.columnNames[1] : this.morphName + '_id';
              break;
            }
            this[keyName] = singularMemo(this.parentTableName) + '_' + this.parentIdAttribute;
            break;
        }
        break;
      case 'morphKey':
        this[keyName] = this.columnNames && this.columnNames[0] ? this.columnNames[0] : this.morphName + '_type';
        break;
      case 'morphValue':
        this[keyName] = this.parentTableName || this.targetTableName;
        break;
    }
    return this[keyName];
  },

  // Get the correct value for the following attributes:
  // parentIdAttribute, targetIdAttribute, throughIdAttribute and parentFk.
  attribute: function attribute(_attribute, parent) {
    switch (_attribute) {
      case 'parentIdAttribute':
        if (this.isThrough()) {
          if (this.type === 'belongsTo' && this.throughForeignKey) {
            return this.throughForeignKey;
          }

          if (this.type === 'belongsToMany' && this.isThroughForeignKeyTargeted()) {
            return this.throughForeignKeyTarget;
          }

          if (this.isOtherKeyTargeted()) {
            return this.otherKeyTarget;
          }

          // Return attribute calculated on `init` by default.
          return this.parentIdAttribute;
        }

        if (this.isForeignKeyTargeted()) {
          return this.foreignKeyTarget;
        }

        return _lodash2.default.result(parent, 'idAttribute');

      case 'targetIdAttribute':
        if (this.isThrough()) {
          if ((this.type === 'belongsToMany' || this.type === 'belongsTo') && this.isOtherKeyTargeted()) {
            return this.otherKeyTarget;
          }

          // Return attribute calculated on `init` by default.
          return this.targetIdAttribute;
        }

        if (this.type === 'morphTo' && !parent._isEager) {
          return _lodash2.default.result(this.target.prototype, 'idAttribute');
        }

        if (this.type === 'belongsTo' && this.isForeignKeyTargeted()) {
          return this.foreignKeyTarget;
        }

        if (this.type === 'belongsToMany' && this.isOtherKeyTargeted()) {
          return this.otherKeyTarget;
        }

        return this.targetIdAttribute;

      case 'throughIdAttribute':
        if (this.type !== 'belongsToMany' && this.isThroughForeignKeyTargeted()) {
          return this.throughForeignKeyTarget;
        }

        if (this.type === 'belongsToMany' && this.throughForeignKey) {
          return this.throughForeignKey;
        }

        return _lodash2.default.result(parent.prototype, 'idAttribute');

      case 'parentFk':
        if (!this.hasParentAttributes()) {
          return;
        }

        if (this.isThrough()) {
          if (this.type === 'belongsToMany' && this.isThroughForeignKeyTargeted()) {
            return this.parentAttributes[this.throughForeignKeyTarget];
          }

          if (this.type === 'belongsTo') {
            return this.throughForeignKey ? this.parentAttributes[this.parentIdAttribute] : this.parentId;
          }

          if (this.isOtherKeyTargeted()) {
            return this.parentAttributes[this.otherKeyTarget];
          }

          // Return attribute calculated on `init` by default.
          return this.parentFk;
        }

        return this.parentAttributes[this.isInverse() ? this.key('foreignKey') : this.parentIdAttribute];
    }
  },


  // Injects the necessary `select` constraints into a `knex` query builder.
  selectConstraints: function selectConstraints(knex, options) {
    var resp = options.parentResponse;

    // The `belongsToMany` and `through` relations have joins & pivot columns.
    if (this.isJoined()) this.joinClauses(knex);

    // Call the function, if one exists, to constrain the eager loaded query.
    if (options._beforeFn) options._beforeFn.call(knex, knex);

    // The base select column
    if (_lodash2.default.isArray(options.columns)) {
      knex.columns(options.columns);
    }

    var currentColumns = _lodash2.default.find(knex._statements, { grouping: 'columns' });

    if (!currentColumns || currentColumns.length === 0) {
      knex.column(this.targetTableName + '.*');
    }

    if (this.isJoined()) this.joinColumns(knex);

    // If this is a single relation and we're not eager loading,
    // limit the query to a single item.
    if (this.isSingle() && !resp) knex.limit(1);

    // Finally, add (and validate) the where conditions, necessary for constraining the relation.
    this.whereClauses(knex, resp);
  },

  // Inject & validates necessary `through` constraints for the current model.
  joinColumns: function joinColumns(knex) {
    var columns = [];
    var joinTable = this.joinTable();
    if (this.isThrough()) columns.push(this.throughIdAttribute);
    columns.push(this.key('foreignKey'));
    if (this.type === 'belongsToMany') columns.push(this.key('otherKey'));
    push.apply(columns, this.pivotColumns);
    knex.columns(_lodash2.default.map(columns, function (col) {
      return joinTable + '.' + col + ' as _pivot_' + col;
    }));
  },

  // Generates the join clauses necessary for the current relation.
  joinClauses: function joinClauses(knex) {
    var joinTable = this.joinTable();

    if (this.type === 'belongsTo' || this.type === 'belongsToMany') {

      var targetKey = this.type === 'belongsTo' ? this.key('foreignKey') : this.key('otherKey');

      knex.join(joinTable, joinTable + '.' + targetKey, '=', this.targetTableName + '.' + this.targetIdAttribute);

      // A `belongsTo` -> `through` is currently the only relation with two joins.
      if (this.type === 'belongsTo') {
        knex.join(this.parentTableName, joinTable + '.' + this.throughIdAttribute, '=', this.parentTableName + '.' + this.key('throughForeignKey'));
      }
    } else {
      knex.join(joinTable, joinTable + '.' + this.throughIdAttribute, '=', this.targetTableName + '.' + this.key('throughForeignKey'));
    }
  },

  // Check that there isn't an incorrect foreign key set, vs. the one
  // passed in when the relation was formed.
  whereClauses: function whereClauses(knex, response) {
    var key = void 0;

    if (this.isJoined()) {
      var isBelongsTo = this.type === 'belongsTo';
      var targetTable = isBelongsTo ? this.parentTableName : this.joinTable();

      var column = isBelongsTo ? this.parentIdAttribute : this.key('foreignKey');

      key = targetTable + '.' + column;
    } else {
      var _column = this.isInverse() ? this.targetIdAttribute : this.key('foreignKey');

      key = this.targetTableName + '.' + _column;
    }

    var method = response ? 'whereIn' : 'where';
    var ids = response ? this.eagerKeys(response) : this.parentFk;
    knex[method](key, ids);

    if (this.isMorph()) {
      var table = this.targetTableName;
      var _key = this.key('morphKey');
      var value = this.key('morphValue');
      knex.where(table + '.' + _key, value);
    }
  },

  // Fetches all `eagerKeys` from the current relation.
  eagerKeys: function eagerKeys(response) {
    var key = this.isInverse() && !this.isThrough() ? this.key('foreignKey') : this.parentIdAttribute;
    return (0, _lodash2.default)(response).map(key).uniq().value();
  },

  // Generates the appropriate standard join table.
  joinTable: function joinTable() {
    if (this.isThrough()) return this.throughTableName;
    return this.joinTableName || [this.parentTableName, this.targetTableName].sort().join('_');
  },

  // Creates a new model or collection instance, depending on
  // the `relatedData` settings and the models passed in.
  relatedInstance: function relatedInstance(models) {
    models = models || [];

    var Target = this.target;

    // If it's a single model, check whether there's already a model
    // we can pick from... otherwise create a new instance.
    if (this.isSingle()) {
      if (!(Target.prototype instanceof _model2.default)) {
        throw new Error('The ' + this.type + ' related object must be a Bookshelf.Model');
      }
      return models[0] || new Target();
    }

    // Allows us to just use a model, but create a temporary
    // collection for a "*-many" relation.
    if (Target.prototype instanceof _model2.default) {
      return Target.collection(models, { parse: true });
    }
    return new Target(models, { parse: true });
  },

  // Groups the related response according to the type of relationship
  // we're handling, for easy attachment to the parent models.
  eagerPair: function eagerPair(relationName, related, parentModels) {
    var _this = this;

    // If this is a morphTo, we only want to pair on the morphValue for the current relation.
    if (this.type === 'morphTo') {
      parentModels = _lodash2.default.filter(parentModels, function (m) {
        return m.get(_this.key('morphKey')) === _this.key('morphValue');
      });
    }

    // If this is a `through` or `belongsToMany` relation, we need to cleanup & setup the `interim` model.
    if (this.isJoined()) related = this.parsePivot(related);

    // Group all of the related models for easier association with their parent models.
    var grouped = _lodash2.default.groupBy(related, function (m) {
      if (m.pivot) {
        if (_this.isInverse() && _this.isThrough()) {
          return _this.isThroughForeignKeyTargeted() ? m.pivot.get(_this.throughForeignKeyTarget) : m.pivot.id;
        }

        return m.pivot.get(_this.key('foreignKey'));
      }

      if (_this.isInverse()) {
        return _this.isForeignKeyTargeted() ? m.get(_this.foreignKeyTarget) : m.id;
      }

      return m.get(_this.key('foreignKey'));
    });

    // Loop over the `parentModels` and attach the grouped sub-models,
    // keeping the `relatedData` on the new related instance.
    _lodash2.default.each(parentModels, function (model) {
      var groupedKey = void 0;
      if (!_this.isInverse()) {
        groupedKey = model.get(_this.parentIdAttribute);
      } else {
        var keyColumn = _this.key(_this.isThrough() ? 'throughForeignKey' : 'foreignKey');
        var formatted = model.format(_lodash2.default.clone(model.attributes));
        groupedKey = formatted[keyColumn];
      }
      var relation = model.relations[relationName] = _this.relatedInstance(grouped[groupedKey]);
      relation.relatedData = _this;
      if (_this.isJoined()) _lodash2.default.extend(relation, pivotHelpers);
    });

    // Now that related models have been successfully paired, update each with
    // its parsed attributes
    related.map(function (model) {
      model.attributes = model.parse(model.attributes);
    });

    return related;
  },


  parsePivot: function parsePivot(models) {
    var _this2 = this;

    return _lodash2.default.map(models, function (model) {

      // Separate pivot attributes.
      var grouped = _lodash2.default.reduce(model.attributes, function (acc, value, key) {
        if (hasPivotPrefix(key)) {
          acc.pivot[removePivotPrefix(key)] = value;
        } else {
          acc.model[key] = value;
        }
        return acc;
      }, { model: {}, pivot: {} });

      // Assign non-pivot attributes to model.
      model.attributes = grouped.model;

      // If there are any pivot attributes, create a new pivot model with these
      // attributes.
      if (!_lodash2.default.isEmpty(grouped.pivot)) {
        var Through = _this2.throughTarget;
        var tableName = _this2.joinTable();
        model.pivot = Through != null ? new Through(grouped.pivot) : new _this2.Model(grouped.pivot, { tableName: tableName });
      }

      return model;
    });
  },

  // A few predicates to help clarify some of the logic above.
  isThrough: function isThrough() {
    return this.throughTarget != null;
  },
  isJoined: function isJoined() {
    return this.type === 'belongsToMany' || this.isThrough();
  },
  isMorph: function isMorph() {
    return this.type === 'morphOne' || this.type === 'morphMany';
  },
  isSingle: function isSingle() {
    var type = this.type;
    return type === 'hasOne' || type === 'belongsTo' || type === 'morphOne' || type === 'morphTo';
  },
  isInverse: function isInverse() {
    return this.type === 'belongsTo' || this.type === 'morphTo';
  },
  isForeignKeyTargeted: function isForeignKeyTargeted() {
    return this.foreignKeyTarget != null;
  },
  isThroughForeignKeyTargeted: function isThroughForeignKeyTargeted() {
    return this.throughForeignKeyTarget != null;
  },
  isOtherKeyTargeted: function isOtherKeyTargeted() {
    return this.otherKeyTarget != null;
  },
  hasParentAttributes: function hasParentAttributes() {
    return this.parentAttributes != null;
  },


  // Sets the `pivotColumns` to be retrieved along with the current model.
  withPivot: function withPivot(columns) {
    if (!_lodash2.default.isArray(columns)) columns = [columns];
    this.pivotColumns = this.pivotColumns || [];
    push.apply(this.pivotColumns, columns);
  }

});

// Simple memoization of the singularize call.

var singularMemo = function () {
  var cache = Object.create(null);
  return function (arg) {
    if (!(arg in cache)) {
      cache[arg] = _inflection2.default.singularize(arg);
    }
    return cache[arg];
  };
}();

// Specific to many-to-many relationships, these methods are mixed
// into the `belongsToMany` relationships when they are created,
// providing helpers for attaching and detaching related models.
var pivotHelpers = {

  /**
   * Attaches one or more `ids` or models from a foreign table to the current
   * table, on a {@linkplain many-to-many} relation. Creates and saves a new
   * model and attaches the model with the related model.
   *
   *     var admin1 = new Admin({username: 'user1', password: 'test'});
   *     var admin2 = new Admin({username: 'user2', password: 'test'});
   *
   *     Promise.all([admin1.save(), admin2.save()])
   *       .then(function() {
   *         return Promise.all([
   *         new Site({id: 1}).admins().attach([admin1, admin2]),
   *         new Site({id: 2}).admins().attach(admin2)
   *       ]);
   *     })
   *
   * This method (along with {@link Collection#detach} and {@link
   * Collection#updatePivot}) are mixed in to a {@link Collection} when
   * returned by a {@link Model#belongsToMany belongsToMany} relation.
   *
   * @method Collection#attach
   * @param {mixed|mixed[]} ids
   *   One or more ID values or models to be attached to the relation.
   * @param {Object} options
   *   A hash of options.
   * @param {Transaction} options.transacting
   *   Optionally run the query in a transaction.
   * @returns {Promise<Collection>}
   *   A promise resolving to the updated Collection.
   */
  attach: function attach(ids, options) {
    var _this3 = this;

    return _promise2.default.try(function () {
      return _this3.triggerThen('attaching', _this3, ids, options);
    }).then(function () {
      return _this3._handler('insert', ids, options);
    }).then(function (response) {
      return _this3.triggerThen('attached', _this3, response, options);
    }).return(this);
  },


  /**
   * Detach one or more related objects from their pivot tables. If a model or
   * id is passed, it attempts to remove the pivot table based on that foreign
   * key. If no parameters are specified, we assume we will detach all related
   * associations.
   *
   * This method (along with {@link Collection#attach} and {@link
   * Collection#updatePivot}) are mixed in to a {@link Collection} when returned
   * by a {@link Model#belongsToMany belongsToMany} relation.
   *
   * @method Collection#detach
   * @param {mixed|mixed[]} [ids]
   *   One or more ID values or models to be detached from the relation.
   * @param {Object} options
   *   A hash of options.
   * @param {Transaction} options.transacting
   *   Optionally run the query in a transaction.
   * @returns {Promise<undefined>}
   *   A promise resolving to `undefined`.
   */
  detach: function detach(ids, options) {
    var _this4 = this;

    return _promise2.default.try(function () {
      return _this4.triggerThen('detaching', _this4, ids, options);
    }).then(function () {
      return _this4._handler('delete', ids, options);
    }).then(function (response) {
      return _this4.triggerThen('detached', _this4, response, options);
    }).return(this);
  },


  /**
   * The `updatePivot` method is used exclusively on {@link Model#belongsToMany
   * belongsToMany} relations, and allows for updating pivot rows on the joining
   * table.
   *
   * This method (along with {@link Collection#attach} and {@link
   * Collection#detach}) are mixed in to a {@link Collection} when returned
   * by a {@link Model#belongsToMany belongsToMany} relation.
   *
   * @method Collection#updatePivot
   * @param {Object} attributes
   *   Values to be set in the `update` query.
   * @param {Object} [options]
   *   A hash of options.
   * @param {function|Object} [options.query]
   *   Constrain the update query. Similar to the `method` argument to {@link
   *   Model#query}.
   * @param {bool} [options.require=false]
   *   Causes promise to be rejected with an Error if no rows were updated.
   * @param {Transaction} [options.transacting]
   *   Optionally run the query in a transaction.
   * @returns {Promise<Number>}
   *   A promise resolving to number of rows updated.
   */
  updatePivot: function updatePivot(attributes, options) {
    return this._handler('update', attributes, options);
  },

  /**
   * The `withPivot` method is used exclusively on {@link Model#belongsToMany
   * belongsToMany} relations, and allows for additional fields to be pulled
   * from the joining table.
   *
   *     var Tag = bookshelf.Model.extend({
   *       comments: function() {
   *         return this.belongsToMany(Comment).withPivot(['created_at', 'order']);
   *       }
   *     });
   *
   * @method Collection#withPivot
   * @param {string[]} columns
   *   Names of columns to be included when retrieving pivot table rows.
   * @returns {Collection}
   *   Self, this method is chainable.
   */
  withPivot: function withPivot(columns) {
    this.relatedData.withPivot(columns);
    return this;
  },

  // Helper for handling either the `attach` or `detach` call on
  // the `belongsToMany` or `hasOne` / `hasMany` :through relationship.
  _handler: _promise2.default.method(function (method, ids, options) {
    var _this5 = this;

    var pending = [];
    if (ids == null) {
      if (method === 'insert') return _promise2.default.resolve(this);
      if (method === 'delete') pending.push(this._processPivot(method, null, options));
    }
    if (!_lodash2.default.isArray(ids)) ids = ids ? [ids] : [];
    _lodash2.default.each(ids, function (id) {
      return pending.push(_this5._processPivot(method, id, options));
    });
    return _promise2.default.all(pending).return(this);
  }),

  // Handles preparing the appropriate constraints and then delegates
  // the database interaction to _processPlainPivot for non-.through()
  // pivot definitions, or _processModelPivot for .through() models.
  // Returns a promise.
  _processPivot: _promise2.default.method(function (method, item) {
    var relatedData = this.relatedData,
        args = Array.prototype.slice.call(arguments),
        fks = {},
        data = {};

    fks[relatedData.key('foreignKey')] = relatedData.parentFk;

    // If the item is an object, it's either a model
    // that we're looking to attach to this model, or
    // a hash of attributes to set in the relation.
    if (_lodash2.default.isObject(item)) {
      if (item instanceof _model2.default) {
        fks[relatedData.key('otherKey')] = item.id;
      } else if (method !== 'update') {
        _lodash2.default.extend(data, item);
      }
    } else if (item) {
      fks[relatedData.key('otherKey')] = item;
    }

    args.push(_lodash2.default.extend(data, fks), fks);

    if (this.relatedData.throughTarget) {
      return this._processModelPivot.apply(this, args);
    }

    return this._processPlainPivot.apply(this, args);
  }),

  // Applies constraints to the knex builder and handles shelling out
  // to either the `insert` or `delete` call for the current model,
  // returning a promise.
  _processPlainPivot: _promise2.default.method(function (method, item, options, data) {
    var relatedData = this.relatedData;

    // Grab the `knex` query builder for the current model, and
    // check if we have any additional constraints for the query.
    var builder = this._builder(relatedData.joinTable());
    if (options && options.query) {
      _helpers2.default.query.call(null, { _knex: builder }, [options.query]);
    }

    if (options) {
      if (options.transacting) builder.transacting(options.transacting);
      if (options.debug) builder.debug();
    }

    var collection = this;
    if (method === 'delete') {
      return builder.where(data).del().then(function () {
        if (!item) return collection.reset();
        var model = collection.get(data[relatedData.key('otherKey')]);
        if (model) {
          collection.remove(model);
        }
      });
    }
    if (method === 'update') {
      return builder.where(data).update(item).then(function (numUpdated) {
        if (options && options.require === true && numUpdated === 0) {
          throw new Error('No rows were updated');
        }
        return numUpdated;
      });
    }

    return this.triggerThen('creating', this, data, options).then(function () {
      return builder.insert(data).then(function () {
        collection.add(item);
      });
    });
  }),

  // Loads or prepares a pivot model based on the constraints and deals with
  // pivot model changes by calling the appropriate Bookshelf Model API
  // methods. Returns a promise.
  _processModelPivot: _promise2.default.method(function (method, item, options, data, fks) {
    var relatedData = this.relatedData,
        JoinModel = relatedData.throughTarget,
        joinModel = new JoinModel();

    fks = joinModel.parse(fks);
    data = joinModel.parse(data);

    if (method === 'insert') {
      return joinModel.set(data).save(null, options);
    }

    return joinModel.set(fks).fetch({
      require: true
    }).then(function (instance) {
      if (method === 'delete') {
        return instance.destroy(options);
      }
      return instance.save(item, options);
    });
  })

};