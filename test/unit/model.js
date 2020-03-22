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

        model.refresh = () => Promise.resolve({});

        return model.save(null, options).then(function() {
          equal(_.difference(Object.keys(options), ['query']).length, 0);
        });
      });

      describe('when the save method is update', () => {
        it('should not call model.parse with a non-object argument', () => {
          const model = new Model();
          model.sync = () => {
            return {
              update: () => {
                return Promise.resolve(1);
              }
            };
          };
          model.refresh = () => Promise.resolve({});
          const parse = sinon.spy(model, 'parse');
          return model.save(null, {method: 'update'}).then(function() {
            expect(parse).not.to.have.been.calledWith(undefined);
          });
        });

        it('should merge the updated attributes on the existing model', () => {
          const model = new Model({oldProp: 'b'});
          model.sync = () => {
            return {
              update: () => {
                return Promise.resolve([{newProp: 'a'}]);
              }
            };
          };
          model.refresh = () => Promise.resolve({});
          const parse = sinon.spy(model, 'parse');
          return model.save(null, {method: 'update'}).then(function(updatedModel) {
            expect(parse).to.have.been.calledWith({newProp: 'a'});
            expect(updatedModel.toJSON()).to.eql({oldProp: 'b', newProp: 'a'});
          });
        });
      });

      describe('when the save method is insert', () => {
        it('should not call model.parse with a non-object argument', () => {
          const model = new Model();
          model.id = '12345';
          model.sync = () => {
            return {
              insert: () => {
                return Promise.resolve(['12345']);
              }
            };
          };
          model.refresh = () => Promise.resolve({});
          const parse = sinon.spy(model, 'parse');
          return model.save(null, {method: 'insert'}).then(function() {
            expect(parse).not.to.have.been.calledWith('12345');
          });
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
        testModel = new Model({id: 1, firstName: 'Joe', lastName: 'Shmoe', address: '123 Main St.'});
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

        deepEqual(Object.keys(json), ['id', 'firstName', 'lastName', 'address', 'someList']);
        equal(json.someList.length, 2);
      });

      describe('with "shallow" option', function() {
        it("doesn't include the relations loaded on the model if {shallow: true} is passed", function() {
          testModel.relations = {
            someList: new ModelCollection([{id: 1}, {id: 2}])
          };
          var shallow = testModel.toJSON({shallow: true});

          deepEqual(_.keys(shallow), ['id', 'firstName', 'lastName', 'address']);
        });
      });

      describe('with "omitNew" option', function() {
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
          deepEqual(_.keys(json[0]), ['id', 'firstName', 'lastName', 'address', 'someList', 'someRel', 'otherRel']);
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
          deepEqual(_.keys(json[0]), ['id', 'firstName', 'lastName', 'address', 'someList', 'someRel', 'otherRel']);
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
          deepEqual(_.keys(omitNew[0]), ['id', 'firstName', 'lastName', 'address', 'someList', 'someRel']);
          deepEqual(_.keys(omitNew[1]), ['id', 'attr4']);
          equal(omitNew[0].someList.length, 1);
        });

        it('returns null for a new model when {omitNew: true} is passed', function() {
          var testModel = new Model({attr1: 'Test'});
          var omitNew = testModel.toJSON({omitNew: true});
          deepEqual(omitNew, null);
        });
      });

      describe('with "visible" option', function() {
        it('only shows the fields specified in the model\'s "visible" property', function() {
          testModel.visible = ['firstName'];
          deepEqual(testModel.toJSON(), {firstName: 'Joe'});
        });

        it('only shows the fields specified in the "options.visible" property', function() {
          const json = testModel.toJSON({visible: ['firstName']});
          deepEqual(json, {firstName: 'Joe'});
        });

        it('allows overriding the model\'s "visible" property with a "options.visible" argument', function() {
          testModel.visible = ['lastName'];
          const json = testModel.toJSON({visible: ['firstName']});
          deepEqual(json, {firstName: 'Joe'});
        });
      });

      describe('with "hidden" option', function() {
        it('hides the fields specified in the model\'s "hidden" property', function() {
          testModel.hidden = ['firstName'];
          deepEqual(testModel.toJSON(), {id: 1, lastName: 'Shmoe', address: '123 Main St.'});
        });

        it('hides the fields specified in the "options.hidden" property', function() {
          const json = testModel.toJSON({hidden: ['firstName', 'id']});
          deepEqual(json, {lastName: 'Shmoe', address: '123 Main St.'});
        });

        it('prioritizes "hidden" if there are conflicts when using both "hidden" and "visible"', function() {
          testModel.visible = ['firstName', 'lastName'];
          testModel.hidden = ['lastName'];
          deepEqual(testModel.toJSON(), {firstName: 'Joe'});
        });

        it('prioritizes "options.hidden" if there are conflicts when using both "options.hidden" and "options.visible"', function() {
          const json = testModel.toJSON({visible: ['firstName', 'lastName'], hidden: ['lastName']});
          deepEqual(json, {firstName: 'Joe'});
        });

        it('allows overriding the model\'s "hidden" property with a "options.hidden" argument', function() {
          testModel.hidden = ['lastName'];
          const json = testModel.toJSON({hidden: ['firstName', 'id']});
          deepEqual(json, {lastName: 'Shmoe', address: '123 Main St.'});
        });

        it('prioritizes "options.hidden" when overriding both the model\'s "hidden" and "visible" properties with "options.hidden" and "options.visible" arguments', function() {
          testModel.visible = ['lastName', 'address'];
          testModel.hidden = ['address'];
          const json = testModel.toJSON({visible: ['firstName', 'lastName'], hidden: ['lastName']});

          deepEqual(json, {firstName: 'Joe'});
        });
      });

      it('ignores the model\'s "hidden" and "visible" properties with the "options.visibility" argument', function() {
        testModel.visible = ['firstName', 'lastName'];
        testModel.hidden = ['lastName'];
        const json = testModel.toJSON({visibility: false});

        deepEqual(json, {id: 1, firstName: 'Joe', lastName: 'Shmoe', address: '123 Main St.'});
      });
      describe('with JSON.stringify', function() {
        it('serializes correctly', function() {
          testModel.visible = ['firstName'];

          deepEqual(JSON.stringify(testModel), '{"firstName":"Joe"}');
        });

        it('serializes correctly when placed as object property', function() {
          testModel.visible = ['firstName'];
          var obj = {
            model: testModel
          };
          deepEqual(JSON.stringify(obj), '{"model":{"firstName":"Joe"}}');
        });

        it('serializes correctly when placed in an array', function() {
          testModel.visible = ['firstName'];
          var arr = [testModel];
          deepEqual(JSON.stringify(arr), '[{"firstName":"Joe"}]');
        });
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
