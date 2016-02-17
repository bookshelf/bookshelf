'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('./promise');

var _promise2 = _interopRequireDefault(_promise);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _words = require('lodash/string/words');

var _words2 = _interopRequireDefault(_words);

var _flatten = require('lodash/array/flatten');

var _flatten2 = _interopRequireDefault(_flatten);

var _collection = require('lodash/collection');

var _function = require('lodash/function');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Events
// ---------------

var EventEmitter = _events2.default.EventEmitter;

var flatMap = (0, _function.flow)(_collection.map, _flatten2.default);

/**
 * @class Events
 * @description
 * Base Event class inherited by {@link Model} and {@link Collection}. It's not
 * meant to be used directly, and is only displayed here for completeness.
 */

var Events = (function (_EventEmitter) {
  _inherits(Events, _EventEmitter);

  function Events() {
    _classCallCheck(this, Events);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Events).apply(this, arguments));
  }

  _createClass(Events, [{
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
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _words2.default)(nameOrNames)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var name = _step.value;

          _get(Object.getPrototypeOf(Events.prototype), 'on', this).call(this, name, handler);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

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
      var _this2 = this;

      if (nameOrNames == null) {
        return this.removeAllListeners();
      }

      (0, _collection.each)((0, _words2.default)(nameOrNames), function (name) {
        return _this2.removeAllListeners(name);
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
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _words2.default)(nameOrNames)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var name = _step2.value;

          this.emit.apply(this, [name].concat(args));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
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
     * @param {...mixed} [args]
     *   Arguments to be passed to any registered event handlers.
     * @returns Promise<mixed[]>
     *   A promise resolving the the resolved return values of any triggered handlers.
     */

  }, {
    key: 'triggerThen',
    value: function triggerThen(nameOrNames) {
      var _this3 = this;

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var names = (0, _words2.default)(nameOrNames);
      var listeners = flatMap(names, this.listeners, this);
      return _promise2.default.map(listeners, function (listener) {
        return listener.apply(_this3, args);
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
      var _this4 = this;

      var wrapped = (0, _function.once)(function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        _this4.off(name, wrapped);
        return callback.apply(_this4, args);
      });
      wrapped._callback = callback;
      return this.on(name, wrapped);
    }
  }]);

  return Events;
})(EventEmitter);

exports.default = Events;
exports.default = Events;