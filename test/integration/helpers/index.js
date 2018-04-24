var _ = require('lodash');

exports.formatNumber = function(dialect) {
  return {
    mysql: _.identity,
    sqlite3: _.identity,
    postgresql: function(count) { return count.toString() }
  }[dialect];
}

exports.countModels = function countModels(Model, options) {
  return function() {
    return Model.forge().count(options).then(function(count) {
      if (typeof count === 'string') return parseInt(count);
      return count;
    });
  }
}

exports.sort = function sort(model) {
  var sorted = {}

  for (var attribute in model) {
    sorted[attribute] = this.sortCollection(model[attribute])
  }

  return sorted
}

exports.sortCollection = function sortCollection(collection) {
  if (!Array.isArray(collection)) return collection

  collection.sort(function(model1, model2) {
    return model1.id - model2.id
  })

  return collection.map(this.sort, exports)
}
