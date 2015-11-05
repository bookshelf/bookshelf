// Events
// ---------------

import Promise from './promise';
import events from 'events'
import _, { each, flatten, flow, map, words } from 'lodash';

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
export default class Events extends EventEmitter {

  /**
   * @method Events#on
   * @description
   * Register an event listener.
   * @see {@link http://backbonejs.org/#Events-on Backbone.js `Events#on`}
   */
  on(nameOrNames, handler, ...args) {
    for (const name of words(nameOrNames)) {
      EventEmitter.prototype.on.apply(this, [name, handler, ...args]);
    }
    return this;
  }

  /**
   * @method Events#off
   * @description
   * Deregister an event listener.
   * @see {@link http://backbonejs.org/#Events-off Backbone.js `Events#off`}
   */
  off(nameOrNames, listener) {
    if (nameOrNames == null) {
      return listener == null
        ? this.removeAllListeners()
        : this.removeAllListeners(listener);
    }

    each(words(nameOrNames), listener == null
      ? name => this.removeAllListeners(name)
      : name => this.removeAllListeners(name, listener)
    );

    return this;
  }

  /**
   * @method Events#trigger
   * @description
   * Deregister an event listener.
   * @see {@link http://backbonejs.org/#Events-trigger Backbone.js `Events#trigger`}
   */
  trigger(nameOrNames, ...args) {
    for (const name of nameOrNames) {
      EventEmitter.prototype.emit.apply(this, [name, ...args]);
    }
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
   * @param {...mixed} args
   *   Arguments to be passed to any registered event handlers.
   * @returns Promise<mixed[]>
   *   A promise resolving the the resolved return values of any triggered handlers.
   */
  triggerThen(nameOrNames, ...args) {
    const names = words(nameOrNames);
    const listeners = flatMap(names, this.listeners, this);
    return Promise.map(listeners, listener =>
      listener.apply(this, args)
    );
  }

  /**
   * @method Events#once
   * @description
   * Register a one-off event handler.
   * @see {@link http://backbonejs.org/#Events-once Backbone.js `Events#once`}
   */
  once(name, callback, context) {
    const once = _.once(() => {
      this.off(name, once);
      return callback.apply(this, arguments);
    });
    once._callback = callback;
    return this.on(name, once, context);
  }
}

export default Events;
