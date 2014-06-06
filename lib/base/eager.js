// Eager Base
// ---------------

// The EagerBase provides a scaffold for handling with eager relation
// pairing, by queueing the appropriate related method calls with
// a database specific `eagerFetch` method, which then may utilize
// `pushModels` for pairing the models depending on the database need.

var _         = require('lodash');
var Backbone  = require('backbone');
var Promise   = require('./promise');

function EagerBase(parent, parentResponse, target) {
  this.parent = parent;
  this.parentResponse = parentResponse;
  this.target = target;
}

_.extend(EagerBase.prototype, {

  // This helper function is used internally to determine which relations
  // are necessary for fetching based on the `model.load` or `withRelated` option.
  fetch: Promise.method(function(options) {
    var relationName, related, relation;
    var target      = this.target;
    var handled     = this.handled = {};
    var withRelated = this.prepWithRelated(options.withRelated);
    var subRelated  = {};

    // Internal flag to determine whether to set the ctor(s) on the `Relation` object.
    target._isEager = true;

    // Eager load each of the `withRelated` relation item, splitting on '.'
    // which indicates a nested eager load.
    for (var key in withRelated) {

      related = key.split('.');
      relationName = related[0];

      // Add additional eager items to an array, to load at the next level in the query.
      if (related.length > 1) {
        var relatedObj = {};
        subRelated[relationName] || (subRelated[relationName] = []);
        relatedObj[related.slice(1).join('.')] = withRelated[key];
        subRelated[relationName].push(relatedObj);
      }

      // Only allow one of a certain nested type per-level.
      if (handled[relationName]) continue;

      relation = target[relationName]();

      if (!relation) throw new Error(relationName + ' is not defined on the model.');

      handled[relationName] = relation;
    }

    // Delete the internal flag from the model.
    delete target._isEager;

    // Fetch all eager loaded models, loading them onto
    // an array of pending deferred objects, which will handle
    // all necessary pairing with parent objects, etc.
    var pendingDeferred = [];
    for (relationName in handled) {
      pendingDeferred.push(this.eagerFetch(relationName, handled[relationName], _.extend({}, options, {
        isEager: true,
        withRelated: subRelated[relationName],
        beforeFn: withRelated[relationName] || noop
      })));
    }

    // Return a deferred handler for all of the nested object sync
    // returning the original response when these syncs & pairings are complete.
    return Promise.all(pendingDeferred).yield(this.parentResponse);
  }),

  // Prep the `withRelated` object, to normalize into an object where each
  // has a function that is called when running the query.
  prepWithRelated: function(withRelated) {
    if (!_.isArray(withRelated)) withRelated = [withRelated];
    var obj = {};
    for (var i = 0, l = withRelated.length; i < l; i++) {
      var related = withRelated[i];
      _.isString(related) ? obj[related] = noop : _.extend(obj, related);
    }
    return obj;
  },

  // Pushes each of the incoming models onto a new `related` array,
  // which is used to correcly pair additional nested relations.
  pushModels: function(relationName, handled, resp) {
    var models      = this.parent;
    var relatedData = handled.relatedData;
    var related     = [];
    for (var i = 0, l = resp.length; i < l; i++) {
      related.push(relatedData.createModel(resp[i]));
    }
    return relatedData.eagerPair(relationName, related, models);
  }

});

var noop = function() {};

module.exports = EagerBase;