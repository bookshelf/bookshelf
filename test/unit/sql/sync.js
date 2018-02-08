var Promise   = testPromise;
var _         = require('lodash');

module.exports = function() {

  // This module is included into the `bookshelf` repository,
  // and run from the root of the directory.
  var path     = require('path');
  var basePath = process.cwd();

  var Sync = require(path.resolve(basePath + '/lib/sync'));

  describe('Sync', function() {

    var stubSync = function(idAttribute) {
      var qd = [];
      var stubQuery = function() {
        qd.push(_.toArray(arguments));
        return this;
      };
      return {
        idAttribute: idAttribute || 'id',
        id: 'pk',
        attributes: {
          idAttribute: 'pk'
        },
        tableName: 'testtable',
        isNew: function() {
          return true
        },
        queryData: qd, 
        operation: null,
        query: function() { return this._query },
        _query: {
          _statements: qd,
          where: function(where) { qd.push({grouping: 'where', where}) },
          limit: function(limit) { qd.push({grouping: 'limit', limit}) },
        },
        resetQuery: function () {
          return this;
        },
        getWhereParts: function() {
          return qd
          .filter(function(item) {
            return item.grouping == 'where'
          })
          .map(function(item) {
            return item.where
          });
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

      it('should run after format for select', function() {

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
          expect(this.syncing.queryData[0].where).to.eql({ 
            "testtable.some": "column",
            "testtable.another": "column"
          });
        };
        return sync.first(attributes);

      });

      it('should format attributes for updates, including id attribute', function(done) {
        var snakeCase = _.snakeCase;
        var stubModelInstance = _.extend(stubSync('idAttribute'), {
          format: function(attrs) {
            var data = {};
            for (var key in attrs) {
              data[snakeCase(key)] = attrs[key];
            }
            return data;
          }
        });

        var updateFields = {
          someColumn: 'updated',
          otherColumn: 'updated'
        };

        stubModelInstance._query.update = function(attrs) {
            expect(stubModelInstance.getWhereParts()).to.eql([
              { id_attribute: 'pk' }
            ]);

            expect(attrs).to.eql({
              'some_column': 'updated',
              'other_column': 'updated'
            });

            done()
        }

        var sync = new Sync(stubModelInstance);
        sync.update(updateFields);
      });

      it('should format id attribute for deletes', function(done) {
        var snakeCase = _.snakeCase;

        var stubModelInstance = _.extend(stubSync('idAttribute'), {
          idAttribute: 'idAttribute',
          format: function(attrs) {
            var data = {};
            for (var key in attrs) {
              data[snakeCase(key)] = attrs[key];
            }
            return data;
          }
        })
        
        stubModelInstance._query.del = function() {
            expect(stubModelInstance.getWhereParts()).to.eql([
              { id_attribute: 'pk' }
            ]);

            done()
        }
        
        var sync = new Sync(stubModelInstance);
        sync.del()
        
      });

    });

  });

};
