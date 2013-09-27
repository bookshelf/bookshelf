// Bookshelf Active Record
// ---------------
(function(define) {

"use strict";

define(function(require, exports) {

  module.exports = function(bookshelf) {

    var instance = require('./query')(bookshelf);

    require('./validation')(instance);
    require('./migration')(instance);
    require('./callbacks')(instance);
    require('./associations')(instance);

    var Error      = require('./error');

    var Model      = bookshelf.Model;
    var Collection = bookshelf.Collection;

    var modelFetch = Model.prototype.fetch;
    var collectionFetch = Collection.prototype.fetch;

    Model.prototype.fetch = function(options) {
      this._includes = this._includes || [];
    };

    Collection.prototype.fetch = function() {
      this._includes = this._includes || [];
    };

  };

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);