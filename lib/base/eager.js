// Eager Base
// ---------------

// The EagerBase provides a scaffold for handling with eager relation
// pairing, by queueing the appropriate related method calls with
// a database specific `eagerFetch` method, which then may utilize
// `pushModels` for pairing the models depending on the database need.

'use strict';

const _ = require('lodash');
const Promise = require('./promise');

function EagerBase(parent, parentResponse, target) {
  this.parent = parent;
  this.parentResponse = parentResponse;
  this.target = target;
}

_.extend(EagerBase.prototype, {
  // This helper function is used internally to determine which relations
  // are necessary for fetching based on the `model.load` or `withRelated` option.
  fetch: Promise.method(function(options) {
    const target = this.target;
    const handled = (this.handled = {});
    const withRelated = this.prepWithRelated(options.withRelated);
    const subRelated = {};

    // Internal flag to determine whether to set the ctor(s) on the `Relation` object.
    target._isEager = true;

    // Eager load each of the `withRelated` relation item, splitting on '.'
    // which indicates a nested eager load.
    for (const key in withRelated) {
      const related = key.split('.');
      const relationName = related[0];

      // Add additional eager items to an array, to load at the next level in the query.
      if (related.length > 1) {
        const relatedObj = {};
        subRelated[relationName] = subRelated[relationName] || [];
        relatedObj[related.slice(1).join('.')] = withRelated[key];
        subRelated[relationName].push(relatedObj);
      }

      // Only allow one of a certain nested type per-level.
      if (handled[relationName]) continue;

      if (!_.isFunction(target[relationName])) {
        throw new Error(relationName + ' is not defined on the model.');
      }

      const relation = target[relationName]();

      handled[relationName] = relation;
    }

    // Delete the internal flag from the model.
    delete target._isEager;

    // Fetch all eager loaded models, loading them onto
    // an array of pending deferred objects, which will handle
    // all necessary pairing with parent objects, etc.
    const pendingDeferred = [];
    for (const relationName in handled) {
      pendingDeferred.push(
        this.eagerFetch(
          relationName,
          handled[relationName],
          _.extend({}, options, {
            isEager: true,
            withRelated: subRelated[relationName],
            _beforeFn: withRelated[relationName] || function() {}
          })
        )
      );
    }

    // Return a deferred handler for all of the nested object sync
    // returning the original response when these syncs & pairings are complete.
    return Promise.all(pendingDeferred).return(this.parentResponse);
  }),

  // Prep the `withRelated` object, to normalize into an object, where the value
  // of each key is a function that is called when running the query.
  prepWithRelated: function(withRelated) {
    if (!Array.isArray(withRelated)) withRelated = [withRelated];
    const obj = {};
    for (let i = 0, l = withRelated.length; i < l; i++) {
      const related = withRelated[i];
      if (_.isString(related)) {
        obj[related] = function() {};
      } else {
        _.extend(obj, related);
      }
    }
    return obj;
  },

  // Pushes each of the incoming models onto a new `related` array,
  // which is used to correcly pair additional nested relations.
  pushModels: function pushModels(relationName, handled, response, options) {
    const models = this.parent;
    const relatedData = handled.relatedData;
    const related = _.map(response, (row) => relatedData.createModel(row));

    return relatedData.eagerPair(relationName, related, models, options);
  }
});

module.exports = EagerBase;
