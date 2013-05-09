var _         = require('underscore');

var Bookshelf = require('../bookshelf');
var conn = require(process.env.BOOKSHELF_TEST || './shared/config');

// The output goes here.
exports.output = {};

Bookshelf.Initialize({
  client: 'mysql',
  connection: conn.mysql
});

var Postgres = Bookshelf.Initialize('pg', {
  client: 'postgres',
  connection: conn.postgres
});

var Sqlite3 = Bookshelf.Initialize('sqlite', {
  client: 'sqlite',
  connection: conn.sqlite3
});

describe('Bookshelf', function() {

  require('./regular')(Bookshelf, 'mysql');
  require('./regular')(Postgres, 'postgres');
  require('./regular')(Sqlite3, 'sqlite3');

});