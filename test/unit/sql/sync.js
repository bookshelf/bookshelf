var Promise   = testPromise;
var _         = require('lodash');

module.exports = function() {

  // This module is included into the `bookshelf` repository,
  // and run from the root of the directory.
  var path     = require('path');
  var basePath = process.cwd();

  var Sync = require(path.resolve(basePath + '/dialects/sql/sync')).Sync;

  describe('Sync', function() {
    var noop = function() {};
    var stubSyncing = {
      query: noop,
      resetQuery: function () {
        return {
          tableName: 'testtable'
        };
      }
    };
    describe('prefixFields', function () {
      var sync = new Sync(stubSyncing);

      it('should prefix all keys of the passed in object with the tablename', function () {
        var attributes = {
          'some': 'column',
          'another': 'column'
        };

        var isPrefixed = _.isEqual(sync.prefixFields(attributes), {
          'testtable.some':'column',
          'testtable.another':'column'
        });

        expect(isPrefixed).to.be.true;

      });

    });

  });


};
