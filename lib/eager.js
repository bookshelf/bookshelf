// EagerRelation
// ---------------
'use strict';

const _ = require('lodash');
const Helpers = require('./helpers');
const Promise = require('bluebird');
const EagerBase = require('./base/eager');
const getAttributeUnique = (models, attribute) => _.uniq(_.map(models, (m) => m.get(attribute)));

// An `EagerRelation` object temporarily stores the models from an eager load,
// and handles matching eager loaded objects with their parent(s). The
// `tempModel` is only used to retrieve the value of the relation method, to
// know the constraints for the eager query.
class EagerRelation extends EagerBase {
  // Handles an eager loaded fetch, passing the name of the item we're fetching
  // for, and any options needed for the current fetch.
  eagerFetch(relationName, handled, options) {
    const relatedData = handled.relatedData;

    // skip eager loading for rows where the foreign key isn't set
    if (relatedData.parentFk === null) return;

    if (relatedData.type === 'morphTo') {
      return this.morphToFetch(relationName, relatedData, options);
    }

    return handled
      .sync(Object.assign({}, options, {parentResponse: this.parentResponse}))
      .select()
      .tap((response) => this._eagerLoadHelper(response, relationName, handled, _.omit(options, 'parentResponse')));
  }

  // Special handler for the eager loaded morph-to relations, this handles the
  // fact that there are several potential models that we need to be fetching
  // against.  pairing them up onto a single response for the eager loading.
  morphToFetch(relationName, relatedData, options) {
    const columnNames = relatedData.columnNames || [];
    const morphName = relatedData.morphName;
    const typeColumn = columnNames[0] === undefined ? `${morphName}_type` : columnNames[0];
    const idColumn = columnNames[1] === undefined ? `${morphName}_id` : columnNames[1];

    const parentsByType = _.groupBy(this.parent, (model) => {
      const type = model.get(typeColumn);

      if (!type)
        throw new Error("The target polymorphic model could not be determined because it's missing the type attribute");

      return type;
    });
    const TargetByType = _.mapValues(parentsByType, (parents, type) =>
      Helpers.morphCandidate(relatedData.candidates, type)
    );

    return Promise.all(
      _.map(parentsByType, (parents, type) => {
        const Target = TargetByType[type];
        const idAttribute = _.result(Target.prototype, 'idAttribute');
        const ids = getAttributeUnique(parents, idColumn);

        return Target.query('whereIn', idAttribute, ids)
          .sync(options)
          .select()
          .tap((response) => {
            const clone = relatedData.instance('morphTo', Target, {
              morphName,
              columnNames,
              morphValue: type
            });
            return this._eagerLoadHelper(response, relationName, {relatedData: clone}, options);
          });
      })
    ).then(_.flatten);
  }

  // Handles the eager load for both the `morphTo` and regular cases.
  _eagerLoadHelper(response, relationName, handled, options) {
    const relatedData = handled.relatedData;
    const isEmptyHasOne = response.length === 0 && relatedData.type === 'hasOne';
    const relatedModels = isEmptyHasOne ? [] : this.pushModels(relationName, handled, response, options);

    return Promise.try(() => {
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
    }).tap(() => {
      return Promise.map(relatedModels, (model) => model.triggerThen('fetched', model, model.attributes, options));
    });
  }

  // Filters the `withRelated` on a `morphTo` relation, to ensure that only valid
  // relations are attempted for loading.
  _filterRelated(relatedModel, options) {
    // By this point, all withRelated should be turned into a hash, so it should
    // be fairly simple to process by splitting on the dots.
    return _.reduce(
      options.withRelated,
      function(memo, val) {
        for (const key in val) {
          const seg = key.split('.')[0];
          if (_.isFunction(relatedModel[seg])) memo.push(val);
        }
        return memo;
      },
      []
    );
  }
}

module.exports = EagerRelation;
