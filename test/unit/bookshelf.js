const assert = require('assert');
var sinon = require('sinon');
const Knex = require('knex');

module.exports = function() {
  describe('Bookshelf', function() {
    let Bookshelf;
    let bookshelf;

    before(() => {
      Bookshelf = require('../../lib/bookshelf');
      bookshelf = Bookshelf(Knex({client: 'sqlite3', useNullAsDefault: true}));
    });

    after(() => {
      return bookshelf.knex.destroy();
    });

    describe('Construction', function() {
      it('should fail without a knex instance', function() {
        assert.throws(() => Bookshelf(), /Invalid knex/);
      });

      it('should fail if passing a random object', function() {
        assert.throws(() => Bookshelf({config: 'something', options: ['one', 'two']}), /Invalid knex/);
      });
    });

    describe('Collection and Model registry with relations', function() {
      let TestModel;
      let TestCollection;
      let ModelWithRelations;
      let modelWithRelations;

      before(() => {
        TestModel = bookshelf.Model.extend({tableName: 'related'});
        TestCollection = bookshelf.Collection.extend();

        bookshelf.model('TestModel', TestModel);
        bookshelf.collection('TestCollection', TestCollection);

        ModelWithRelations = bookshelf.Model.extend({
          testHasOne: function() {
            return this.hasOne('TestModel');
          },
          testHasMany: function() {
            return this.hasMany('TestCollection');
          },
          testMorphTo: function() {
            return this.morphTo('morphable', ['relType', 'relId'], 'TestModel', ['TestModel', 'relValue']);
          },
          testNotResolved: function() {
            return this.hasOne('NonexistentModel');
          },
          testThrough: function() {
            return this.hasMany('TestCollection').through('TestModel');
          }
        });

        modelWithRelations = new ModelWithRelations();
      });

      it('can access registered models through collection methods', function() {
        assert.deepStrictEqual(modelWithRelations.testHasOne().relatedData.target, TestModel);
      });

      it('can access registered collections through collection methods', function() {
        assert.deepStrictEqual(modelWithRelations.testHasMany().relatedData.target, TestCollection);
      });

      it('passes the registered model name to the relation method', function() {
        const relationSpy = sinon.spy(bookshelf.Model.prototype, '_relation');
        modelWithRelations.testHasOne();
        relationSpy.restore();

        sinon.assert.calledWith(relationSpy, 'hasOne', 'TestModel');
      });

      it('throws a ModelNotResolved error for nonexistent relations', function() {
        assert.throws(() => modelWithRelations.testNotResolved(), {
          message: 'The model NonexistentModel could not be resolved from the registry.'
        });
      });

      it('can be used in through() relations', function() {
        const relation = modelWithRelations.testThrough();
        assert.strictEqual(relation.relatedData.throughTableName, 'related');
      });

      it('can be used in morphTo() relations', function() {
        const Model = require('../../lib/model');
        const morphToSpy = sinon.spy(Model.prototype, 'morphTo');

        try {
          // Wrap in a try/catch because Bookshelf actually evaluates morph targets and we don't care that the target is
          // not a valid morph model
          modelWithRelations.testMorphTo();
          morphToSpy.restore();
        } catch (error) {
          if (error.message !== 'The target polymorphic type "undefined" is not one of the defined target types') {
            throw error;
          }

          assert.strictEqual(
            morphToSpy.calledWith('morphable', ['relType', 'relId'], TestModel, [TestModel, 'relValue']),
            true
          );
        }
      });
    });

    describe('.VERSION', function() {
      it('should equal version number in package.json', function() {
        const p = require('../../package');
        assert.strictEqual(bookshelf.VERSION, p.version);
      });
    });

    describe('.collection()', function() {
      let TestCollection;

      before(() => {
        TestCollection = bookshelf.Collection.extend({property: 'something'});
      });

      beforeEach(function() {
        bookshelf.registry.collections = {};
      });

      it('registers a collection', function() {
        const RegisteredCollection = bookshelf.collection('TestCollection', TestCollection);
        assert.deepStrictEqual(RegisteredCollection, TestCollection);
      });

      it('returns a previously registered collection if passing a string', function() {
        const RegisteredCollection = bookshelf.collection('TestCollection', TestCollection);
        assert.deepStrictEqual(bookshelf.collection('TestCollection'), RegisteredCollection);
      });

      it('preserves instance properties', function() {
        bookshelf.collection('TestCollection', TestCollection);
        assert.strictEqual(bookshelf.collection('TestCollection').prototype.property, 'something');
      });

      it('returns undefined if the specified collection is not found', function() {
        assert.strictEqual(bookshelf.collection('DoesNotExist'), undefined);
      });

      it('throws when trying to register an already registered collection name', function() {
        bookshelf.collection('TestCollection', TestCollection);
        assert.throws(() => bookshelf.collection('TestCollection', TestCollection));
      });
    });

    describe('.model()', function() {
      let TestModel;

      before(() => {
        TestModel = bookshelf.Model.extend({tableName: 'records'}, {custom: 'something'});
      });

      beforeEach(function() {
        bookshelf.registry.models = {};
      });

      it('registers a model', function() {
        const RegisteredModel = bookshelf.model('TestModel', TestModel);
        assert.deepStrictEqual(RegisteredModel, TestModel);
      });

      it('returns a previously registered model if passing a string', function() {
        const RegisteredModel = bookshelf.model('TestModel', TestModel);
        assert.deepStrictEqual(bookshelf.model('TestModel'), RegisteredModel);
      });

      it('preserves instance properties', function() {
        bookshelf.model('TestModel', TestModel);
        assert.strictEqual(bookshelf.model('TestModel').prototype.tableName, 'records');
      });

      it('preserves class properties', function() {
        bookshelf.model('TestModel', TestModel);
        assert.strictEqual(bookshelf.model('TestModel').custom, 'something');
      });

      it('throws when trying to register an already registered model name', function() {
        bookshelf.model('TestModel', TestModel);
        assert.throws(() => bookshelf.model('TestModel', TestModel));
      });

      it('returns undefined if the specified model is not found', function() {
        assert.strictEqual(bookshelf.model('DoesNotExist'), undefined);
      });
    });

    describe('.resolve()', function() {
      let ModelOne;
      let ModelTwo;

      before(() => {
        ModelOne = bookshelf.Model.extend({});
        ModelTwo = bookshelf.Model.extend({});
        bookshelf.resolve = (name) => {
          if (name === 'One') return ModelOne;
          if (name === 'Two') return ModelTwo;
        };
      });

      it('can be used to resolve models with a custom function', function() {
        assert.deepStrictEqual(bookshelf.model('One'), ModelOne);
        assert.deepStrictEqual(bookshelf.model('Two'), ModelTwo);
      });

      it('returns undefined if no model is resolved', function() {
        assert.strictEqual(bookshelf.model('Three'), undefined);
      });
    });
  });
};
