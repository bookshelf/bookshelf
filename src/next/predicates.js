/**
 * Returns whether the current value is a Table
 * @param  {Object}  value
 * @return {Boolean}
 */
function isTable(value) {
  return !!(value && value['@@__BOOKSHELF_TABLE__@@'])
}

/**
 * Returns whether the current value is a Model
 * @param  {Model}  value 
 * @return {Boolean}
 */
function isModel(value) {
  return !!(value && value['@@__BOOKSHELF_MODEL__@@'])
}