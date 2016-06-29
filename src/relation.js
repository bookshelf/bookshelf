// Relation
// ---------------
import _ from 'lodash';
import inflection from 'inflection';

import Helpers from './helpers';
import ModelBase from './base/model';
import RelationBase from './base/relation';
import Promise from './base/promise';
import { PIVOT_PREFIX } from './constants';

const { push } = Array.prototype;
const removePivotPrefix = key => key.slice(PIVOT_PREFIX.length);
const hasPivotPrefix = key => _.startsWith(key, PIVOT_PREFIX);

export default RelationBase.extend({

  // Assembles the new model or collection we're creating an instance of,
  // gathering any relevant primitives from the parent object,
  // without keeping any hard references.
  init: function(parent) {
    this.parentId          = parent.id;
    this.parentTableName   = _.result(parent, 'tableName');
    this.parentIdAttribute = _.result(parent, 'idAttribute');

    if (this.isInverse()) {
      // use formatted attributes so that morphKey and foreignKey will match
      // attribute keys
      const attributes = parent.format(_.clone(parent.attributes));

      // If the parent object is eager loading, and it's a polymorphic `morphTo` relation,
      // we can't know what the target will be until the models are sorted and matched.
      if (this.type === 'morphTo' && !parent._isEager) {
        this.target = Helpers.morphCandidate(this.candidates, attributes[this.key('morphKey')]);
        this.targetTableName   = _.result(this.target.prototype, 'tableName');
        this.targetIdAttribute = _.result(this.target.prototype, 'idAttribute');
      }
      this.parentFk = attributes[this.key('foreignKey')];
    } else {
      this.parentFk = parent.id;
    }

    const target = this.target ? this.relatedInstance() : {};
        target.relatedData = this;

    if (this.type === 'belongsToMany') {
      _.extend(target, pivotHelpers);
    }

    return target;
  },

  // Initializes a `through` relation, setting the `Target` model and `options`,
  // which includes any additional keys for the relation.
  through: function(source, Target, options) {
    const type = this.type;
    if (type !== 'hasOne' && type !== 'hasMany' && type !== 'belongsToMany' && type !== 'belongsTo') {
      throw new Error('`through` is only chainable from `hasOne`, `belongsTo`, `hasMany`, or `belongsToMany`');
    }

    this.throughTarget = Target;
    this.throughTableName = _.result(Target.prototype, 'tableName');
    this.throughIdAttribute = _.result(Target.prototype, 'idAttribute');

    // Set the parentFk as appropriate now.
    if (this.type === 'belongsTo') {
      this.parentFk = this.parentId;
    }

    _.extend(this, options);
    _.extend(source, pivotHelpers);

    // Set the appropriate foreign key if we're doing a belongsToMany, for convenience.
    if (this.type === 'belongsToMany') {
      this.foreignKey = this.throughForeignKey;
    }

    return source;
  },

  // Generates and returns a specified key, for convenience... one of
  // `foreignKey`, `otherKey`, `throughForeignKey`.
  key: function(keyName) {
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
          case 'morphTo': {
            const idKeyName = (this.columnNames && this.columnNames[1])
              ? this.columnNames[1]
              : this.morphName + '_id';
            this[keyName] = idKeyName;
            break;
          }
          case 'belongsTo':
            this[keyName] = singularMemo(this.targetTableName) + '_' + this.targetIdAttribute;
            break;
          default:
            if (this.isMorph()) {
              this[keyName] = (this.columnNames && this.columnNames[1])
                ? this.columnNames[1]
                : this.morphName + '_id';
              break;
            }
            this[keyName] = singularMemo(this.parentTableName) + '_' + this.parentIdAttribute;
            break;
        }
        break;
      case 'morphKey':
        this[keyName] = (this.columnNames && this.columnNames[0])
          ? this.columnNames[0]
          : this.morphName + '_type';
        break;
      case 'morphValue':
        this[keyName] = this.parentTableName || this.targetTableName;
        break;
    }
    return this[keyName]
  },

  // Injects the necessary `select` constraints into a `knex` query builder.
  selectConstraints: function(knex, options) {
    const resp = options.parentResponse;

    // The `belongsToMany` and `through` relations have joins & pivot columns.
    if (this.isJoined()) this.joinClauses(knex);

    // Call the function, if one exists, to constrain the eager loaded query.
    if (options._beforeFn) options._beforeFn.call(knex, knex);

    // The base select column
    if (_.isArray(options.columns)) {
      knex.columns(options.columns);
    }

    const currentColumns = _.find(knex._statements, {grouping: 'columns'});

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
  joinColumns: function(knex) {
    const columns = [];
    const joinTable = this.joinTable();
    if (this.isThrough()) columns.push(this.throughIdAttribute);
    columns.push(this.key('foreignKey'));
    if (this.type === 'belongsToMany') columns.push(this.key('otherKey'));
    push.apply(columns, this.pivotColumns);
    knex.columns(_.map(columns, function(col) {
      return joinTable + '.' + col + ' as _pivot_' + col;
    }));
  },

  // Generates the join clauses necessary for the current relation.
  joinClauses: function(knex) {
    const joinTable = this.joinTable();

    if (this.type === 'belongsTo' || this.type === 'belongsToMany') {

      const targetKey = (this.type === 'belongsTo' ? this.key('foreignKey') : this.key('otherKey'));

      knex.join(
        joinTable,
        joinTable + '.' + targetKey, '=',
        this.targetTableName + '.' + this.targetIdAttribute
      );

      // A `belongsTo` -> `through` is currently the only relation with two joins.
      if (this.type === 'belongsTo') {
        knex.join(
          this.parentTableName,
          joinTable + '.' + this.throughIdAttribute, '=',
          this.parentTableName + '.' + this.key('throughForeignKey')
        );
      }

    } else {
      knex.join(
        joinTable,
        joinTable + '.' + this.throughIdAttribute, '=',
        this.targetTableName + '.' + this.key('throughForeignKey')
      );
    }
  },

  // Check that there isn't an incorrect foreign key set, vs. the one
  // passed in when the relation was formed.
  whereClauses: function(knex, response) {
    let key;

    if (this.isJoined()) {
      const isBelongsTo = this.type === 'belongsTo';
      const targetTable = isBelongsTo
        ? this.parentTableName
        : this.joinTable();

      const column = isBelongsTo
        ? this.parentIdAttribute
        : this.key('foreignKey');

      key = `${targetTable}.${column}`;
    } else {
      const column = this.isInverse()
        ? this.targetIdAttribute
        : this.key('foreignKey');

      key = `${this.targetTableName}.${column}`;
    }

    const method = response ? 'whereIn' : 'where';
    const ids = response ? this.eagerKeys(response) : this.parentFk;
    knex[method](key, ids);

    if (this.isMorph()) {
      const table = this.targetTableName;
      const key = this.key('morphKey');
      const value = this.key('morphValue')
      knex.where(`${table}.${key}`, value);
    }
  },

  // Fetches all `eagerKeys` from the current relation.
  eagerKeys: function(response) {
    const key = this.isInverse() && !this.isThrough()
      ? this.key('foreignKey')
      : this.parentIdAttribute;
    return _(response).map(key).uniq().value();
  },

  // Generates the appropriate standard join table.
  joinTable: function() {
    if (this.isThrough()) return this.throughTableName;
    return this.joinTableName || [
      this.parentTableName,
      this.targetTableName
    ].sort().join('_');
  },

  // Creates a new model or collection instance, depending on
  // the `relatedData` settings and the models passed in.
  relatedInstance: function(models) {
    models = models || [];

    const Target = this.target;

    // If it's a single model, check whether there's already a model
    // we can pick from... otherwise create a new instance.
    if (this.isSingle()) {
      if (!(Target.prototype instanceof ModelBase)) {
        throw new Error(`The ${this.type} related object must be a Bookshelf.Model`);
      }
      return models[0] || new Target();
    }

    // Allows us to just use a model, but create a temporary
    // collection for a "*-many" relation.
    if (Target.prototype instanceof ModelBase) {
      return Target.collection(models, {parse: true});
    }
    return new Target(models, {parse: true});
  },

  // Groups the related response according to the type of relationship
  // we're handling, for easy attachment to the parent models.
  eagerPair(relationName, related, parentModels) {
    // If this is a morphTo, we only want to pair on the morphValue for the current relation.
    if (this.type === 'morphTo') {
      parentModels = _.filter(parentModels, (m) => {
        return m.get(this.key('morphKey')) === this.key('morphValue');
      });
    }

    // If this is a `through` or `belongsToMany` relation, we need to cleanup & setup the `interim` model.
    if (this.isJoined()) related = this.parsePivot(related);

    // Group all of the related models for easier association with their parent models.
    const grouped = _.groupBy(related, (m) => {
      if (m.pivot) {
        return this.isInverse() && this.isThrough() ? m.pivot.id :
          m.pivot.get(this.key('foreignKey'));
      } else {
        return this.isInverse() ? m.id : m.get(this.key('foreignKey'));
      }
    });

    // Loop over the `parentModels` and attach the grouped sub-models,
    // keeping the `relatedData` on the new related instance.
    _.each(parentModels, (model) => {
      let groupedKey;
      if (!this.isInverse()) {
        groupedKey = model.id;
      } else {
        const keyColumn = this.key(
          this.isThrough() ? 'throughForeignKey': 'foreignKey'
        );
        const formatted = model.format(_.clone(model.attributes));
        groupedKey = formatted[keyColumn];
      }
      const relation = model.relations[relationName] = this.relatedInstance(grouped[groupedKey]);
      relation.relatedData = this;
      if (this.isJoined()) _.extend(relation, pivotHelpers);
    })

    // Now that related models have been successfully paired, update each with
    // its parsed attributes
    related.map(model => {
      model.attributes = model.parse(model.attributes)
    });

    return related;
  },

  parsePivot: function(models) {
    return _.map(models, (model) => {

      // Separate pivot attributes.
      const grouped = _.reduce(model.attributes, (acc, value, key) => {
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
      if (!_.isEmpty(grouped.pivot)) {
        const Through = this.throughTarget;
        const tableName = this.joinTable();
        model.pivot = Through != null
          ? new Through(grouped.pivot)
          : new this.Model(grouped.pivot, { tableName });
      }

      return model;
    });
  },

  // A few predicates to help clarify some of the logic above.
  isThrough: function() {
    return (this.throughTarget != null);
  },
  isJoined: function() {
    return (this.type === 'belongsToMany' || this.isThrough());
  },
  isMorph: function() {
    return (this.type === 'morphOne' || this.type === 'morphMany');
  },
  isSingle: function() {
    const type = this.type;
    return (type === 'hasOne' || type === 'belongsTo' || type === 'morphOne' || type === 'morphTo');
  },
  isInverse: function() {
    return (this.type === 'belongsTo' || this.type === 'morphTo');
  },

  // Sets the `pivotColumns` to be retrieved along with the current model.
  withPivot: function(columns) {
    if (!_.isArray(columns)) columns = [columns];
    this.pivotColumns = this.pivotColumns || [];
    push.apply(this.pivotColumns, columns);
  }

});

// Simple memoization of the singularize call.
const singularMemo = (function() {
  const cache = Object.create(null);
  return function(arg) {
    if (!(arg in cache)) {
      cache[arg] = inflection.singularize(arg);
    }
    return cache[arg];
  };
}());

// Specific to many-to-many relationships, these methods are mixed
// into the `belongsToMany` relationships when they are created,
// providing helpers for attaching and detaching related models.
const pivotHelpers = {

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
  attach(ids, options) {
    return Promise.try(() =>
      this.triggerThen('attaching', this, ids, options)
    ).then(() =>
      this._handler('insert', ids, options)
    ).then(response =>
      this.triggerThen('attached', this, response, options)
    ).return(this);
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
  detach(ids, options) {
    return Promise.try(() =>
      this.triggerThen('detaching', this, ids, options)
    ).then(() =>
      this._handler('delete', ids, options)
    ).then(response =>
      this.triggerThen('detached', this, response, options)
    ).return(this);
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
  updatePivot: function(attributes, options) {
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
  withPivot: function(columns) {
    this.relatedData.withPivot(columns);
    return this;
  },

  // Helper for handling either the `attach` or `detach` call on
  // the `belongsToMany` or `hasOne` / `hasMany` :through relationship.
  _handler: Promise.method(function(method, ids, options) {
    const pending = [];
    if (ids == null) {
      if (method === 'insert') return Promise.resolve(this);
      if (method === 'delete') pending.push(this._processPivot(method, null, options));
    }
    if (!_.isArray(ids)) ids = ids ? [ids] : [];
    _.each(ids, (id) => pending.push(this._processPivot(method, id, options)))
    return Promise.all(pending).return(this);
  }),

  // Handles preparing the appropriate constraints and then delegates
  // the database interaction to _processPlainPivot for non-.through()
  // pivot definitions, or _processModelPivot for .through() models.
  // Returns a promise.
  _processPivot: Promise.method(function(method, item) {
    const relatedData = this.relatedData
      , args        = Array.prototype.slice.call(arguments)
      , fks         = {}
      , data        = {};

    fks[relatedData.key('foreignKey')] = relatedData.parentFk;

    // If the item is an object, it's either a model
    // that we're looking to attach to this model, or
    // a hash of attributes to set in the relation.
    if (_.isObject(item)) {
      if (item instanceof ModelBase) {
        fks[relatedData.key('otherKey')] = item.id;
      } else if (method !== 'update') {
        _.extend(data, item);
      }
    } else if (item) {
      fks[relatedData.key('otherKey')] = item;
    }

    args.push(_.extend(data, fks), fks);

    if (this.relatedData.throughTarget) {
      return this._processModelPivot.apply(this, args);
    }

    return this._processPlainPivot.apply(this, args);
  }),

  // Applies constraints to the knex builder and handles shelling out
  // to either the `insert` or `delete` call for the current model,
  // returning a promise.
  _processPlainPivot: Promise.method(function(method, item, options, data) {
    const relatedData = this.relatedData;

    // Grab the `knex` query builder for the current model, and
    // check if we have any additional constraints for the query.
    const builder = this._builder(relatedData.joinTable());
    if (options && options.query) {
      Helpers.query.call(null, {_knex: builder}, [options.query]);
    }

    if (options) {
      if (options.transacting) builder.transacting(options.transacting);
      if (options.debug) builder.debug();
    }

    const collection = this;
    if (method === 'delete') {
      return builder.where(data).del().then(function() {
        if (!item) return collection.reset();
        const model = collection.get(data[relatedData.key('otherKey')])
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

    return builder.insert(data).then(function() {
      collection.add(item);
    });
  }),

  // Loads or prepares a pivot model based on the constraints and deals with
  // pivot model changes by calling the appropriate Bookshelf Model API
  // methods. Returns a promise.
  _processModelPivot: Promise.method(function(method, item, options, data, fks) {
    const relatedData = this.relatedData,
        JoinModel   = relatedData.throughTarget,
        joinModel   = new JoinModel();

    fks  = joinModel.parse(fks);
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
