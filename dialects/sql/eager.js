(function(define) {

"use strict";

define(function(require, exports) {

  var _ = require('underscore');
  var when = require('when');

  var Helpers = require('./helpers').Helpers;

  var EagerBase = require('../base/eager').EagerBase;

  // An `EagerRelation` object temporarily stores the models from an eager load,
  // and handles matching eager loaded objects with their parent(s). The `tempModel`
  // is only used to retrieve the value of the relation method, to know the constrains
  // for the eager query.
  var EagerRelation = exports.EagerRelation = EagerBase.extend({

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
            return new EagerRelation(relatedModels, resp, relatedData.createModel())
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
          .then(this.morphToHandler(relationName,
            relatedData.instance('morphTo', Target, {morphName: relationName}))));
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
    }

  });

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);