var path = require('path');

module.exports = function() {
  var Events = require(path.resolve(process.cwd(), 'lib/base/events'));

  describe('Events', function() {
    var events;

    beforeEach(function() {
      events = new Events();
    });

    describe('#off()', function() {
      it('should only deregister the provided callback if passed', function() {
        function eventHandler1() {
          throw new Error('Expected event handler to have not been called');
        }

        function eventHandler2() {
          /* Expected to be called */
          eventHandler2.callCount += 1;
        }
        eventHandler2.callCount = 0;

        events.on('A', eventHandler1);
        events.on('A', eventHandler2);
        events.off('A', eventHandler1);
        expect(events._eventsCount).to.equal(1);

        events.trigger('A');
        expect(eventHandler2.callCount).to.equal(1);
      });

      it('should deregister all callbacks if no callback is passed', function() {
        function eventHandler1() {
          throw new Error('Expected event handler to have not been called');
        }

        function eventHandler2() {
          throw new Error('Expected event handler to have not been called');
        }

        events.on('A', eventHandler1);
        events.on('A', eventHandler2);
        events.off('A');
        events.trigger('A');

        expect(events._eventsCount).to.equal(0);
      });

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
        });
        events.trigger('event', 1, 2);
      });
    });

    describe('#once()', function() {
      it('should remove itself but not other events', function() {
        function onEventHandler() {
          /* Expected to be called */
          onEventHandler.callCount += 1;
        }
        onEventHandler.callCount = 0;

        function onceEventHandler() {
          /* Expected to be called */
          onceEventHandler.callCount += 1;
        }
        onceEventHandler.callCount = 0;

        events.on('A', onEventHandler);
        events.once('A', onceEventHandler);
        events.trigger('A');
        expect(events._eventsCount).to.equal(1);

        events.trigger('A');
        expect(onEventHandler.callCount).to.equal(2);
        expect(onceEventHandler.callCount).to.equal(1);
      });
    });
  });
};
