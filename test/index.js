var Promise = require('../dialects/base/promise').Promise;

Promise.longStackTraces();
Promise.onPossiblyUnhandledRejection(function (err) {
  throw err;
});

global.testPromise = Promise;

process.stderr.on('data', function(data) {
  console.log(data);
});

var Bookshelf = require('../bookshelf');
var base      = require('./base');

global.sinon = require('sinon');

var chai = global.chai = require('chai');

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
chai.should();

global.expect         = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion      = chai.Assertion;
global.assert         = chai.assert;

// Unit test all of the abstract base interfaces
describe('Unit Tests', function () {

  base.Collection();
  base.Model();
  base.Events();
  base.Relation();
  base.Eager();

  require('./unit/sql/sync')();
  require('./unit/sql/model')();

});

describe('Integration Tests', function () {

  var helper = require('./integration/helpers/logger');

  before(function() {
    helper.setLib(this);
  });

  require('./integration')(Bookshelf);

  after(function() {
    helper.writeResult();
  });

});
