var expect = require('chai').expect;
var sinon  = require('sinon');

module.exports = function(Bookshelf) {

	describe('Model Registry', function() {

		before(function() {
			this._relation = sinon.spy(Bookshelf.Model.prototype, '_relation');
			this.morphTo = sinon.spy(Bookshelf.Model.prototype, 'morphTo');
		});

		after(function() {
			this._relation.restore();
			this.morphTo.restore();
		});

		beforeEach(function () {
			this._relation.reset();
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
				this.ModelObj = Bookshelf.model('Model', this.Model);
			});

			it('returns the registered model', function() {
				expect(this.ModelObj).to.equal(this.Model);
			});

			it('assigns the model the name', function() {
				expect(Bookshelf.model('Model')).to.equal(this.Model);
			});

			it('assigns the tableName', function() {
				expect(Bookshelf.model('Model').prototype.tableName).to.equal('records');
			});

			it('throws when there is a name conflict', function() {
				expect(Bookshelf.model.bind(Bookshelf, 'Model', Bookshelf.Model)).to.throw();
			});

		});

		describe('Registering Models with plain object', function() {
			var noop = function() {};

			beforeEach(function() {
				Bookshelf._models = {};
				this.Model = Bookshelf.model('Model', {
					tableName: 'records'
				}, {
					noop: noop
				});
			});

			it('assigns the model the name', function() {
				expect(Bookshelf.model('Model')).to.equal(this.Model);
			});

			it('assigns the tableName', function() {
				expect(Bookshelf.model('Model').prototype.tableName).to.equal('records');
			});

			it('assigns static props', function() {
				expect(Bookshelf.model('Model').noop).to.equal(noop);
			});

			it('throws when there is a name conflict', function() {
				expect(Bookshelf.model.bind(Bookshelf, 'Model', Bookshelf.Model)).to.throw();
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
				expect(this.collection).to.equal(this.Collection);
			});

			it('gives the collection a name', function() {
				expect(Bookshelf.collection('Collection')).to.equal(this.Collection);
			});

			it('throws when there is a name conflict', function() {
				expect(Bookshelf.collection.bind(Bookshelf, 'Collection', Bookshelf.Collection)).to.throw();
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

			afterEach(function () {
				delete Bookshelf._models;
				delete Bookshelf._collections;
			});

			it('resolves a string name to a model', function() {
				expect(this.model._hasOne().relatedData.target).to.equal(this.relatedModel);
			});

			it('falls back to a collection if no model is found', function() {
				expect(this.model._hasMany().relatedData.target).to.equal(this.relatedCollection);
			});

			it('can still accept a model constructor', function() {
				expect(this.model._normalHasOne().relatedData.target).to.equal(this.relatedModel);
			});

			it('applies the resolved model to the original method', function() {
				this.model._hasOne();
				expect(this._relation).to.have.been.calledWith('hasOne', this.relatedModel);
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
						expect(this.morphTo).to.have.been.calledWith('morphable', this.relatedModel, this.relatedModel);
					}
				});

			});

		});

		describe('bookshelf.resolve', function() {
			
			it('resolves the path to a model with a custom function', function() {
				var one = Bookshelf.Model.extend({});
				var two = Bookshelf.Model.extend({});
				Bookshelf.resolve = function(name) {
					return (name === 'one' ? one : name === 'two' ? two : void 0);
				};
				expect(Bookshelf.model('one')).to.equal(one);
				expect(Bookshelf.model('two')).to.equal(two);
				expect(Bookshelf.model('three')).to.equal(void 0);
			});

		});

	});
};
