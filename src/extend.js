
// Uses a hash of prototype properties and class properties to be extended.
module.exports = function(protoProps, staticProps) {
  var parent = this;
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ parent.apply(this, arguments); };
  }

  // Set the prototype chain to inherit from `Parent`
  child.prototype = Object.create(parent.prototype)

  if (protoProps) {
    let i = -1, keys = Object.keys(protoProps)
    while (++i < keys.length) {
      let key = keys[i]
      child.prototype[key] = protoProps[key]
    }    
  }

  if (staticProps) {
    let i = -1, keys = Object.keys(staticProps)
    while (++i < keys.length) {
      let key = keys[i]
      child[key] = staticProps[key]
    }
  }

  // Correctly set child's `prototype.constructor`.
  child.prototype.constructor = child;

  // Add static properties to the constructor function, if supplied.
  child.__proto__ = parent

  // If there is an "extended" function set on the parent,
  // call it with the extended child object.
  if (typeof parent.extended === "function") parent.extended(child);

  return child;
};
