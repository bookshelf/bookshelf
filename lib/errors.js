const createError = require('create-error');

function ModelNotResolvedError() {
  ModelNotResolvedError.prototype = Object.create(Error.prototype, {
    constructor: {
      value: ModelNotResolvedError,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  Object.setPrototypeOf(ModelNotResolvedError, Error);

  function ModelNotResolvedError() {
    return Object.getPrototypeOf(ModelNotResolvedError).apply(this, arguments);
  }

  return ModelNotResolvedError;
}

module.exports = {
  // Thrown when the model is not found and {require: true} is passed in the fetch options
  NotFoundError: createError('NotFoundError'),

  // Thrown when the collection is empty and {require: true} is passed in model.fetchAll or
  // collection.fetch
  EmptyError: createError('EmptyError'),

  // Thrown when an update affects no rows and {require: true} is passed in model.save.
  NoRowsUpdatedError: createError('NoRowsUpdatedError'),

  // Thrown when a delete affects no rows and {require: true} is passed in model.destroy.
  NoRowsDeletedError: createError('NoRowsDeletedError'),

  ModelNotResolvedError
};
