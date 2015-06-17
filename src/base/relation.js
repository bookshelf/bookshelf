// Base Relation
// ---------------

var _              = require('lodash')
var CollectionBase = require('./collection')

// Used internally, the `Relation` helps in simplifying the relationship building,
// centralizing all logic dealing with type & option handling.
function RelationBase(type, Target, options) {
  this.type = type
  this.target = Target
  if (this.target) {
    this.targetTableName   = _.result(Target.prototype, 'tableName')
    this.targetIdAttribute = _.result(Target.prototype, 'idAttribute')
  }
  _.extend(this, options)
}

_.extend(RelationBase.prototype, {

  // Creates a new relation instance, used by the `Eager` relation in
  // dealing with `morphTo` cases, where the same relation is targeting multiple models.
  instance: function(type, Target, options) {
    return new this.constructor(type, Target, options)
  },

  // Creates a new, unparsed model, used internally in the eager fetch helper
  // methods. (Parsing may mutate information necessary for eager pairing.)
  createModel: function(data) {
    if (this.target.prototype instanceof CollectionBase) {
      return new this.target.prototype.model(data)._reset()
    }
    return new this.target(data)._reset()
  },

  // Eager pair the models.
  eagerPair: function() {}

})

RelationBase.extend = require('../extend')

module.exports = RelationBase;