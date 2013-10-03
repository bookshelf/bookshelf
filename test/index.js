
require('when/monitor/console');

var Bookshelf = require('../bookshelf');
var base      = require('./base');
var mocha     = require('mocha');

require("mocha-as-promised")(mocha);

global.sinon = require("sinon");

var chai = global.chai = require("chai");

chai.use(require("chai-as-promised"));
chai.use(require("sinon-chai"));
chai.should();

global.whenResolve    = require('when').resolve;
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
