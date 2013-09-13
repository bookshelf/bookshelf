module.exports = function(Bookshelf) {

  var config   = require(process.env.BOOKSHELF_TEST || './integration/helpers/config');
  var nodefn   = require('when/node/function');

  var MySQL = Bookshelf.initialize({
    client: 'mysql',
    connection: config.mysql,
    pool: {
      afterCreate: function(connection) {
        return nodefn.call(connection.query.bind(connection), "SET sql_mode='TRADITIONAL';", []);
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
