
export function hasTimestamps(options = true) {
  return function decorator(target) {
    if (options === false) {
      return target
    }
  }
}