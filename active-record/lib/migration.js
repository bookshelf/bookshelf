(function(define) {

"use strict";

define(function(require, exports, module) {

  module.exports = function(bookshelf) {

    var Migration = bookshelf.Migration = function() {
      this.knex = bookshelf.knex;
    };

    _.extend(Migration.prototype, {

      up: function() {

      },

      down: function() {

      },

      createTable: function(tableName, config, container) {
        if (_.isFunction(config)) {
          container = config;
          config = {};
        }
        knex.Schema.createTable(tableName, function(t) {
          if (config.id !== false) t.increments();
          container(t);
          if (config.timestamps !== false) t.timestamps();
        });
      }

    });

  };

  Migration.extend = Backbone.Model.extend;

  exports.Migration = Migration;

});

})(
  typeof define === 'function' && define.amd ? define : function (factory) { factory(require, exports); }
);