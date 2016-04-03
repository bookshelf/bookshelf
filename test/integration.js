var _        = require('lodash');

module.exports = function(Bookshelf) {

  var Knex     = require('knex');
  var config   = require(process.env.BOOKSHELF_TEST || './integration/helpers/config');
  var Promise  = global.testPromise;

  var pg = require('knex')({client: 'postgres', connection: config.postgres});
  var sqlite3 = require('knex')({client: 'sqlite3', connection: config.sqlite3});
  var mysql = require('knex')({
    client: 'mysql',
    connection: config.mysql,
    pool: {
      afterCreate: function(connection, callback) {
        return Promise.promisify(connection.query, connection)("SET sql_mode='TRADITIONAL';", []).then(function() {
          callback(null, connection);
        });
      }
    }
  });

  var MySQL = require('../bookshelf')(mysql);
  var PostgreSQL = require('../bookshelf')(pg);
  var SQLite3 = require('../bookshelf')(sqlite3);

  it('should allow creating a new Bookshelf instance with "new"', function() {
    var bookshelf = new Bookshelf(sqlite3);
    expect(bookshelf.knex).to.equal(sqlite3);
  });

  _.each([MySQL, PostgreSQL, SQLite3], function(bookshelf) {

    var dialect = bookshelf.knex.client.dialect;

    describe('Dialect: ' + dialect, function() {

      this.dialect = dialect;

      before(function() {
        return require('./integration/helpers/migration')(bookshelf).then(function() {
           return require('./integration/helpers/inserts')(bookshelf);
        });
      });

      // Only testing this against mysql for now, just so the toString is reliable...
      if (dialect === 'mysql') {
        require('./integration/relation')(bookshelf);
      } else if (dialect === 'postgresql') {
        require('./integration/json')(bookshelf);
      }

      require('./integration/model')(bookshelf);
      require('./integration/collection')(bookshelf);
      require('./integration/relations')(bookshelf);
      require('./integration/plugin')(bookshelf);
      require('./integration/plugins/virtuals')(bookshelf);
      require('./integration/plugins/visibility')(bookshelf);
      require('./integration/plugins/registry')(bookshelf);
      require('./integration/plugins/pagination')(bookshelf);
    });

  });

};
