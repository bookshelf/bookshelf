// Touch plugin -
// Allows the user to update the timestamps of related models when saving a model
// -----
//
'use strict';
var _       = require('lodash');
var Promise = require('bluebird');

var updatedBelongsToMany = function (relation, key, update, collection) {
  var m = collection.first();
  var id = m ? m.idAttribute : 'id';

  // since sqlite does not support joins in update statements, we have to take the
  // expensive route and fetch all related records, pluck their ids and then
  // where using `whereIn`
  return relation.query()
  .update(update)
  .debug()
  .whereIn(key, _.pluck(collection.models, id));
};

module.exports = function(Bookshelf) {
  var Model = Bookshelf.Model.extend({
    // Replace with an array of relation names whose timestamps should be updated on `save`
    touches: null,

    initialize: function () {
      // Assume that `touches` is an array
      if (this.touches && this.touches.length) {
        this.on('saving', this._touchRelations);
      }
    },

    _touchRelations: function () {
      var touches = this.touches;
      var toTouch = [];
      var updateTime = new Date();

      for (var i = touches.length - 1; i >= 0; i--) {
        var relation = this[touches[i]]();
        var relatedData = relation.relatedData;
        var timestamps = relatedData.target.prototype.hasTimestamps;
        var relationType = relatedData.type;

        // without timestamps we can safely skip this relation
        if (!timestamps) {
          continue;
        }

        var query;
        var updateTimestampKey = Array.isArray(timestamps) ? timestamps[1] : 'updated_at';
        var update = {};
        update[updateTimestampKey] = updateTime;

        if (relationType.indexOf('belongsToMany') !== -1) {
          var relatedId = relatedData.targetIdAttribute;
          query = relation.fetch()
          .then(updatedBelongsToMany.bind(null, relation, relatedId, update));
        } else {
          query = relation.query();
          relatedData.whereClauses(query);
          query.debug();
          query.update(update);
        }
        toTouch.push(
          query
        );
      }

      return Promise.all(toTouch);
    }

  });

  Bookshelf.Model = Model;
};