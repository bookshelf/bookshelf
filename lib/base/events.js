'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _promise = require('./promise');

var _promise2 = _interopRequireDefault(_promise);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventEmitter = _events2.default.EventEmitter; // Events
// ---------------

var eventNames = function eventNames(text) {
  return text.split(/\s+/);
};

/**
 * @class Events
 * @description
 * Base Event class inherited by {@link Model} and {@link Collection}. It's not
 * meant to be used directly, and is only displayed here for completeness.
 */

var Events = function (_EventEmitter) {
  (0, _inherits3.default)(Events, _EventEmitter);

  function Events() {
    (0, _classCallCheck3.default)(this, Events);
    return (0, _possibleConstructorReturn3.default)(this, (Events.__proto__ || Object.getPrototypeOf(Events)).apply(this, arguments));
  }

  (0, _createClass3.default)(Events, [{
    key: 'on',


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
    value: function on(nameOrNames, handler) {
      var _this2 = this;

      (0, _lodash.each)(eventNames(nameOrNames), function (name) {
        (0, _get3.default)(Events.prototype.__proto__ || Object.getPrototypeOf(Events.prototype), 'on', _this2).call(_this2, name, handler);
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

  }, {
    key: 'off',
    value: function off(nameOrNames) {
      var _this3 = this;

      if (nameOrNames == null) {
        return this.removeAllListeners();
      }

      (0, _lodash.each)(eventNames(nameOrNames), function (name) {
        return _this3.removeAllListeners(name);
      });
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

  }, {
    key: 'trigger',
    value: function trigger(nameOrNames) {
      var _this4 = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (0, _lodash.each)(eventNames(nameOrNames), function (name) {
        _this4.emit.apply(_this4, [name].concat(args));
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

  }, {
    key: 'triggerThen',
    value: function triggerThen(nameOrNames) {
      var _this5 = this;

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var names = eventNames(nameOrNames);
      var listeners = (0, _lodash.flatMap)(names, function (name) {
        return _this5.listeners(name);
      });
      return _promise2.default.map(listeners, function (listener) {
        return listener.apply(_this5, args);
      });
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

  }, {
    key: 'once',
    value: function once(name, callback) {
      var _this6 = this;

      var wrapped = (0, _lodash.once)(function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        _this6.off(name, wrapped);
        return callback.apply(_this6, args);
      });
      wrapped._callback = callback;
      return this.on(name, wrapped);
    }
  }]);
  return Events;
}(EventEmitter);

exports.default = Events;