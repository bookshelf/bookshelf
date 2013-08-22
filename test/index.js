var _    = require('underscore');
var Knex = require('knex');

var Bookshelf = require('../bookshelf');
var conn      = require(process.env.BOOKSHELF_TEST || './shared/config');

// The output goes here.
exports.output = {};

var MySQL = Knex.Initialize({
  client: 'mysql',
  connection: conn.mysql
});

var Postgres = Knex.Initialize('pg', {
  client: 'postgres',
  connection: conn.postgres
});

var Sqlite3 = Knex.Initialize('sqlite', {
  client: 'sqlite',
  connection: conn.sqlite3
});

describe('Bookshelf', function() {
  var Main = Bookshelf(MySQL);

  require('./lib/relation')(Main);

  require('./regular')(Main, 'mysql');
  require('./regular')(Bookshelf(Postgres), 'postgres');
  require('./regular')(Bookshelf(Sqlite3), 'sqlite3');

});

describe('Plugins', function() {

  describe('exec', function() {

    it('adds `then` and `exec` to all sync methods', function() {

      var Main = Bookshelf(MySQL);
          Main.plugin(require('../plugins/exec'));

      var model = new Main.Model();
      var collection = new Main.Collection();

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