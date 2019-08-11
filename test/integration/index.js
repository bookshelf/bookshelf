var _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(Bookshelf) {
  var Knex = require('knex');
  var config = require(process.env.BOOKSHELF_TEST || './helpers/config');
  var pg = require('knex')({client: 'postgres', connection: config.postgres});
  var sqlite3 = require('knex')({
    client: 'sqlite3',
    connection: config.sqlite3,
    useNullAsDefault: true
  });
  var mysql = require('knex')({
    client: 'mysql',
    connection: config.mysql,
    pool: {
      afterCreate: function(connection, callback) {
        var asyncQuery = Promise.promisify(connection.query, {context: connection});
        return asyncQuery('SET SESSION sql_mode=?', ['TRADITIONAL,NO_AUTO_VALUE_ON_ZERO']).then(function() {
          callback(null, connection);
        });
      }
    }
  });

  var MySQL = require('../../bookshelf')(mysql);
  var PostgreSQL = require('../../bookshelf')(pg);
  var SQLite3 = require('../../bookshelf')(sqlite3);
  var Swapped = require('../../bookshelf')(Knex({client: 'sqlite3', useNullAsDefault: true}));
  Swapped.knex = sqlite3;
  var databases = [SQLite3, Swapped, MySQL, PostgreSQL];

  it('should allow creating a new Bookshelf instance with "new"', function() {
    var bookshelf = new Bookshelf(sqlite3);
    expect(bookshelf.knex).to.equal(sqlite3);
  });

  it('should allow swapping in another knex instance', function() {
    var bookshelf = new Bookshelf(Knex({client: 'sqlite3', useNullAsDefault: true}));
    var Models = require('./helpers/objects')(bookshelf).Models;
    var site = new Models.Site();

    return require('./helpers/migration')(SQLite3).then(function() {
      return site
        .save()
        .then(function() {
          expect(false).to.equal(true);
        })
        .catch(function() {
          bookshelf.knex = sqlite3;
          return site.save();
        });
    });
  });

  _.each(databases, function(bookshelf) {
    var dialect = bookshelf.knex.client.dialect;

    describe('Dialect: ' + dialect, function() {
      this.dialect = dialect;

      before(function() {
        this.timeout(60000);
        return require('./helpers/migration')(bookshelf).then(function() {
          return require('./helpers/inserts')(bookshelf);
        });
      });

      // Only testing this against mysql for now, just so the toString is reliable...
      if (dialect === 'mysql') {
        require('./relation')(bookshelf);
      } else if (dialect === 'postgresql') {
        require('./json')(bookshelf);
      }

      require('./model')(bookshelf);
      require('./collection')(bookshelf);
      require('./relations')(bookshelf);
      require('./plugin')(bookshelf);
    });
  });

  return databases;
};
