// EagerRelation
// ---------------
var _         = require('lodash');

var Helpers   = require('./helpers').Helpers;
var EagerBase = require('../base/eager').EagerBase;
var Promise   = require('../base/promise').Promise;

// An `EagerRelation` object temporarily stores the models from an eager load,
// and handles matching eager loaded objects with their parent(s). The `tempModel`
// is only used to retrieve the value of the relation method, to know the constrains
// for the eager query.
var EagerRelation = exports.EagerRelation = EagerBase.extend({

  // Handles an eager loaded fetch, passing the name of the item we're fetching for,
  // and any options needed for the current fetch.
  eagerFetch: Promise.method(function(relationName, handled, options) {
    var relatedData = handled.relatedData;

    if (relatedData.type === 'morphTo') return this.morphToFetch(relationName, relatedData, options);

    // Call the function, if one exists, to constrain the eager loaded query.
    options.beforeFn.call(handled, handled.query());

    return handled
      .sync(_.extend({}, options, {parentResponse: this.parentResponse}))
      .select()
      .tap(eagerLoadHelper(this, relationName, handled, options));
  }),

  // Special handler for the eager loaded morph-to relations, this handles
  // the fact that there are several potential models that we need to be fetching against.
  // pairing them up onto a single response for the eager loading.
  morphToFetch: Promise.method(function(relationName, relatedData, options) {
    var pending = [];
    var groups = _.groupBy(this.parent, function(m) {
      return m.get(relatedData.morphName + '_type');
    });
    for (var group in groups) {
      var Target = Helpers.morphCandidate(relatedData.candidates, group);
      var target = new Target();
      pending.push(target
        .query('whereIn',
          _.result(target, 'idAttribute'),
          _.uniq(_.invoke(groups[group], 'get', relatedData.morphName + '_id'))
        )
        .sync(options)
        .select()
        .tap(eagerLoadHelper(this, relationName, {
          relatedData: relatedData.instance('morphTo', Target, {morphName: relatedData.morphName})
        }, options)));
    }
    return Promise.all(pending).then(function(resps) {
      return _.flatten(resps);
    });
  })

});

// Handles the eager load for both the `morphTo` and regular cases.
function eagerLoadHelper(relation, relationName, handled, options) {
  return function(resp) {
    var relatedModels = relation.pushModels(relationName, handled, resp);
    var relatedData   = handled.relatedData;

    // If there is a response, fetch additional nested eager relations, if any.
    if (resp.length > 0 && options.withRelated) {
      var relatedModel = relatedData.createModel();

      // If this is a `morphTo` relation, we need to do additional processing
      // to ensure we don't try to load any relations that don't look to exist.
      if (relatedData.type === 'morphTo') {
        var withRelated = filterRelated(relatedModel, options);
        if (withRelated.length === 0) return;
        options = _.extend({}, options, {withRelated: withRelated});
      }
      return new EagerRelation(relatedModels, resp, relatedModel).fetch(options).yield(resp);
    }
  };
}

// Filters the `withRelated` on a `morphTo` relation, to ensure that only valid
// relations are attempted for loading.
function filterRelated(relatedModel, options) {

  // By this point, all withRelated should be turned into a hash, so it should
  // be fairly simple to process by splitting on the dots.
  return _.reduce(options.withRelated, function(memo, val) {
    for (var key in val) {
      var seg = key.split('.')[0];
      if (_.isFunction(relatedModel[seg])) memo.push(val);
    }
    return memo;
  }, []);
}
