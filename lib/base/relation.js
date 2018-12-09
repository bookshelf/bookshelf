// Base Relation
// ---------------
'use strict';

const _ = require('lodash');
const CollectionBase = require('./collection');
const extend = require('../extend');

// Used internally, the `Relation` helps in simplifying the relationship building,
// centralizing all logic dealing with type & option handling.
function RelationBase(type, Target, options) {
  if (Target) {
    this.targetTableName = _.result(Target.prototype, 'tableName');
    this.targetIdAttribute = _.result(Target.prototype, 'idAttribute');
  }

  Object.assign(this, {type, target: Target}, options);
}

// Creates a new relation instance, used by the `Eager` relation in
// dealing with `morphTo` cases, where the same relation is targeting multiple models.
RelationBase.prototype.instance = function instance(type, Target, options) {
  return new this.constructor(type, Target, options);
};

// Creates a new, unparsed model, used internally in the eager fetch helper
// methods. (Parsing may mutate information necessary for eager pairing.)
RelationBase.prototype.createModel = function createModel(data) {
  if (this.target.prototype instanceof CollectionBase) {
    return new this.target.prototype.model(data)._reset();
  }
  return new this.target(data)._reset();
};

// Clones a relation. Required by Pagination plugin.
RelationBase.prototype.clone = function clone() {
  return new this.constructor(null, null, this);
};

RelationBase.extend = extend;
module.exports = RelationBase;
