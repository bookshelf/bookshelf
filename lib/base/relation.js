'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _collection = require('./collection');

var _collection2 = _interopRequireDefault(_collection);

var _extend = require('../extend');

var _extend2 = _interopRequireDefault(_extend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Used internally, the `Relation` helps in simplifying the relationship building,
// centralizing all logic dealing with type & option handling.

var RelationBase = (function () {
  function RelationBase(type, Target, options) {
    (0, _classCallCheck3.default)(this, RelationBase);

    if (Target != null) {
      this.targetTableName = _lodash2.default.result(Target.prototype, 'tableName');
      this.targetIdAttribute = _lodash2.default.result(Target.prototype, 'idAttribute');
    }
    (0, _lodash.assign)(this, { type: type, target: Target }, options);
  }

  // Creates a new relation instance, used by the `Eager` relation in
  // dealing with `morphTo` cases, where the same relation is targeting multiple models.

  (0, _createClass3.default)(RelationBase, [{
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
})(); // Base Relation
// ---------------

exports.default = RelationBase;

(0, _lodash.assign)(RelationBase, { extend: _extend2.default });