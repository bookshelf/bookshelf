// Base Relation
// ---------------

import { assign, result } from 'lodash';
import CollectionBase from './collection';
import extend from '../extend';

// Used internally, the `Relation` helps in simplifying the relationship building,
// centralizing all logic dealing with type & option handling.
export default class RelationBase {

  constructor(type, Target, options) {
    if (Target != null) {
      this.targetTableName   = result(Target.prototype, 'tableName');
      this.targetIdAttribute = result(Target.prototype, 'idAttribute');
    }
    assign(this, { type, target: Target }, options);
  }

  // Creates a new relation instance, used by the `Eager` relation in
  // dealing with `morphTo` cases, where the same relation is targeting multiple models.
  instance(type, Target, options) {
    return new this.constructor(type, Target, options);
  }

  // Creates a new, unparsed model, used internally in the eager fetch helper
  // methods. (Parsing may mutate information necessary for eager pairing.)
  createModel(data) {
    if (this.target.prototype instanceof CollectionBase) {
      return new this.target.prototype.model(data)._reset();
    }
    return new this.target(data)._reset();
  }

  // Clones a relation. Required by Pagination plugin.
  clone() {
    return new this.constructor(null, null, this)
  }

  // Eager pair the models.
  eagerPair() {}
}

assign(RelationBase, { extend });
