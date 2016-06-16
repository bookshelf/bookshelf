var Promise   = testPromise;
var assert    = require('assert');
var equal     = assert.equal;

module.exports = function() {

  // This module is included into the `bookshelf` repository,
  // and run from the root of the directory.
  var path     = require('path');
  var basePath = process.cwd();

  var Events = require(path.resolve(basePath + '/lib/base/events')).default;

  describe('Events', function() {

    var events;
    var handlersRun;
    beforeEach(function() {
      events = new Events();
      handlersRun = [];
      events.on('A', eventHandler('A'));
      events.on('B', eventHandler('B'));
    });

    function eventHandler(event) {
      return function() {handlersRun.push(event);}
    }

    describe('#off()', function() {

      it('should deregister multiple, space-separated events', function() {
        events.off('A B');
        events.trigger('A');
        events.trigger('B');
        equal(handlersRun.length, 0);
      });

    });

  });

};
