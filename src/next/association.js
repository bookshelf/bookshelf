import {PRIVATE_SET} from './constants'

/**
 * @class Association
 * @description Read-only metadata about association from models 
 *              to other models
 */
export default class Association extends Map {

  delete() {
    throw new Error('Association Map is frozen for public modification')
  }

  set() {
    throw new Error('Association Map is frozen for public modification')
  }

  [PRIVATE_SET](...args) {
    return super.set(...args)
  }

}