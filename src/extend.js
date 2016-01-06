import { isFunction } from 'lodash/lang';
import { assign } from 'lodash/object';

// Uses a hash of prototype properties and class properties to be extended.
module.exports = function(protoProps, staticProps) {
  const Parent = this;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  const Child = protoProps && protoProps.hasOwnProperty('constructor')
    ? protoProps.constructor
    : function(){ Parent.apply(this, arguments); };

  // tmpParsedObj will be used to store an object whose key is the parsed
  // version of the idAttribute
  let tmpParsedObj;

  // Set the prototype chain to inherit from `Parent`.
  Child.prototype = Object.create(Parent.prototype)

  // Assign methods and static functions.
  assign(Child.prototype, protoProps);
  assign(Child, staticProps);

  // Correctly set child's `prototype.constructor`.
  Child.prototype.constructor = Child;

  // Add static properties to the constructor function, if supplied.
  Child.__proto__ = Parent;

  // If there is an "extended" function set on the parent,
  // call it with the extended child object.
  if (isFunction(Parent.extended)) Parent.extended(Child);

  // Create a parsedIdAttribute for use when setting `model.id` in `Model.set`
  if (isFunction(Child.prototype.parse)) {
    tmpParsedObj = Child.prototype.parse({[Child.prototype.idAttribute]: null});
    Child.prototype.parsedIdAttribute = Object.keys(tmpParsedObj)[0];
  } else {
    Child.prototype.parsedIdAttribute = Child.prototype.idAttribute;
  }

  return Child;
};
