var _         = require('underscore');

var Bookshelf = require('../bookshelf');
var conn      = require(process.env.BOOKSHELF_TEST || './shared/config');

var base = require('bookshelf-tests-base');

require("mocha-as-promised")();

global.sinon = require("sinon");

var chai       = global.chai = require("chai");

chai.use(require("chai-as-promised"));
chai.use(require("sinon-chai"));
chai.should();

global._              = require('underscore');
global.whenResolve    = require('when').resolve;
global.expect         = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion      = chai.Assertion;
global.assert         = chai.assert;

// Unit test all of the abstract base interfaces
base.Collection();
base.Model();
base.Events();
base.Relation();
base.Eager();

// var sql = require('bookshelf-tests-sql');

// sql.Collection();
// sql.Model();
// sql.Helpers();
// sql.Eager();
// sql.Relation();
// sql.Sync();

// The output goes here.
exports.output = {};

var MySQL = Bookshelf.initialize({
  client: 'mysql',
  connection: conn.mysql
});

var Postgres = Bookshelf.initialize({
  client: 'postgres',
  connection: conn.postgres
});

var Sqlite3 = Bookshelf.initialize({
  client: 'sqlite',
  connection: conn.sqlite3
});

describe('Bookshelf', function() {
  // require('./lib/relation')(MySQL);
  require('./regular')(MySQL, 'mysql');
  require('./regular')(Postgres, 'postgres');
  require('./regular')(Sqlite3, 'sqlite3');

});

describe('Plugins', function() {

  describe('exec', function() {

    // it('adds `then` and `exec` to all sync methods', function() {

    //   require('../plugins/exec');

    //   var model = new Bookshelf.Model();
    //   var collection = new Bookshelf.Collection();

    //   _.each(['load', 'fetch', 'save', 'destroy'], function(method) {
    //     var fn = model[method]();
    //     if (!_.isFunction(fn.then) || !_.isFunction(fn.exec)) {
    //       throw new Error('then and exec are not both defined');
    //     }
    //   });

    //   _.each(['load', 'fetch'], function(method) {
    //     var fn = collection[method]();
    //     if (!_.isFunction(fn.then) || !_.isFunction(fn.exec)) {
    //       throw new Error('then and exec are not both defined');
    //     }
    //   });

    // });

  });

});