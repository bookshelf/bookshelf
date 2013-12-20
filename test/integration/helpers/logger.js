var cwd           = process.cwd();
var isDev         = parseInt(process.env.BOOKSHELF_DEV, 10);

var _             = require('lodash');

var Ctors = {};

var Common          = require('knex/lib/common').Common;

Ctors.Raw           = require('knex/lib/raw').Raw;
Ctors.Builder       = require('knex/lib/builder').Builder;
Ctors.SchemaBuilder = require('knex/lib/schemabuilder').SchemaBuilder;

Ctors.Model         = require('../../../dialects/sql/model').Model;
Ctors.Collection    = require('../../../dialects/sql/collection').Collection;

var fs            = require('fs');
var objectdump    = require('objectdump');

// This is where all of the info from the query calls goes...
var output     = {};
var comparable = {};
var counters   = {};

exports.setLib = function(context) {

  var logMe = function(logWhat) {
    this.isLogging = logWhat || 'result';
    return this;
  };

  var then = function(onFufilled, onRejected) {

    this._promise || (this._promise = this.client.query(this));

    var then = this;

    if (this.isLogging) {

      var title   = context.test.title;
      var parent  = generateTitle(context.test).pop();
      var dialect = this.client.dialect;

      if (!isDev && !comparable[parent]) {
        comparable[parent] = require(__dirname + '/../output/' + parent);
      }

      // If we're not only logging the result for this query...
      if (this.isLogging !== 'result') {
        var bindings = this.cleanBindings();
        checkIt('sql', title, parent, dialect, {sql: this.toSql(), bindings: this.cleanBindings()});
      }
    }

    return this._promise.tap(function(resp) {

      // If we're not only logging the sql for this query...
      if (then.isLogging && then.isLogging !== 'sql') {
        checkIt('result', title, parent, dialect, {result: resp});
      }

    }).then(onFufilled, onRejected);

  };

  var checkIt = function(type, title, parent, dialect, data) {
    output[parent] = output[parent] || {};
    output[parent][title] = output[parent][title] || {};
    var toCheck, target = output[parent][title][dialect] = output[parent][title][dialect] || {};

    try {
      toCheck = comparable[parent][title][dialect];
    } catch (e) {
      if (!isDev) throw e;
    }

    var items = type === 'sql' ? ['bindings', 'sql'] : ['result'];

    if (!isDev) {

      _.each(items, function(item) {

        var localData = toCheck[item];
        var newData   = data[item];

        // Mutate the bindings arrays to not check dates.
        if (item === 'bindings') {
          parseBindingDates(newData, localData);
        } if (item === 'result') {
          parseResultDates(newData, localData);
        }

        expect(localData).to.eql(newData);
      });


    } else {

      _.each(items, function(item) {

        var newData = data[item];

        if (_.isObject(newData)) newData = JSON.parse(JSON.stringify(newData));

        target[item] = newData;

      });

    }

  };

  _.each(['Raw', 'SchemaBuilder', 'Builder'], function(Item) {
    Ctors[Item].prototype.logMe = logMe;
    Ctors[Item].prototype.then  = then;
  });

  _.each(['Model', 'Collection'], function(Item) {
    var origFetch = Ctors[Item].prototype.fetch;
    Ctors[Item].prototype.fetch = function(options) {
      options = options || {};
      var dialect = this.query().client.dialect;
      return origFetch.apply(this, arguments).then(function(obj) {
        if (options.log) {
          if (options.debugging) debugger;
          var title   = context.test.title;
          var parent  = generateTitle(context.test).pop();
          if (!isDev && !comparable[parent]) {
            comparable[parent] = require(__dirname + '/../output/' + parent);
          }
          checkIt('result', title, parent, dialect, {result: JSON.parse(JSON.stringify(obj))});
        }
        return obj;
      });
    };

    Ctors[Item].prototype.logMe = function(val) {
      this.query('logMe', val);
      return this;
    };
  });

  var parseResultDates = function(newData, localData) {
    _.each([newData, localData], function(item) {
      _.each(item, function(row, i) {
        item[i] = _.omit(row, 'created_at', 'updated_at');
      });
    });
  };

  var parseBindingDates = function(newData, localData) {
    _.each(localData, function(item, index) {
      if (_.isDate(item)) {
        localData[index] = '_date_';
        newData[index]   = '_date_';
      }
    });
  };

  var generateTitle = function(context, stack) {
    stack = stack || [];
    if (context.parent && context.parent.title.indexOf('Dialect') !== 0) {
      stack.push(context.parent.title);
      return generateTitle(context.parent, stack);
    }
    return stack;
  };

};

exports.writeResult = function() {
  if (!isDev) return;
  _.each(output, function(val, key) {
    fs.writeFileSync(__dirname + '/../output/' + key + '.js', 'module.exports = ' + objectdump(val) + ';');
  });
};

