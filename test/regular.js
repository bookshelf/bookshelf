var _ = require('underscore');
var objectdump = require('objectdump');
var dev = parseInt(process.env.BOOKSHELF_DEV, 10);
var out = (dev ? require('./index').output : require('./shared/output'));
var assert = require('assert');

module.exports = function(Bookshelf, type) {

  describe('DB Tests ' + type, function() {

    // Load all of the tables and
    // data for the tests.
    before(function(ok) {
      require('./shared/migration')(Bookshelf)
        .then(function() {
          return require('./shared/inserts')(Bookshelf);
        })
        .then(function() {
          ok();
        });
    });

    describe('Bookshelf.Model - ' + type, function() {
      require('./lib/model')(Bookshelf, handler(type, 'model'), 'DB');
    });

    describe('Bookshelf.Collection - ' + type, function() {
      require('./lib/collection')(Bookshelf, handler(type, 'collection'), 'DB');
    });

    describe('Bookshelf.Relations - ' + type, function() {
      require('./lib/relations')(Bookshelf, handler(type, 'relations'), 'DB');
    });

    after(function(ok) {
      if (dev) require('fs').writeFileSync('./test/shared/output.js', 'module.exports = ' + objectdump(out));
      ok();
    });

  });
};

var handler = function(instance, section) {
  var item = 1;
  return function(test, resolver, isAll) {
    var fn = function(data) {
      data = JSON.parse(JSON.stringify(data));
      var label = '' + section + '.' + item + ' - ' + test.test.title;
      if (dev) {
        if (_.isArray(data)) data = _.map(data, omitDates);
        out['db'] = out['db'] || {};
        out['db'][label] = out['db'][label] || {};
        out['db'][label][instance] = data;
      } else {
        var checkData = out['db'][label][instance];
        if (_.isArray(data)) {
          data = _.map(data, omitDates);
          checkData = _.map(checkData, omitDates);
        }
        try {
          assert.deepEqual(checkData, data);
        } catch (e) {
          console.log([checkData, data]);
        }
      }
      item++;
      if (!isAll) resolver();
    };
    if (isAll) {
      return function(data) {
        _.map(data, fn);
        resolver();
      };
    } else {
      return fn;
    }
  };
};

var omitDates = function(item) {
  if (_.isObject(item)) {
    return _.omit(item, 'created_at', 'updated_at');
  }
  return item;
};