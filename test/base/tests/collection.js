var Promise = global.testPromise;
var assert = require('assert');
var equal = assert.equal;
var _ = require('lodash');

module.exports = function() {
  var path = require('path');
  var basePath = process.cwd();
  var CollectionBase = require(path.resolve(basePath + '/lib/base/collection'));
  var ModelBase = require(path.resolve(basePath + '/lib/base/model'));

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
      collection = new Collection([{some_id: 1, name: 'Test'}, {name: 'No Id'}]);
    });

    it('should have a tableName method that returns the tableName of the model', function() {
      equal(collection.tableName(), 'test_table');
    });

    it('should be iterable', function() {
      var models = [];
      collection = new Collection([{some_id: 1}, {some_id: 2}]);
      for (var model of collection) {
        models.push(model);
      }
      equal(models.length, collection.length);
    });

    it('should have an idAttribute method, returning the idAttribute of the model', function() {
      equal(collection.idAttribute(), 'some_id');
    });

    it('should initialize the items passed to the constructor', function() {
      equal(collection.length, 2);
      equal(collection.at(0).id, 1);
      equal(collection.at(1).id, undefined);
    });

    describe('#add()', function() {
      it('adds new models to the collection', function() {
        var originalLength = collection.length;
        var newLength = collection.add({some_id: 3, name: 'Alice'}).length;
        expect(newLength).to.be.above(originalLength);
      });

      it('ignores duplicate models by default', function() {
        collection.add({some_id: 1, name: 'Not Test'});
        expect(collection.at(0).get('name')).to.equal('Test');
      });

      it('merges duplicate models when the merge option is set', function() {
        collection.add({some_id: 1, name: 'Not Test'}, {merge: true});
        expect(collection.at(0).get('name')).to.equal('Not Test');
      });

      it("Ignores the remove option when it's set to true", function() {
        var originalLength = collection.length;
        var newLength = collection.add(null, {remove: true}).length;

        expect(collection.at(0).get('name')).to.equal('Test');
        expect(newLength).to.equal(originalLength);
      });

      it("Ignores the add option when it's set to false and still adds new models", function() {
        var originalLength = collection.length;
        var newLength = collection.add({some_id: 3, name: 'Alice'}, {add: false}).length;
        expect(newLength).to.be.above(originalLength);
      });
    });

    describe('#set()', function() {
      it('should accept a single object as argument', function() {
        collection.set({some_id: 3, name: 'New Model'});
        expect(collection.at(0).get('name')).to.equal('New Model');
      });

      it('should accept Models as argument', function() {
        var model = new collection.model({some_id: 3, name: 'New Model'});
        collection.set([model]);
        expect(collection.at(0).get('name')).to.equal('New Model');
      });

      it('should delete old models and add new ones by default', function() {
        collection.set([{some_id: 1, name: 'Item 1'}, {some_id: 2, name: 'Item 2'}]);
        equal(collection.length, 2);
        equal(collection.at(0).get('name'), 'Item 1');
        equal(collection.at(1).get('name'), 'Item 2');
      });

      it('should delete old models and add new ones with similar binary IDs', function() {
        collection = new Collection([{some_id: new Buffer('90', 'hex'), name: 'Test'}, {name: 'No Id'}]);
        collection.set([
          {some_id: new Buffer('90', 'hex'), name: 'Item 1'},
          {some_id: new Buffer('93', 'hex'), name: 'Item 2'}
        ]);
        equal(collection.length, 2);
        equal(collection.at(0).get('name'), 'Item 1');
        equal(collection.at(1).get('name'), 'Item 2');
      });

      it('should merge duplicate models by default', function() {
        collection.set({some_id: 1, name: 'Not Test'});
        expect(collection.at(0).get('name')).to.equal('Not Test');
        expect(collection.length).to.equal(1);
      });

      it('should merge duplicate models in the new set', function() {
        collection.set([{some_id: 1, name: 'Not Test'}, {some_id: 1, name: 'Not Test As Well'}]);
        expect(collection.at(0).get('name')).to.equal('Not Test As Well');
        expect(collection.toJSON().length).to.equal(collection.length);
        expect(collection.length).to.equal(1);
      });

      it('should not remove models with {remove: false} option set', function() {
        collection.set([{some_id: 2, name: 'Item2'}], {remove: false});
        equal(collection.length, 3);
      });

      it('should not merge new attribute values with {merge: false} option set', function() {
        collection.set([{some_id: 1, name: 'WontChange'}], {merge: false});
        equal(collection.get(1).get('name'), 'Test');
      });

      it('should add duplicate models if both the remove and merge options are false', function() {
        var originalLength = collection.length;
        var newLength = collection.set({some_id: 1, name: 'Not Test'}, {merge: false, remove: false}).length;
        expect(newLength).to.be.above(originalLength);
      });

      it('should not add models with {add: false} option set', function() {
        collection.set([{some_id: 3, name: 'WontAdd'}], {add: false});
        equal(collection.get(3), undefined);
      });

      it('should support large arrays', function() {
        this.timeout(120000);

        var count = 200000;
        var models = [];

        for (var i = 0; i < count; ++i) {
          models.push(new collection.model({some_id: i, name: 'Large-' + i}));
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
      assert.ok(newModel instanceof collection.model);
    });

    it('contains a mapThen method which calls map on the models and returns a when.all promise', function() {
      var spyIterator = sinon.spy(function(model) {
        return model.id;
      });

      return collection.mapThen(spyIterator).then(function(resp) {
        spyIterator.should.have.been.calledTwice;
        expect(_.compact(resp)).to.eql([1]);
      });
    });

    it('contains an invokeThen method which does an invoke on the models and returns a when.all promise', function() {
      return collection.invokeThen('invokedMethod').then(function(resp) {
        expect(_.compact(resp)).to.eql([1]);
      });
    });
  });
};
