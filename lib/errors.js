var createError = require('create-error');

module.exports = {

  // Thrown when the model is not found and {require: true} is passed in the fetch options
  NotFoundError: createError('NotFoundError'),

  // Thrown when the collection is empty and {require: true} is passed in model.fetchAll or
  // collection.fetch
  EmptyError: createError('EmptyError')

};