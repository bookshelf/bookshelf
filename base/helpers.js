// Helpers
// ---------------
var errors = require('./errors');

module.exports = {

  // Returns a function, throwing a MethodMissing error.
  methodMissing: function(name) {
    return function() {
      throw new errors.MethodMissing('The ' + name +
        ' method has not been implemented on this driver.');
    };
  }

};