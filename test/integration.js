var _        = require('underscore');

module.exports = function(Bookshelf) {

  var Knex     = require('knex');
  var config   = require(process.env.BOOKSHELF_TEST || './integration/helpers/config');
  var nodefn   = require('when/node/function');

  var MySQL = Bookshelf.initialize({
    client: 'mysql',
    connection: config.mysql,
    pool: {
      afterCreate: function(connection, callback) {
        return nodefn.call(connection.query.bind(connection), "SET sql_mode='TRADITIONAL';", []).then(function() {
          callback(null, connection);
        });
      }
    }
  });

  var PostgreSQL = Bookshelf.initialize({
    client: 'postgres',
    connection: config.postgres,
  });

  var SQLite3 = Bookshelf.initialize({
    client: 'sqlite3',
    connection: config.sqlite3,
  });

  var knexSqlite3 = Knex.initialize({
    client: 'sqlite3',
    connection: config.sqlite3
  });

  it('should allow creating a Bookshelf client from a Knex instance', function() {
    var bookshelf = Bookshelf.initialize(knexSqlite3);
    expect(bookshelf.knex).to.equal(knexSqlite3);
  });

  it('should allow creating a new Bookshelf instance with "new"', function() {
    var bookshelf = new Bookshelf(knexSqlite3);
    expect(bookshelf.knex).to.equal(knexSqlite3);
  });

  _.each([MySQL, PostgreSQL, SQLite3], function(bookshelf) {

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
      require('./integration/plugins')(bookshelf);
    });

  });

};
