'use strict';

var _lang = require('lodash/lang');

var _object = require('lodash/object');

// Uses a hash of prototype properties and class properties to be extended.
module.exports = function (protoProps, staticProps) {
  var Parent = this;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  var Child = protoProps && protoProps.hasOwnProperty('constructor') ? protoProps.constructor : function () {
    Parent.apply(this, arguments);
  };

  // Set the prototype chain to inherit from `Parent`.
  Child.prototype = Object.create(Parent.prototype);

  // Assign methods and static functions.
  (0, _object.assign)(Child.prototype, protoProps);
  (0, _object.assign)(Child, staticProps);

  // Correctly set child's `prototype.constructor`.
  Child.prototype.constructor = Child;

  // Add static properties to the constructor function, if supplied.
  Child.__proto__ = Parent;

  // If there is an "extended" function set on the parent,
  // call it with the extended child object.
  if ((0, _lang.isFunction)(Parent.extended)) Parent.extended(Child);

  return Child;
};