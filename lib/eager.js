'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _promise = require('./base/promise');

var _promise2 = _interopRequireDefault(_promise);

var _eager = require('./base/eager');

var _eager2 = _interopRequireDefault(_eager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // EagerRelation
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
  _inherits(EagerRelation, _EagerBase);

  function EagerRelation() {
    _classCallCheck(this, EagerRelation);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(EagerRelation).apply(this, arguments));
  }

  _createClass(EagerRelation, [{
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

      return handled.sync(_extends({}, options, { parentResponse: this.parentResponse })).select().tap(function (response) {
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

      var _columnNames = _slicedToArray(columnNames, 2);

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