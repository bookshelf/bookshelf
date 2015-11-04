'use strict';

// Events
// ---------------

var Promise = require('./promise');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

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
var eventSplitter = /\s+/;

/**
 * @method Events#on
 * @description
 * Register an event listener.
 * @see {@link http://backbonejs.org/#Events-on Backbone.js `Events#on`}
 */
Events.prototype.on = function (name, handler) {
  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      this.on(names[i], handler);
    }
    return this;
  }
  return EventEmitter.prototype.on.apply(this, arguments);
};

/**
 * @method Events#off
 * @description
 * Deregister an event listener.
 * @see {@link http://backbonejs.org/#Events-off Backbone.js `Events#off`}
 */
Events.prototype.off = function (event, listener) {
  if (arguments.length === 0) {
    return this.removeAllListeners();
  }
  // Handle space separated event names.
  if (eventSplitter.test(event)) {
    var events = event.split(eventSplitter);
    for (var i = 0, l = events.length; i < l; i++) {
      if (arguments.length === 1) {
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
Events.prototype.trigger = function (name) {
  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var len = arguments.length;
    var rest = new Array(len - 1);
    for (i = 1; i < len; i++) rest[i - 1] = arguments[i];
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      EventEmitter.prototype.emit.apply(this, [names[i]].concat(rest));
    }
    return this;
  }
  EventEmitter.prototype.emit.apply(this, arguments);
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
Events.prototype.triggerThen = function (name) {
  var i,
      l,
      rest,
      listeners = [];
  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (i = 0, l = names.length; i < l; i++) {
      listeners = listeners.concat(this.listeners(names[i]));
    }
  } else {
    listeners = this.listeners(name);
  }
  var len = arguments.length;
  switch (len) {
    case 1:
      rest = [];break;
    case 2:
      rest = [arguments[1]];break;
    case 3:
      rest = [arguments[1], arguments[2]];break;
    default:
      rest = new Array(len - 1);for (i = 1; i < len; i++) rest[i - 1] = arguments[i];
  }
  var events = this;
  return Promise.try(function () {
    var pending = [];
    for (i = 0, l = listeners.length; i < l; i++) {
      pending[i] = listeners[i].apply(events, rest);
    }
    return Promise.all(pending);
  });
};
Events.prototype.emitThen = Events.prototype.triggerThen;

/**
 * @method Events#once
 * @description
 * Register a one-off event handler.
 * @see {@link http://backbonejs.org/#Events-once Backbone.js `Events#once`}
 */
Events.prototype.once = function (name, callback, context) {
  var self = this;
  var once = _.once(function () {
    self.off(name, once);
    return callback.apply(this, arguments);
  });
  once._callback = callback;
  return this.on(name, once, context);
};

module.exports = Events;