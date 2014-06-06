var Promise   = testPromise;
var _         = require('lodash');

module.exports = function() {

  // This module is included into the `bookshelf` repository,
  // and run from the root of the directory.
  var path     = require('path');
  var basePath = process.cwd();

  var Sync = require(path.resolve(basePath + '/lib/sync'));

  describe('Sync', function() {

    var stubSync = function() {
      var qd = [];
      var stubQuery = function() {
        qd.push(_.toArray(arguments));
        return this;
      };
      return {
        tableName: 'testtable',
        queryData: qd,
        query: function() {
          return {
            where: stubQuery,
            limit: stubQuery
          };
        },
        resetQuery: function () {
          return this;
        }
      };
    };

    describe('prefixFields', function () {

      it('should prefix all keys of the passed in object with the tablename', function () {

        var sync = new Sync(stubSync());

        var attributes = {
          'some': 'column',
          'another': 'column'
        };

        expect(sync.prefixFields(attributes)).to.eql({
          'testtable.some':'column',
          'testtable.another':'column'
        });

      });

      it('should run after format', function() {

        var sync = new Sync(_.extend(stubSync(), {
          format: function(attrs) {
            var data = {};
            for (var key in attrs) {
              data[key.toLowerCase()] = attrs[key];
            }
            return data;
          },
          attributes: {
            'Some': 'column',
            'Another': 'column'
          }
        }));
        sync.select = function() {
          expect(this.syncing.queryData[0]).to.eql([{
            "testtable.some": "column",
            "testtable.another": "column"
          }]);
        };
        return sync.first();

      });

    });


  });


};
