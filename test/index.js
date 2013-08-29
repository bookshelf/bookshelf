var _         = require('underscore');

var Bookshelf = require('../bookshelf');
var conn      = require(process.env.BOOKSHELF_TEST || './shared/config');

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
  require('./lib/relation');

  require('./regular')(Bookshelf, 'mysql');
  require('./regular')(Postgres, 'postgres');
  require('./regular')(Sqlite3, 'sqlite3');

});

describe('Plugins', function() {

  describe('exec', function() {

    it('adds `then` and `exec` to all sync methods', function() {

      require('../plugins/exec');

      var model = new Bookshelf.Model();
      var collection = new Bookshelf.Collection();

      _.each(['load', 'fetch', 'save', 'destroy'], function(method) {
        var fn = model[method]();
        if (!_.isFunction(fn.then) || !_.isFunction(fn.exec)) {
          throw new Error('then and exec are not both defined');
        }
      });

      _.each(['load', 'fetch'], function(method) {
        var fn = collection[method]();
        if (!_.isFunction(fn.then) || !_.isFunction(fn.exec)) {
          throw new Error('then and exec are not both defined');
        }
      });

    });

  });

});