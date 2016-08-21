import { isFunction, assign } from 'lodash';

// Uses a hash of prototype properties and class properties to be extended.
module.exports = function extend(protoProps, staticProps) {
  const Parent = this;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  const Child = protoProps && protoProps.hasOwnProperty('constructor')
    ? protoProps.constructor
    : function(){ return Parent.apply(this, arguments); };

  assign(Child, Parent, staticProps);

  // Set the prototype chain to inherit from `Parent`.
  Child.prototype = Object.create(Parent.prototype, {
    constructor: {
      value: Child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (protoProps) {
    assign(Child.prototype, protoProps);
  }

  // Give child access to the parent prototype as part of "super"
  Child.__super__ = Parent.prototype;

  // If there is an "extended" function set on the parent,
  // call it with the extended child object.
  if (isFunction(Parent.extended)) Parent.extended(Child);

  return Child;
};
