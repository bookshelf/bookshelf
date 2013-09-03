(function(define) {

"use strict";

define(function(require, exports) {

  var HelperInterface = {

    // `ids` can be used to pluck all the IDs for the relation
    // using the table's primary key.
    ids: function(options) {

      // For consistency, we need to assume a transaction may be
      // passed to every query.
      if (options.transacting) {
        this.query('transacting', options.transacting);
      }

      return this.query().select(this.idAttribute).then(function(results) {
        return _.pluck(results, this.idAttribute);
      });
    },

    // Convenience for creating a new transaction,
    // this doesn't actually do anything with the
    // object specifically.
    transaction: function(container) {
      return bookshelf.transaction(container);
    },

    // Specify which items to eager-load.
    includes: function() {
      this._includes = this._includes || [];

      return this;
    },

    // Specify which items are being joined on the model.
    joins: function() {
      this._joins = this._joins || [];

      return this;
    },

    explain: function() {

    },

    // Coerce the current object into an `all` fetch.
    then: function(onFulfilled, onRejected) {
      return this.all().then(onFulfilled, onRejected);
    }

  };

  exports.HelperInterface = HelperInterface;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);