// Schema Plugin
// Gets a model's database schema to be used for filtering and type casting
// -----
module.exports = function (Bookshelf) {
  "use strict";
  var _       = require('lodash');
  var extend  = Bookshelf.Model.extend;
  var knex    = Bookshelf.knex;

  var mapColumns = function (columns, val) {
    // we use the response keys for mysql/pgsql as default
    columns[val.column_name] = {
      type: val.data_type,
      charMaxLength: val.character_maximum_length
    };
    return columns;
  };

  Bookshelf.Model = Bookshelf.Model.extend({
    initialize: function () {
      this.on('saving', this._filterAttributes);
    },

    _filterAttributes: function (model) {
      var columns = model._columns;
      var attributes = model.attributes;
      // remove all attributes which are not part of the schema
      model.attributes = _.reduce(columns, function (result, key) {
        var val = attributes[key];
        if (val) {
          result[key] = val;
        }
        return result;
      }, {});
    }
  });

  // Since we cannot manipulate the `extend` function in coffee-script,
  // we make this function available to be called manually
  Bookshelf.Model._getSchema = function (tableName) {
    var cTor = this;
    var p;
    // special case for sqlite, since it does not support INFORMATION_SCHEMA.COLUMNS
    if (knex.client.dialect === 'sqlite3') {
      p = this.prototype._fetchSchema = knex.raw('PRAGMA table_info(' + tableName + ')')
      .then(function (res) {
        // Format the response accordingly to comply with the standard response for mysql/pgsql
        res = res[0];
        var maxLengthRegex = /.*\((\d+)\)/;
        return _.reduce(res, function (columns, val) {
          var type = val.type;
          var maxLength = (maxLength = type.match(maxLengthRegex)) && maxLength[1];
          type = maxLength ? type.split('(')[0] : type;
          columns.push({
            column_name: val.name,
            data_type: type,
            character_maximum_length: maxLength
          });
          return columns;
        }, []);
      });
    } else {
      var dbName = knex.client.connectionSettings.database;
      p = this.prototype._fetchSchema = knex('INFORMATION_SCHEMA.COLUMNS')
      .select('column_name', 'data_type', 'character_maximum_length')
      .where('TABLE_NAME', '=', tableName)
      .andWhere('TABLE_SCHEMA', '=', dbName);
    }

    p.then(function (res) {
      // Compile the returned data and set it on the model's prototype
      var columns = _.reduce(res, mapColumns, {});
      var columNames = Object.keys(columns);

      cTor.prototype._schema = columns;
      // assign the column names separately for ease of use
      cTor.prototype._columns = columNames;
      return columns;
    });
  };

  Bookshelf.Model.extend = function (protoProps, staticProps) {
    // Extend the model normally
    var m = extend.call(this, protoProps, staticProps);

    // Read the column information for the model's database table
    var tableName = protoProps.tableName;
    if (tableName) {
      m._getSchema(tableName);
    }

    return m;
  };

  // patch all model methods to wait for the schema query first
  var modelMethods = ['fetch', 'load', 'save', 'destroy'];

  _.each(modelMethods, function (method) {
    var oldMethod = Bookshelf.Model.prototype[method];

    Bookshelf.Model.prototype[method] = function () {
      var args = new Array(arguments.length);
      for(var i = 0; i < args.length; ++i) {
          args[i] = arguments[i];
      }

      var self = this;
      return this._fetchSchema.then(function () {
        return oldMethod.apply(self, args);
      });
    };
  });

  // patch all collection methods to wait for their model's schema query first
  var collectionMethods = ['fetch', 'fetchOne', 'create'];
  _.each(collectionMethods, function (method) {
    var oldMethod = Bookshelf.Collection.prototype[method];

    Bookshelf.Collection.prototype[method] = function () {
      var args = new Array(arguments.length);
      for(var i = 0; i < args.length; ++i) {
          args[i] = arguments[i];
      }

      var self = this;
      return this.model.prototype._fetchSchema.then(function () {
        return oldMethod.apply(self, args);
      });
    };

  });

};