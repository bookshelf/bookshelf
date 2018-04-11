var _ = require('lodash');
var path = require('path');
var basePath = process.cwd();

module.exports = function() {
  var Sync = require(path.resolve(basePath + '/lib/sync'));

  describe('Sync', function() {
    var stubModel = function(idAttribute) {
      var qd = [];

      return {
        idAttribute: idAttribute || 'id',
        id: 'pk',
        attributes: {
          idAttribute: 'pk'
        },
        tableName: 'testtable',
        format: _.identity,
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
        resetQuery: function() {
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

    it('accepts a withSchema option', function() {
      var testSchema = 'test';
      var setSchema = sinon.spy();
      var mockModel = {
        query: function() {
          return {withSchema: setSchema}
        },
        resetQuery: function() {}
      }

      new Sync(mockModel, {withSchema: testSchema});

      setSchema.should.have.been.calledWith(testSchema);
    })

    it('accepts a lock option option if called with a transaction', function() {
      var setLock = sinon.spy();
      var mockModel = {
        query: function() {
          return {forUpdate: setLock, transacting: function() {}}
        },
        resetQuery: function() {}
      }

      new Sync(mockModel, {lock: 'forUpdate', transacting: 'something'});

      setLock.should.have.been.called;
    })

    it('ignores the lock option if called without a transaction', function() {
      var setLock = sinon.spy();
      var mockModel = {
        query: function() {
          return {forUpdate: setLock, transacting: function() {}}
        },
        resetQuery: function() {}
      }

      new Sync(mockModel, {lock: 'forUpdate'});

      setLock.should.not.have.been.called;
    })

    describe('prefixFields', function() {
      it('should prefix all keys of the passed in object with the tablename', function() {
        var sync = new Sync(stubModel());
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
        var sync = new Sync(_.extend(stubModel(), {
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
        var stubModelInstance = _.extend(stubModel('idAttribute'), {
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
          expect(stubModelInstance.getWhereParts()).to.eql([{id_attribute: 'pk'}]);
          expect(attrs).to.eql({'some_column': 'updated', 'other_column': 'updated'});
          done()
        }

        var sync = new Sync(stubModelInstance);
        sync.update(updateFields);
      });

      it('should format id attribute for deletes', function(done) {
        var snakeCase = _.snakeCase;
        var stubModelInstance = _.extend(stubModel('idAttribute'), {
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
          expect(stubModelInstance.getWhereParts()).to.eql([{id_attribute: 'pk'}]);
          done()
        }

        var sync = new Sync(stubModelInstance);
        sync.del()
      });
    });

    describe('update', function() {
      it('doesn\'t try to update the primary key if it hasn\'t changed', function() {
        var sync = new Sync(stubModel());
        _.extend(sync.query, {
          update: function(attrs) {
            expect(attrs).to.not.have.property('id');
          },
          where: function() {
            this._statements = [{grouping: 'where'}];
          }
        });

        return sync.update({id: 'pk', name: 'something'});
      });

      it('will update the primary key if it has changed', function() {
        var sync = new Sync(stubModel());
        _.extend(sync.query, {
          update: function(attrs) {
            expect(attrs).to.have.property('id');
            expect(attrs.id).to.equal('updated');
          },
          where: function() {
            this._statements = [{grouping: 'where'}];
          }
        });

        return sync.update({id: 'updated', name: 'something'});
      })
    })
  });
};
