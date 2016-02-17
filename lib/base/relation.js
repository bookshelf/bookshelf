'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); // Base Relation
// ---------------

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _collection = require('./collection');

var _collection2 = _interopRequireDefault(_collection);

var _extend = require('../extend');

var _extend2 = _interopRequireDefault(_extend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Used internally, the `Relation` helps in simplifying the relationship building,
// centralizing all logic dealing with type & option handling.

var RelationBase = (function () {
  function RelationBase(type, Target, options) {
    _classCallCheck(this, RelationBase);

    if (Target != null) {
      this.targetTableName = _lodash2.default.result(Target.prototype, 'tableName');
      this.targetIdAttribute = _lodash2.default.result(Target.prototype, 'idAttribute');
    }
    (0, _lodash.assign)(this, { type: type, target: Target }, options);
  }

  // Creates a new relation instance, used by the `Eager` relation in
  // dealing with `morphTo` cases, where the same relation is targeting multiple models.

  _createClass(RelationBase, [{
    key: 'instance',
    value: function instance(type, Target, options) {
      return new this.constructor(type, Target, options);
    }

    // Creates a new, unparsed model, used internally in the eager fetch helper
    // methods. (Parsing may mutate information necessary for eager pairing.)

  }, {
    key: 'createModel',
    value: function createModel(data) {
      if (this.target.prototype instanceof _collection2.default) {
        return new this.target.prototype.model(data)._reset();
      }
      return new this.target(data)._reset();
    }

    // Eager pair the models.

  }, {
    key: 'eagerPair',
    value: function eagerPair() {}
  }]);

  return RelationBase;
})();

exports.default = RelationBase;

(0, _lodash.assign)(RelationBase, { extend: _extend2.default });