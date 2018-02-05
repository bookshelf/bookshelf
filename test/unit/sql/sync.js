var _ = require('lodash');
var path     = require('path');
var basePath = process.cwd();

module.exports = function() {
  var Sync = require(path.resolve(basePath + '/lib/sync'));

  describe('Sync', function() {
    var stubSync = function() {
      var qd = [];
      var stubQuery = function() {
        qd.push(_.toArray(arguments));
        return this;
      };

      return {
        id: 1,
        idAttribute: 'id',
        tableName: 'testtable',
        format: _.identity,
        isNew: function() {
          return true
        },
        queryData: qd,
        query: function() {
          return {
            where: stubQuery,
            limit: stubQuery
          };
        },
        resetQuery: function() {
          return this;
        }
      };
    };

    describe('prefixFields', function() {
      it('should prefix all keys of the passed in object with the tablename', function() {
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
        var attributes = {
          'Some': 'column',
          'Another': 'column'
        };
        var sync = new Sync(_.extend(stubSync(), {
          format: function(attrs) {
            var data = {};
            for (var key in attrs) {
              data[key.toLowerCase()] = attrs[key];
            }
            return data;
          }
        }));

        sync.select = function() {
          expect(this.syncing.queryData[0]).to.eql([{
            "testtable.some": "column",
            "testtable.another": "column"
          }]);
        };

        return sync.first(attributes);
      });
    });

    describe('update', function() {
      it('doesn\'t try to update the primary key if it hasn\'t changed', function() {
        var sync = new Sync(stubSync());
        _.extend(sync.query, {
          update: function(attrs) {
            expect(attrs).to.not.have.property('id');
          },
          where: function() {
            this._statements = [{grouping: 'where'}];
          }
        });

        return sync.update({id: 1, name: 'something'});
      });

      it('will update the primary key if it has changed', function() {
        var sync = new Sync(stubSync());
        _.extend(sync.query, {
          update: function(attrs) {
            expect(attrs).to.have.property('id');
            expect(attrs.id).to.equal(2);
          },
          where: function() {
            this._statements = [{grouping: 'where'}];
          }
        });

        return sync.update({id: 2, name: 'something'});
      })
    })
  });
};
