var Promise = require('bluebird');
var semver = require('semver');

module.exports = Promise.method(function (bookshelf) {
  var knex = bookshelf.knex;
  if (knex.client.dialect === 'postgresql') {
    return knex.raw('show server_version')
      .then(function(result) {
        var version = result.rows[0].server_version;
        return semver.gt(version, '9.2.0');
      })
  }
  return false;
});
