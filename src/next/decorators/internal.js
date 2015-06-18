import {PRIVATE_ASSIGN} from '../constants'

function assign(...values) {
  for (let value of values) {
    let i = 0, keys = Object.keys(value);
    while (i++ < keys.length) {
      let key = keys[i]
      this.set(key, value[key])
    }
  }
  return this
}

export function assignable(target) {
  target.prototype.assign = assign
  target.prototype[PRIVATE_ASSIGN] = assign
}

function extend(protoProps, staticProps) {

  var Child = class extends this {}

  if (protoProps) {
    let i = -1, keys = Object.keys(protoProps)
    while (++i < keys.length) {
      let key = keys[i];
      Child.prototype[key] = protoProps[key]
    }
  }

  if (staticProps) {
    let i = -1, keys = Object.keys(staticProps);
    while (++i < keys.length) {
      let key = keys[i];
      Child[key] = staticProps[key];
    }
  }

  return Child
}

export function extensible(Ctor) {
  Ctor.extend = extend
}

export function observable(Ctor) {
  var subscribedGenerator;
  Ctor.prototype.subscribe = function(generator) {
    subscribedGenerator = generator
    return {
      unsubscribe: () => {
        subscribedGenerator = undefined
      }
    }
  }
}

export function serializable(Ctor) {
  Ctor.prototoype.serializable = function() {
    
  }
}
