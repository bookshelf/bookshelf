// Events
// ---------------

import Promise from './promise';
import inherits from 'inherits';
import events from 'events'
import _, { flatten, flow, map } from 'lodash';

const { EventEmitter } = events;

const flatMap = flow(map, flatten);

/**
 * @class Events
 * @class
 *
 * Bookshelf includes events based on those provided by
 * [Backbone](http://backbonejs.org/).
 *
 */
function Events() {
  EventEmitter.apply(this, arguments);
}
inherits(Events, EventEmitter);

// Regular expression used to split event strings.
const eventSplitter = /\s+/;

const toNames = (nameOrNames) => nameOrNames.split(eventSplitter);

/**
 * @method Events#on
 * @description
 * Register an event listener.
 * @see {@link http://backbonejs.org/#Events-on Backbone.js `Events#on`}
 */
Events.prototype.on = function(nameOrNames, handler, ...args) {
  for (const name of toNames(nameOrNames)) {
    EventEmitter.prototype.on.apply(this, [name, handler, ...args]);
  }
  return this;
};

/**
 * @method Events#off
 * @description
 * Deregister an event listener.
 * @see {@link http://backbonejs.org/#Events-off Backbone.js `Events#off`}
 */
Events.prototype.off = function(event, listener) {
  if (arguments.length === 0) {
    return this.removeAllListeners();
  }
  // Handle space separated event names.
  if (eventSplitter.test(event)) {
    var events = event.split(eventSplitter);
    for (var i = 0, l = events.length; i < l; i++) {
      if(arguments.length === 1) {
        this.off(events[i]);
      } else {
        this.off(events[i], listener);
      }
    }
    return this;
  }
  if (arguments.length === 1) {
    return this.removeAllListeners(event);
  }
  return this.removeListener(event, listener);
};

/**
 * @method Events#trigger
 * @description
 * Deregister an event listener.
 * @see {@link http://backbonejs.org/#Events-trigger Backbone.js `Events#trigger`}
 */
Events.prototype.trigger = function(nameOrNames, ...args) {
  for (const name of nameOrNames) {
    EventEmitter.prototype.emit.apply(this, [name, ...args]);
  }
  return this;
};

/**
 * @method Events#triggerThen
 * @description
 * A promise version of {@link Events#trigger}, returning a promise which
 * resolves with all return values from triggered event handlers. If any of the
 * event handlers throw an `Error` or return a rejected promise, the promise
 * will be rejected. Used internally on the {@link Model#creating "creating"},
 * {@link Model#updating "updating"}, {@link Model#saving "saving"}, and {@link
 * Model@destroying "destroying"} events, and can be helpful when needing async
 * event handlers (for validations, etc).
 *
 * @param {string} name
 *   The event name, or a whitespace-separated list of event names, to be
 *   triggered.
 * @param {...mixed} args
 *   Arguments to be passed to any registered event handlers.
 * @returns Promise<mixed[]>
 *   A promise resolving the the resolved return values of any triggered handlers.
 */
Events.prototype.triggerThen = function(nameOrNames, ...args) {
  const names = toNames(nameOrNames);
  const listeners = flatMap(names, this.listeners, this);
  return Promise.map(listeners, listener =>
    listener.apply(this, args)
  );
};
Events.prototype.emitThen = Events.prototype.triggerThen;

/**
 * @method Events#once
 * @description
 * Register a one-off event handler.
 * @see {@link http://backbonejs.org/#Events-once Backbone.js `Events#once`}
 */
Events.prototype.once = function(name, callback, context) {
  const once = _.once(() => {
    this.off(name, once);
    return callback.apply(this, arguments);
  });
  once._callback = callback;
  return this.on(name, once, context);
};

export default Events;
