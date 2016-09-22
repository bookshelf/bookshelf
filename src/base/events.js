// Events
// ---------------

import Promise from './promise';
import events from 'events'
import { each, flatMap, once as _once } from 'lodash';

const { EventEmitter } = events;

const eventNames = text => text.split(/\s+/);

/**
 * @class Events
 * @description
 * Base Event class inherited by {@link Model} and {@link Collection}. It's not
 * meant to be used directly, and is only displayed here for completeness.
 */
export default class Events extends EventEmitter {

  /**
   * @method Events#on
   * @description
   * Register an event listener. The callback will be invoked whenever the event
   * is fired. The event string may also be a space-delimited list of several
   * event names.
   *
   * @param {string} nameOrNames
   *   The name of the event or space separated list of events to register a
   *   callback for.
   * @param {function} callback
   *   That callback to invoke whenever the event is fired.
   */
  on(nameOrNames, handler) {
    each(eventNames(nameOrNames), (name) => {
      super.on(name, handler)
    });
    return this;
  }

  /**
   * @method Events#off
   * @description
   * Remove a previously-bound callback event listener from an object. If no
   * event name is specified, callbacks for all events will be removed.
   *
   * @param {string} nameOrNames
   *   The name of the event or space separated list of events to stop listening
   *   to.
   */
  off(nameOrNames) {
    if (nameOrNames == null) {
      return this.removeAllListeners();
    }

    each(eventNames(nameOrNames), name => this.removeAllListeners(name));
    return this;
  }

  /**
   * @method Events#trigger
   * @description
   * Trigger callbacks for the given event, or space-delimited list of events.
   * Subsequent arguments to `trigger` will be passed along to the event
   * callback.
   *
   * @param {string} nameOrNames
   *   The name of the event to trigger. Also accepts a space separated list of
   *   event names.
   * @param {...mixed} [args]
   *   Extra arguments to pass to the event listener callback function.
   */
  trigger(nameOrNames, ...args) {
    each(eventNames(nameOrNames), (name) => {
      this.emit(name, ...args)
    });
    return this;
  }

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
   * @param {...mixed} [args]
   *   Arguments to be passed to any registered event handlers.
   * @returns Promise<mixed[]>
   *   A promise resolving the the resolved return values of any triggered handlers.
   */
  triggerThen(nameOrNames, ...args) {
    const names = eventNames(nameOrNames);
    const listeners = flatMap(names, name => this.listeners(name));
    return Promise.map(listeners, listener => listener.apply(this, args));
  }

  /**
   * @method Events#once
   * @description
   * Just like {@link Events#on}, but causes the bound callback to fire only
   * once before being removed. Handy for saying "the next time that X happens,
   * do this". When multiple events are passed in using the space separated
   * syntax, the event will fire once for every event you passed in, not once
   * for a combination of all events.
   *
   * @param {string} nameOrNames
   *   The name of the event or space separated list of events to register a
   *   callback for.
   * @param {function} callback
   *   That callback to invoke only once when the event is fired.
   */
  once(name, callback) {
    const wrapped = _once((...args) => {
      this.off(name, wrapped);
      return callback.apply(this, args);
    });
    wrapped._callback = callback;
    return this.on(name, wrapped);
  }
}
