'use strict';

var _createError = require('create-error');

var _createError2 = _interopRequireDefault(_createError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {

  // Thrown when the model is not found and {require: true} is passed in the fetch options
  NotFoundError: (0, _createError2.default)('NotFoundError'),

  // Thrown when the collection is empty and {require: true} is passed in model.fetchAll or
  // collection.fetch
  EmptyError: (0, _createError2.default)('EmptyError'),

  // Thrown when an update affects no rows and {require: true} is passed in model.save.
  NoRowsUpdatedError: (0, _createError2.default)('NoRowsUpdatedError'),

  // Thrown when a delete affects no rows and {require: true} is passed in model.destroy.
  NoRowsDeletedError: (0, _createError2.default)('NoRowsDeletedError')

};