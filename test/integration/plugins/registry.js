var assert = require('assert'),
    equal  = assert.equal,
    _      = require('lodash'),
    sinon  = require('sinon');

module.exports = function(Bookshelf) {

	describe('Model Registry', function() {

		before(function() {
			this.hasOne = sinon.spy(Bookshelf.Model.prototype, 'hasOne');
			this.morphTo = sinon.spy(Bookshelf.Model.prototype, 'morphTo');
		});

		after(function() {
			this.hasOne.restore();
			this.morphTo.restore();
		});

		beforeEach(function() {
			this.hasOne.reset();
			this.morphTo.reset();
		});

		before(function() {
			Bookshelf.plugin('registry');
		});

		describe('Registering Models', function() {

			beforeEach(function() {
				Bookshelf._models = {};
				this.Model = Bookshelf.Model.extend({
					tableName: 'records'
				});
				this.model = Bookshelf.model('Model', this.Model);
			});

			it('returns the registered model', function() {
				equal(this.model, this.Model);
			});

			it('assigns the model the name', function() {
				equal(Bookshelf.model('Model'), this.Model);
			});

			it('overwrites when there is a name conflict', function() {
				Bookshelf.model('Model', Bookshelf.Model);
				equal(Bookshelf.model('Model'), Bookshelf.Model);
			});

		});

		describe('Registering Collections', function() {

			beforeEach(function() {
				Bookshelf._collections = {};
				this.Collection = Bookshelf.Collection.extend({
					property: {}
				});
				this.collection = Bookshelf.collection('Collection', this.Collection);
			});

			it('returns the registered collection', function() {
				equal(this.collection, this.Collection);
			});

			it('gives the collection a name', function() {
				equal(Bookshelf.collection('Collection'), this.Collection);
			});

			it('overwrites the collection when there is a name conflict', function() {
				Bookshelf.collection('Collection', Bookshelf.Collection);
				equal(Bookshelf.collection('Collection'), Bookshelf.Collection);
			});

		});

		describe('Custom Relations', function() {

			beforeEach(function() {
				var related = this.relatedModel = Bookshelf.model('Related', Bookshelf.Model.extend({
					tableName: 'related'
				}));
				this.relatedCollection = Bookshelf.collection('CRelated', Bookshelf.Collection.extend({
					property: {}
				}));
				var Model = Bookshelf.Model.extend({
					_hasOne: function() {
						return this.hasOne('Related');
					},
					_normalHasOne: function() {
						return this.hasOne(related);
					},
					_hasMany: function() {
						return this.hasMany('CRelated');
					},
					_morphTo: function() {
						return this.morphTo('morphable', 'Related', 'Related');
					},
					throughTest: function() {
						return this.hasMany('CRelated').through('Related');
					}
				});
				this.model = new Model();
			});

			it('resolves a string name to a model', function() {
				equal(this.model._hasOne().relatedData.target, this.relatedModel);
			});

			it('falls back to a collection if no model is found', function() {
				equal(this.model._hasMany().relatedData.target, this.relatedCollection);
			});

			it('can still accept a model constructor', function() {
				equal(this.model._normalHasOne().relatedData.target, this.relatedModel);
			});

			it('applies the resolved model to the original method', function() {
				this.model._hasOne();
				sinon.assert.calledWith(this.hasOne, this.relatedModel);
			});

			it('allows for *-through relations', function() {
				var relation = this.model.throughTest();
				expect(relation.relatedData.throughTableName).to.equal('related');
			});

			describe('morphTo', function() {

				it('resolves all arguments', function() {
					// Wrap in a try/catch because Bookshelf actually
					// evalautes morph targets and we don't care that the
					// target is not a valid morph model

					try {
						this.model._morphTo();
					} catch (e) {
						sinon.assert.calledWith(this.morphTo, 'morphable', this.relatedModel, this.relatedModel);
					}
				});

			});

		});
	});
};