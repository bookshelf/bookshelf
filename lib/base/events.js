// Events
// ---------------

var Promise      = require('./promise');
var inherits     = require('inherits');
var EventEmitter = require('events').EventEmitter;
var _            = require('lodash');

function Events() {
  EventEmitter.apply(this, arguments);
}
inherits(Events, EventEmitter);

// Regular expression used to split event strings.
var eventSplitter = /\s+/;
Events.prototype.on = function(name, handler) {
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

// Add "off", "trigger", and "" method, for parity with Backbone.Events
Events.prototype.off = function(event, listener) {
  if (arguments.length === 0) {
    return this.removeAllListeners();
  }
  if (arguments.length === 1) {
    return this.removeAllListeners(event);
  }
  return this.removeListener(event, listener);
};
Events.prototype.trigger = function(name) {
  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var len  = arguments.length;
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

Events.prototype.triggerThen = function(name) {
  var i, l, rest, listeners = [];
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
    case 1: rest = []; break;
    case 2: rest = [arguments[1]]; break;
    case 3: rest = [arguments[1], arguments[2]]; break;
    default: rest = new Array(len - 1); for (i = 1; i < len; i++) rest[i - 1] = arguments[i];
  }
  var events = this
  return Promise.try(function() {
    var pending = [];
    for (i = 0, l = listeners.length; i < l; i++) {
      pending[i] = listeners[i].apply(events, rest);
    }
    return Promise.all(pending);
  })
};
Events.prototype.emitThen = Events.prototype.triggerThen;

Events.prototype.once = function(name, callback, context) {
  var self = this;
  var once = _.once(function() {
      self.off(name, once);
      return callback.apply(this, arguments);
  });
  once._callback = callback;
  return this.on(name, once, context);
};

module.exports = Events;