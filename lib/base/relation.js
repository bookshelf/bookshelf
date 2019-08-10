const _ = require('lodash');
const CollectionBase = require('./collection');
const extend = require('../extend');

/**
 * @class
 * @param {string} type
 *   The type of relation to create. Can be one of 'hasOne', 'hasMany', 'belongsTo',
 *   'belongsToMany' or 'morphTo'.
 * @param {Model|Collection|null} Target
 *   The target model or collection for this relation or `null` in case the target model will be
 *   determined at a later time, as is the case of `morphTo` relations.
 * @param {object} options
 *   Additional properties to set on the relation object. These vary according to the type of
 *   relation.
 */
function RelationBase(type, Target, options) {
  if (Target) {
    this.targetTableName = _.result(Target.prototype, 'tableName');
    this.targetIdAttribute = _.result(Target.prototype, 'idAttribute');
  }

  Object.assign(this, {type, target: Target}, options);
}

/**
 * Creates a new relation instance. Used by the `Eager` relation when dealing with `morphTo` cases,
 * where the same relation is targeting multiple models. It uses the same argument parameters as the
 * base constructor.
 *
 * @return {RelationBase}
 */
RelationBase.prototype.instance = function instance(type, Target, options) {
  return new this.constructor(type, Target, options);
};

/**
 * Creates a new, unparsed model. Used internally in the eager fetch helper methods because parsing
 * may mutate information necessary for eager pairing.
 *
 * @param {object} data Model attributes to set on the new model.
 * @return {Model} The new model.
 */
RelationBase.prototype.createModel = function createModel(data) {
  if (this.target.prototype instanceof CollectionBase) {
    return new this.target.prototype.model(data)._reset();
  }
  return new this.target(data)._reset();
};

/**
 * Clones a relation. Required by {@link Model#fetchPage}.
 *
 * @todo Can probably be removed for a simpler approach, or just the `instance` method.
 * @return {RelationBase}
 */
RelationBase.prototype.clone = function clone() {
  return new this.constructor(null, null, this);
};

/**
 * Extends the Base Relation.
 *
 * @method
 * @static
 */
RelationBase.extend = extend;

module.exports = RelationBase;
