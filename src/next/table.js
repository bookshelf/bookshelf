/**
 * A "table" handles all of the data fetched for an individual table,
 * keeping indexed as appropriate / necessary.
 */
@observable
export default class Table extends Map {

  constructor() {
    super()
    this.indexes = new Map()
  }

  /**
   * Get the primary key of the table
   * @return {[type]} [description]
   */
  primaryKey() {

  }

  /**
   * Check whether the table is indexed by key / keys
   * @param  {[type]}  key [description]
   * @return {Boolean}     [description]
   */
  isIndexed(key) {

  }

}