'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _promise = require('./promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Eager Base
// ---------------

// The EagerBase provides a scaffold for handling with eager relation
// pairing, by queueing the appropriate related method calls with
// a database specific `eagerFetch` method, which then may utilize
// `pushModels` for pairing the models depending on the database need.

function EagerBase(parent, parentResponse, target) {
  this.parent = parent;
  this.parentResponse = parentResponse;
  this.target = target;
}

_lodash2.default.extend(EagerBase.prototype, {

  // This helper function is used internally to determine which relations
  // are necessary for fetching based on the `model.load` or `withRelated` option.
  fetch: _promise2.default.method(function (options) {
    var target = this.target;
    var handled = this.handled = {};
    var withRelated = this.prepWithRelated(options.withRelated);
    var subRelated = {};

    // Internal flag to determine whether to set the ctor(s) on the `Relation` object.
    target._isEager = true;

    // Eager load each of the `withRelated` relation item, splitting on '.'
    // which indicates a nested eager load.
    for (var key in withRelated) {
      var related = key.split('.');
      var relationName = related[0];

      // Add additional eager items to an array, to load at the next level in the query.
      if (related.length > 1) {
        var relatedObj = {};
        subRelated[relationName] = subRelated[relationName] || [];
        relatedObj[related.slice(1).join('.')] = withRelated[key];
        subRelated[relationName].push(relatedObj);
      }

      // Only allow one of a certain nested type per-level.
      if (handled[relationName]) continue;

      if (!_lodash2.default.isFunction(target[relationName])) {
        throw new Error(relationName + ' is not defined on the model.');
      }

      var relation = target[relationName]();

      handled[relationName] = relation;
    }

    // Delete the internal flag from the model.
    delete target._isEager;

    // Fetch all eager loaded models, loading them onto
    // an array of pending deferred objects, which will handle
    // all necessary pairing with parent objects, etc.
    var pendingDeferred = [];
    for (var _relationName in handled) {
      pendingDeferred.push(this.eagerFetch(_relationName, handled[_relationName], _lodash2.default.extend({}, options, {
        isEager: true,
        withRelated: subRelated[_relationName],
        _beforeFn: withRelated[_relationName] || _lodash.noop
      })));
    }

    // Return a deferred handler for all of the nested object sync
    // returning the original response when these syncs & pairings are complete.
    return _promise2.default.all(pendingDeferred).return(this.parentResponse);
  }),

  // Prep the `withRelated` object, to normalize into an object where each
  // has a function that is called when running the query.
  prepWithRelated: function prepWithRelated(withRelated) {
    if (!_lodash2.default.isArray(withRelated)) withRelated = [withRelated];
    var obj = {};
    for (var i = 0, l = withRelated.length; i < l; i++) {
      var related = withRelated[i];
      if (_lodash2.default.isString(related)) {
        obj[related] = _lodash.noop;
      } else {
        _lodash2.default.extend(obj, related);
      }
    }
    return obj;
  },

  // Pushes each of the incoming models onto a new `related` array,
  // which is used to correcly pair additional nested relations.
  pushModels: function pushModels(relationName, handled, response) {
    var models = this.parent;
    var relatedData = handled.relatedData;

    var related = (0, _lodash.map)(response, function (row) {
      return relatedData.createModel(row);
    });
    return relatedData.eagerPair(relationName, related, models);
  }

});

module.exports = EagerBase;