var when      = require('when');
var assert    = require('assert');
var equal     = assert.equal;
var _         = require('underscore');

module.exports = function() {

  // This module is included into the `bookshelf` repository,
  // and run from the root of the directory.
  var path     = require('path');
  var basePath = process.cwd();

  var CollectionBase = require(path.resolve(basePath + '/dialects/base/collection')).CollectionBase;
  var ModelBase      = require(path.resolve(basePath + '/dialects/base/model')).ModelBase;

  describe('Collection', function() {

    var collection;
    var Collection = CollectionBase.extend({
      model: ModelBase.extend({
        tableName: 'test_table',
        idAttribute: 'some_id',
        invokedMethod: function() {
          return when(this.id);
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

    it('should use the `set` method to update the collections, similar to Backbone', function() {

      collection.set([{some_id: 2, name: 'Test'}, {some_id: 3, name: 'Item'}]);

      equal(collection.length, 2);

      collection.set([{some_id: 2, name: 'Item'}], {remove: false});

      equal(collection.length, 2);

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

      var spyIterator = sinon.spy(function(model) {
        return model.id;
      });

      return collection.invokeThen('invokedMethod').then(function(resp) {
        expect(_.compact(resp)).to.eql([1]);
      });

    });

  });


};