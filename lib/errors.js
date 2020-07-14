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
  // Thrown when a model is not found.
  NotFoundError: createError('NotFoundError'),

  // Thrown when the collection is empty upon fetching it.
  EmptyError: createError('EmptyError'),

  // Thrown when an update affects no rows
  NoRowsUpdatedError: createError('NoRowsUpdatedError'),

  // Thrown when a delete affects no rows.
  NoRowsDeletedError: createError('NoRowsDeletedError'),

  ModelNotResolvedError: ModelNotResolvedError()
};
