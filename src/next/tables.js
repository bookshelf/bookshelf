import {observable} from './decorators'
import {isTable} from './predicates'

/**
 * Keep an index of the "tables" fetched 
 */
@observable
export default class Tables extends Map {

  set(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError(`Table key must be a string.`)
    }
    if (!isTable(value)) {
      throw new TypeError(`The value set on Tables must be a Table`)
    }
    return super.set(key, value)
  }

}