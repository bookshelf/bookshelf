var Promise = require('bluebird');

Promise.longStackTraces();
Promise.onPossiblyUnhandledRejection(function(err) {
  throw err;
});

global.testPromise = Promise;
var oldIt = it;

it = function() {
  return oldIt.apply(this, arguments);
};

// http://bluebirdjs.com/docs/api/error-management-configuration.html#global-rejection-events
process.on('unhandledRejection', function(reason, promise) {
  console.error(reason);
});

var Bookshelf = require('../bookshelf');
var base = require('./base');
global.sinon = require('sinon');
var chai = (global.chai = require('chai'));
var databaseConnections;

chai.use(require('sinon-chai'));
chai.should();

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

after(function() {
  return databaseConnections.forEach(function(connection) {
    return connection.knex.destroy();
  });
});

describe('Unit Tests', function() {
  base.Collection();
  base.Events();

  require('./unit/bookshelf')();
  require('./unit/sql/sync')();
  require('./unit/sql/model')();
});

describe('Integration Tests', function() {
  databaseConnections = require('./integration')(Bookshelf);
});
