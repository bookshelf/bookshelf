var createError = require('create-error');

exports.Errors = {
  NotFoundError: createError('NotFoundError'),
  EmptyError: createError('EmptyError')
};