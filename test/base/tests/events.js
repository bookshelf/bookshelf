var path = require('path');

module.exports = function() {
  var Events = require(path.resolve(process.cwd(), 'lib/base/events'));

  describe('Events', function() {
    var events;

    beforeEach(function() {
      events = new Events();
    });

    describe('#off()', function() {
      it('should deregister multiple space-separated events', function() {
        function eventHandler() {
          throw new Error('Expected event handler to have not been called');
        }

        events.on('A', eventHandler);
        events.on('B', eventHandler);
        events.off('A B');
        events.trigger('A');

        expect(events._eventsCount).to.equal(0);
      });
    });

    describe('#trigger()', function() {
      it('should pass additional arguments to the listener', function() {
        events.on('event', function(name, arg1, arg2) {
          expect(name).to.equal('event');
          expect(arg1).to.equal(1);
          expect(arg2).to.equal(2);
        })
        events.trigger('event', 1, 2);
      });
    });
  });
};
