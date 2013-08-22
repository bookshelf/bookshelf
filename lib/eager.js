(function(define) { "use strict";

define(function(require, exports, module) {

  var _    = require('./ext/underscore')._;
  var when = require('./ext/when').when;

  var Helpers  = require('./helpers').Helpers;

  // Bookshelf.Eager
  // ---------------

  // An `Eager` object temporarily stores the models from an eager load,
  // and handles matching eager loaded objects with their parent(s). The `tempModel`
  // is only used to retrieve the value of the relation method, to know the constrains
  // for the eager query.
  var Eager = function(parent, parentResponse, target) {
    this.parent = parent;
    this.target = target;
    this.parentResponse = parentResponse;
    _.bindAll(this, 'pushModels', 'eagerFetch');
  };

  Eager.prototype = {

    // This helper function is used internally to determine which relations
    // are necessary for fetching based on the `model.load` or `withRelated` option.
    fetch: function(options) {
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
      var eagerHandler = this;
      return when.all(pendingDeferred).then(function() {
        return eagerHandler.parentResponse;
      });
    },

    // Prep the `withRelated` object, to normalize into an object where each
    // has a function that is called when running the query.
    prepWithRelated: function(withRelated) {
      if (!_.isArray(withRelated)) withRelated = [withRelated];
      return _.reduce(withRelated, function(memo, item) {
        _.isString(item) ? memo[item] = noop : _.extend(memo, item);
        return memo;
      }, {});
    },

    // Handles an eager loaded fetch, passing the name of the item we're fetching for,
    // and any options needed for the current fetch.
    eagerFetch: function(relationName, handled, options) {
      var relatedData = handled.relatedData;

      if (relatedData.type === 'morphTo') return this.morphToFetch(relationName, relatedData, options);

      // Call the function, if one exists, to constrain the eager loaded query.
      options.beforeFn.call(handled, handled.query());

      var relation = this;
      return handled
        .sync(_.extend({}, options, {parentResponse: this.parentResponse}))
        .select()
        .then(function(resp) {
          var relatedModels = relation.pushModels(relationName, handled, resp);

          // If there is a response, fetch additional nested eager relations, if any.
          if (resp.length > 0 && options.withRelated) {
            return new Eager(relatedModels, resp, relatedData.createModel())
              .fetch(options)
              .then(function() { return resp; });
          }
          return resp;
        });
    },

    // Special handler for the eager loaded morph-to relations, this handles
    // the fact that there are several potential models that we need to be fetching against.
    // pairing them up onto a single response for the eager loading.
    morphToFetch: function(relationName, relatedData, options) {
      var pending = [];
      var groups = _.groupBy(this.parent, function(m) {
        return m.get(relationName + '_type');
      });
      for (var group in groups) {
        var Target = Helpers.morphCandidate(relatedData.candidates, group);
        var target = new Target();
        pending.push(target
          .query('whereIn',
            _.result(target, 'idAttribute'), _.uniq(_.invoke(groups[group], 'get', relationName + '_id'))
          )
          .sync(options)
          .select()
          .then(this.morphToHandler(relationName, relatedData.instance('morphTo', Target, {morphName: relationName}))));
      }
      return when.all(pending).then(function(resps) {
        return _.flatten(resps);
      });
    },

    // Handler for the individual `morphTo` fetches,
    // attaching any of the related models onto the parent objects,
    // stopping at this level of the eager relation loading.
    morphToHandler: function(relationName, relatedData) {
      var eager = this;
      return function(resp) {
        eager.pushModels(relationName, {relatedData: relatedData}, resp);
      };
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
      // If this is a morphTo, we only want to pair on the morphValue for the current relation.
      if (relatedData.type === 'morphTo') {
        models = _.filter(models, function(model) { return model.get(relatedData.key('morphKey')) === relatedData.key('morphValue'); });
      }
      return relatedData.eagerPair(relationName, related, models);
    }
  };

  var noop = function() {};

  exports.Eager = Eager;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports, module); }
);