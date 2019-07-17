var Promise = global.testPromise;
var {deepEqual, equal, notStrictEqual} = require('assert');
var _ = require('lodash');
var path = require('path');
var basePath = process.cwd();

module.exports = function() {
  const Model = require(path.resolve(basePath, 'lib/model'));
  const Collection = require(path.resolve(basePath, 'lib/collection'));

  describe('Model', function() {
    describe('#save()', function() {
      it('should clone the passed in `options` object', function() {
        var model = new Model();
        var options = {
          query: {}
        };

        model.sync = function(opts) {
          notStrictEqual(options, opts);

          return {
            insert: function(opts) {
              return Promise.resolve({});
            }
          };
        };

        return model.save(null, options).then(function() {
          equal(_.difference(Object.keys(options), ['query']).length, 0);
        });
      });
    });

    describe('#timestamp()', function() {
      it('will set the updated_at and the created_at attributes to a new date for new models', function() {
        var newModel = new Model({}, {hasTimestamps: true});
        newModel.timestamp();

        expect(newModel.get('created_at')).to.be.an.instanceOf(Date);
        expect(newModel.get('updated_at')).to.be.an.instanceOf(Date);
      });

      it('will not set the created_at attribute to a new date for existing models', function() {
        var existingModel = new Model({id: 1}, {hasTimestamps: true});
        existingModel.timestamp();

        expect(existingModel.get('created_at')).to.be.undefined;
        expect(existingModel.get('updated_at')).to.be.an.instanceOf(Date);
      });

      it('will set the created_at attribute when inserting new models with a predefined id value', function() {
        var model = new Model({id: 1}, {hasTimestamps: true});
        model.timestamp({method: 'insert'});

        expect(model.get('created_at')).to.be.an.instanceOf(Date);
        expect(model.get('updated_at')).to.be.an.instanceOf(Date);
      });

      it("will not set timestamps on a model if hasTimestamps isn't set", function() {
        var model = new Model();
        model.timestamp();

        expect(model.get('created_at')).to.not.exist;
        expect(model.get('updated_at')).to.not.exist;
      });
    });

    describe('#toJSON()', function() {
      let ModelCollection;
      let testModel;

      before(() => {
        ModelCollection = Collection.extend({model: Model});
      });

      beforeEach(() => {
        testModel = new Model({id: 1, name: 'Test'});
      });

      it('includes the idAttribute in the hash', function() {
        const DifferentModel = Model.extend({idAttribute: '_id'});
        const testModel = new DifferentModel({_id: 1, name: 'Joe'});

        deepEqual(testModel.toJSON(), {_id: 1, name: 'Joe'});
      });

      it('includes the relations loaded on the model', function() {
        testModel.relations = {
          someList: new ModelCollection([{id: 1}, {id: 2}])
        };
        var json = testModel.toJSON();

        deepEqual(Object.keys(json), ['id', 'name', 'someList']);
        equal(json.someList.length, 2);
      });

      it("doesn't include the relations loaded on the model if {shallow: true} is passed", function() {
        testModel.relations = {
          someList: new ModelCollection([{id: 1}, {id: 2}])
        };
        var shallow = testModel.toJSON({shallow: true});

        deepEqual(_.keys(shallow), ['id', 'name']);
      });

      it('does not omit new models from collections and relations when {omitNew: false} is passed', function() {
        testModel.relations = {
          someList: new ModelCollection([{id: 2}, {attr2: 'Test'}]),
          someRel: new Model({id: 3}),
          otherRel: new Model({attr3: 'Test'})
        };
        var coll = new ModelCollection([testModel, new Model({attr5: 'Test'}), new Model({id: 4, attr4: 'Test'})]);
        var json = coll.toJSON({omitNew: false});

        equal(json.length, 3);
        equal(json[0].someList.length, 2);
        deepEqual(_.keys(json[0]), ['id', 'name', 'someList', 'someRel', 'otherRel']);
        deepEqual(_.keys(json[1]), ['attr5']);
        deepEqual(_.keys(json[2]), ['id', 'attr4']);
      });

      it('does not omit new models from collections and relations when omitNew is not specified', function() {
        testModel.relations = {
          someList: new ModelCollection([{id: 2}, {attr2: 'Test'}]),
          someRel: new Model({id: 3}),
          otherRel: new Model({attr3: 'Test'})
        };
        var coll = new ModelCollection([testModel, new Model({attr5: 'Test'}), new Model({id: 4, attr4: 'Test'})]);
        var json = coll.toJSON();

        equal(json.length, 3);
        equal(json[0].someList.length, 2);
        deepEqual(_.keys(json[0]), ['id', 'name', 'someList', 'someRel', 'otherRel']);
        deepEqual(_.keys(json[1]), ['attr5']);
        deepEqual(_.keys(json[2]), ['id', 'attr4']);
      });

      it('omits new models from collections and relations when {omitNew: true} is passed', function() {
        testModel.relations = {
          someList: new ModelCollection([{id: 2}, {attr2: 'Test'}]),
          someRel: new Model({id: 3}),
          otherRel: new Model({attr3: 'Test'})
        };
        var coll = new ModelCollection([testModel, new Model({attr5: 'Test'}), new Model({id: 4, attr4: 'Test'})]);
        var omitNew = coll.toJSON({omitNew: true});

        equal(omitNew.length, 2);
        deepEqual(_.keys(omitNew[0]), ['id', 'name', 'someList', 'someRel']);
        deepEqual(_.keys(omitNew[1]), ['id', 'attr4']);
        equal(omitNew[0].someList.length, 1);
      });

      it('returns null for a new model when {omitNew: true} is passed', function() {
        var testModel = new Model({attr1: 'Test'});
        var omitNew = testModel.toJSON({omitNew: true});
        deepEqual(omitNew, null);
      });
    });

    describe('#hasChanged()', function() {
      it('returns true if an attribute was set on a new model instance', function() {
        var model = new Model({test: 'something'});
        expect(model.hasChanged('test')).to.be.true;
      });

      it("returns false if the attribute isn't set on a new model instance", function() {
        var model = new Model({test: 'something'});
        expect(model.hasChanged('id')).to.be.false;
      });

      it("returns false if the attribute isn't updated after a sync operation", function() {
        var model = new Model({test: 'something'});
        model._reset();
        expect(model.hasChanged('test')).to.be.false;
      });

      it('returns true if an existing attribute is updated', function() {
        var model = new Model({test: 'something'});

        model._reset();
        model.set('test', 'something else');

        expect(model.hasChanged('test')).to.be.true;
      });
    });
  });
};
