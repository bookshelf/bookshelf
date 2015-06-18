import {observable} from './decorators'
import Tables from './tables'

@observable
export default class Session extends Map {

  constructor() {
    this._tables    = new Tables()
    this._aggregate = new Map()
  }

  /**
   * Merge one or more values into the current 
   * session
   * 
   * @param  {...Object} values [description]
   * @return {[type]}           [description]
   */
  merge(...values) {
    
  }

}