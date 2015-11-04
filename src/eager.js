// EagerRelation
// ---------------
import _ from 'lodash'
import inherits from 'inherits';

import Helpers from './helpers';
import Promise from './base/promise';
import EagerBase from './base/eager';

// An `EagerRelation` object temporarily stores the models from an eager load,
// and handles matching eager loaded objects with their parent(s). The `tempModel`
// is only used to retrieve the value of the relation method, to know the constrains
// for the eager query.
function EagerRelation() {
  EagerBase.apply(this, arguments);
}
inherits(EagerRelation, EagerBase);

_.extend(EagerRelation.prototype, {

  // Handles an eager loaded fetch, passing the name of the item we're fetching for,
  // and any options needed for the current fetch.
  eagerFetch: Promise.method(function(relationName, handled, options) {
    const relatedData = handled.relatedData;

    // skip eager loading for rows where the foreign key isn't set
    if (relatedData.parentFk === null) return;

    if (relatedData.type === 'morphTo') return this.morphToFetch(relationName, relatedData, options);

    return handled
      .sync(_.extend(options, {parentResponse: this.parentResponse}))
      .select()
      .bind(this)
      .tap(function(response) {
        return this._eagerLoadHelper(response, relationName, handled, _.omit(options, 'parentResponse'));
      });
  }),

  // Special handler for the eager loaded morph-to relations, this handles
  // the fact that there are several potential models that we need to be fetching against.
  // pairing them up onto a single response for the eager loading.
  morphToFetch: Promise.method(function(relationName, relatedData, options) {
    const groups = _.groupBy(this.parent, function(m) {
      const typeKeyName = relatedData.columnNames && relatedData.columnNames[0] ? relatedData.columnNames[0] : relatedData.morphName + '_type';
      return m.get(typeKeyName);
    });
    const pending = _.reduce(groups, (memo, val, group) => {
      const Target = Helpers.morphCandidate(relatedData.candidates, group);
      const target = new Target();
      const idKeyName = relatedData.columnNames && relatedData.columnNames[1] ? relatedData.columnNames[1] : relatedData.morphName + '_id';
      memo.push(target
        .query('whereIn',
          _.result(target, 'idAttribute'),
          _.uniq(_.invoke(groups[group], 'get', idKeyName))
        )
        .sync(options)
        .select()
        .bind(this)
        .tap(function(response) {
          return this._eagerLoadHelper(response, relationName, {
            relatedData: relatedData.instance('morphTo', Target, {morphName: relatedData.morphName, columnNames: relatedData.columnNames})
          }, options);
        }));
        return memo;
    }, []);
    return Promise.all(pending).then(function(resps) {
      return _.flatten(resps);
    });
  }),

  // Handles the eager load for both the `morphTo` and regular cases.
  _eagerLoadHelper: function(response, relationName, handled, options) {
    const relatedModels = this.pushModels(relationName, handled, response);
    const relatedData   = handled.relatedData;

    // If there is a response, fetch additional nested eager relations, if any.
    if (response.length > 0 && options.withRelated) {
      const relatedModel = relatedData.createModel();

      // If this is a `morphTo` relation, we need to do additional processing
      // to ensure we don't try to load any relations that don't look to exist.
      if (relatedData.type === 'morphTo') {
        const withRelated = this._filterRelated(relatedModel, options);
        if (withRelated.length === 0) return;
        options = _.extend({}, options, {withRelated: withRelated});
      }
      return new EagerRelation(relatedModels, response, relatedModel).fetch(options).return(response);
    }
  },

  // Filters the `withRelated` on a `morphTo` relation, to ensure that only valid
  // relations are attempted for loading.
  _filterRelated: function(relatedModel, options) {

    // By this point, all withRelated should be turned into a hash, so it should
    // be fairly simple to process by splitting on the dots.
    return _.reduce(options.withRelated, function(memo, val) {
      for (const key in val) {
        const seg = key.split('.')[0];
        if (_.isFunction(relatedModel[seg])) memo.push(val);
      }
      return memo;
    }, []);
  }

});

module.exports = EagerRelation;
