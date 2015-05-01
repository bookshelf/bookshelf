var Promise   = testPromise;
var assert    = require('assert');
var equal     = assert.equal;
var _         = require('lodash');

module.exports = function() {

  // This module is included into the `bookshelf` repository,
  // and run from the root of the directory.
  var path     = require('path');
  var basePath = process.cwd();

  var CollectionBase = require(path.resolve(basePath + '/lib/base/collection'));
  var ModelBase      = require(path.resolve(basePath + '/lib/base/model'));

  describe('Collection', function() {

    var collection;
    var Collection = CollectionBase.extend({
      model: ModelBase.extend({
        tableName: 'test_table',
        idAttribute: 'some_id',
        invokedMethod: function() {
          return Promise.resolve(this.id);
        }
      })
    });

    beforeEach(function() {
      collection = new Collection([{some_id: 1, name: 'Test'}, {id: 2, name: 'No Id'}]);
    });

    it('should have a tableName method, returning the tableName of the model', function () {

      equal(collection.tableName(), 'test_table');

    });

    it('should have an idAttribute method, returning the idAttribute of the model', function() {

      equal(collection.idAttribute(), 'some_id');

    });

    it('should initialize the items passed to the constructor', function() {

      equal(collection.length, 2);

      equal(collection.at(0).id, 1);

      equal(collection.at(1).id, undefined);

    });


    describe('#set()', function() {
      it('should delete old models and add new ones by default', function() {
        collection.set([{some_id: 1, name: 'Test'}, {some_id: 2, name: 'Item'}]);
        equal(collection.length, 2);
        equal(collection.models.length, 2);
      });

      it('should not remove models with {remove: false} option set', function() {
        collection.set([{some_id: 2, name: 'Item2'}], {remove: false});

        equal(collection.length, 3);
      });

      it('should not merge new attribute values with {merge: false} option set', function() {
        collection.set([{some_id: 1, name: 'WontChange'}], {merge: false, parse: true});

        equal(collection.get(1).get('name'), 'Test');
      });

      it('should accept a single model, not an array', function() {
        collection.set({some_id: 1, name: 'Changed'});
        equal(collection.get(1).get('name'), 'Changed');
      });

      it('should accept Models', function() {
        var model = new collection.model({
          some_id: 3,
          name: 'Changed'
        });
        collection.set([model]);
        equal(collection.get(3).get('name'), 'Changed');
      });

      it('should not add models with {add: false} option set', function() {
        collection.set([{some_id: 3, name: 'WontAdd'}], {add: false});
        equal(collection.get(3), undefined);
      });

      it('should support large arrays', function() {
        this.timeout(15000);

        var count = 200000;
        var models = [];
        var i;

        for (i = 0; i < count; ++i) {
          models.push(new collection.model({
            some_id: i, 
            name: 'Large-' + i
          }));
        }
        collection.set(models, {add: true, remove: false, merge: false});
        equal(collection.get(count - 1).get('name'), 'Large-' + (count - 1));
      });
    });

    it('should use the `reset` method, to reset the collection', function() {

      collection.reset([]);

      equal(collection.length, 0);

    });

    it('should use _prepareModel to prep model instances', function() {

      var model = new ModelBase({id: 1});

      expect(model).to.equal(collection._prepareModel(model));

      var newModel = collection._prepareModel({some_id: 1});

      assert.ok((newModel instanceof collection.model));

    });

    it('contains a mapThen method, which calls map on the models, and returns a when.all promise', function() {

      var spyIterator = sinon.spy(function(model) {
        return model.id;
      });

      return collection.mapThen(spyIterator).then(function(resp) {
        spyIterator.should.have.been.calledTwice;
        expect(_.compact(resp)).to.eql([1]);
      });

    });

    it('contains an invokeThen method, which does an invoke on the models, and returns a when.all promise', function() {

      return collection.invokeThen('invokedMethod').then(function(resp) {
        expect(_.compact(resp)).to.eql([1]);
      })

    });

  });


};