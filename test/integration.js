var _        = require('lodash');

module.exports = function(Bookshelf) {

  var Knex     = require('knex');
  var config   = require(process.env.BOOKSHELF_TEST || './integration/helpers/config');
  var Promise  = global.testPromise;

  // excluding fdbsql dialect from default integrations test
  var testIntegrationDialects = (process.env.BOOKSHELF_TEST_INTEGRATION_DIALECTS || "mysql postgresql sqlite3").match(/\w+/g);

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
  // Not yet in released version
  //var fdbsql = require('knex')({client: 'fdbsql', connection: config.fdbsql});

  var testBookshelves = {
    mysql:      require('../bookshelf')(mysql),
    postgresql: require('../bookshelf')(pg),
    sqlite3:    require('../bookshelf')(sqlite3),
    //fdbsql:     require('../bookshelf')(fdbsql)
  };

  it('should allow creating a new Bookshelf instance with "new"', function() {
    var bookshelf = new Bookshelf(sqlite3);
    expect(bookshelf.knex).to.equal(sqlite3);
  });

  _(testIntegrationDialects).map(function(dialectName) {
    var bookshelf = testBookshelves[dialectName];
    if(bookshelf === undefined) {
      throw new Error("No dialect named " + dialectName);
    }
    return bookshelf;
  }).each(function(bookshelf) {
    describe('Dialect: ' + bookshelf.knex.client.dialect, function() {

      before(function() {
        return require('./integration/helpers/migration')(bookshelf).then(function() {
           return require('./integration/helpers/inserts')(bookshelf);
        });
      });

      this.dialect = bookshelf.knex.client.dialect;

      // Only testing this against mysql for now, just so the toString is reliable...
      if (bookshelf.knex.client.dialect === 'mysql') {
        require('./integration/relation')(bookshelf);
      }

      require('./integration/model')(bookshelf);
      require('./integration/collection')(bookshelf);
      require('./integration/relations')(bookshelf);
      require('./integration/plugin')(bookshelf);
      require('./integration/plugins/virtuals')(bookshelf);
      require('./integration/plugins/visibility')(bookshelf);
      require('./integration/plugins/registry')(bookshelf);
    });

  });

};
