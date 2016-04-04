'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _promise = require('./base/promise');

var _promise2 = _interopRequireDefault(_promise);

var _eager = require('./base/eager');

var _eager2 = _interopRequireDefault(_eager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// EagerRelation
// ---------------

var getAttributeUnique = function getAttributeUnique(models, attribute) {
  return (0, _lodash.uniq)((0, _lodash.map)(models, function (m) {
    return m.get(attribute);
  }));
};

// An `EagerRelation` object temporarily stores the models from an eager load,
// and handles matching eager loaded objects with their parent(s). The
// `tempModel` is only used to retrieve the value of the relation method, to
// know the constraints for the eager query.

var EagerRelation = (function (_EagerBase) {
  (0, _inherits3.default)(EagerRelation, _EagerBase);

  function EagerRelation() {
    (0, _classCallCheck3.default)(this, EagerRelation);
    return (0, _possibleConstructorReturn3.default)(this, Object.getPrototypeOf(EagerRelation).apply(this, arguments));
  }

  (0, _createClass3.default)(EagerRelation, [{
    key: 'eagerFetch',

    // Handles an eager loaded fetch, passing the name of the item we're fetching
    // for, and any options needed for the current fetch.
    value: function eagerFetch(relationName, handled, options) {
      var _this2 = this;

      var relatedData = handled.relatedData;

      // skip eager loading for rows where the foreign key isn't set
      if (relatedData.parentFk === null) return;

      if (relatedData.type === 'morphTo') {
        return this.morphToFetch(relationName, relatedData, options);
      }

      return handled.sync((0, _extends3.default)({}, options, { parentResponse: this.parentResponse })).select().tap(function (response) {
        return _this2._eagerLoadHelper(response, relationName, handled, _lodash2.default.omit(options, 'parentResponse'));
      });
    }

    // Special handler for the eager loaded morph-to relations, this handles the
    // fact that there are several potential models that we need to be fetching
    // against.  pairing them up onto a single response for the eager loading.

  }, {
    key: 'morphToFetch',
    value: function morphToFetch(relationName, relatedData, options) {
      var _this3 = this;

      var columnNames = relatedData.columnNames || [];
      var morphName = relatedData.morphName;

      var _columnNames = (0, _slicedToArray3.default)(columnNames, 2);

      var _columnNames$ = _columnNames[0];
      var typeColumn = _columnNames$ === undefined ? morphName + '_type' : _columnNames$;
      var _columnNames$2 = _columnNames[1];
      var idColumn = _columnNames$2 === undefined ? morphName + '_id' : _columnNames$2;

      var parentsByType = (0, _lodash.groupBy)(this.parent, function (model) {
        return model.get(typeColumn);
      });
      var TargetByType = (0, _lodash.mapValues)(parentsByType, function (parents, type) {
        return _helpers2.default.morphCandidate(relatedData.candidates, type);
      });

      return _promise2.default.all((0, _lodash.map)(parentsByType, function (parents, type) {
        var Target = TargetByType[type];
        var idAttribute = _lodash2.default.result(Target.prototype, 'idAttribute');
        var ids = getAttributeUnique(parents, idColumn);

        return Target.query('whereIn', idAttribute, ids).sync(options).select().tap(function (response) {
          var clone = relatedData.instance('morphTo', Target, { morphName: morphName, columnNames: columnNames });
          return _this3._eagerLoadHelper(response, relationName, { relatedData: clone }, options);
        });
      })).then(_lodash.flatten);
    }

    // Handles the eager load for both the `morphTo` and regular cases.

  }, {
    key: '_eagerLoadHelper',
    value: function _eagerLoadHelper(response, relationName, handled, options) {
      var relatedModels = this.pushModels(relationName, handled, response);
      var relatedData = handled.relatedData;

      // If there is a response, fetch additional nested eager relations, if any.
      if (response.length > 0 && options.withRelated) {
        var relatedModel = relatedData.createModel();

        // If this is a `morphTo` relation, we need to do additional processing
        // to ensure we don't try to load any relations that don't look to exist.
        if (relatedData.type === 'morphTo') {
          var withRelated = this._filterRelated(relatedModel, options);
          if (withRelated.length === 0) return;
          options = _lodash2.default.extend({}, options, { withRelated: withRelated });
        }
        return new EagerRelation(relatedModels, response, relatedModel).fetch(options).return(response);
      }
    }

    // Filters the `withRelated` on a `morphTo` relation, to ensure that only valid
    // relations are attempted for loading.

  }, {
    key: '_filterRelated',
    value: function _filterRelated(relatedModel, options) {

      // By this point, all withRelated should be turned into a hash, so it should
      // be fairly simple to process by splitting on the dots.
      return _lodash2.default.reduce(options.withRelated, function (memo, val) {
        for (var key in val) {
          var seg = key.split('.')[0];
          if (_lodash2.default.isFunction(relatedModel[seg])) memo.push(val);
        }
        return memo;
      }, []);
    }
  }]);
  return EagerRelation;
})(_eager2.default);

exports.default = EagerRelation;