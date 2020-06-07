var _ = require('lodash');
var uuid = require('uuid');
var Promise = require('bluebird');
var assert = require('assert');
var equal = assert.strictEqual;
var deepEqual = assert.deepEqual;
var helpers = require('./helpers');
var QueryBuilder = require('knex/lib/query/builder');

module.exports = function(bookshelf) {
  describe('Model', function() {
    var Models = require('./helpers/objects')(bookshelf).Models;
    var stubSync = {
      first: function() {
        return Promise.resolve({});
      },
      select: function() {
        return Promise.resolve({});
      },
      insert: function() {
        return Promise.resolve({});
      },
      update: function() {
        return Promise.resolve(1);
      },
      del: function() {
        return Promise.resolve({});
      }
    };
    var dialect = bookshelf.knex.client.dialect;
    var formatNumber = helpers.formatNumber(dialect);
    var countTestAuthors = helpers.countModels(Models.TestAuthor, {
      withSchema: 'test'
    });
    var checkCount = function(actual, expected) {
      expect(actual, formatNumber(expected));
    };

    describe('Events', function() {
      describe('creating', function() {
        it('contains all the attributes set on the model as the second argument', function() {
          var admin = new Models.Admin({username: 'bob'});

          admin.on('creating', function(model, attributes) {
            expect(attributes).to.include({username: 'bob', password: 'supersecret'});
          });

          return admin.save({password: 'supersecret'});
        });
      });

      describe('updating', function() {
        it('contains all the attributes set on the model as the second argument', function() {
          var admin = new Models.Admin({username: 'bob'});

          admin.on('updating', function(model, attributes) {
            expect(attributes).to.include({username: 'bob', password: 'supersecret'});
          });

          return admin.save().then(() => {
            admin.set({username: 'bob'});
            return admin.save({password: 'supersecret'});
          });
        });

        it('contains only the attributes passed to save() as the second argument if using the patch: true option', function() {
          var admin = new Models.Admin();

          admin.on('updating', function(model, attributes) {
            expect(attributes)
              .to.include({password: 'supersecret'})
              .but.not.include({username: 'bob'});
          });

          return admin.save().then(() => {
            admin.set({username: 'bob'});
            return admin.save({password: 'supersecret'}, {patch: true});
          });
        });
      });

      describe('fetching:collection', function() {
        it('passes the collection as first argument to the listener', function() {
          var site = new Models.Site();

          site.on('fetching:collection', function(collection) {
            expect(collection).to.be.an.instanceof(bookshelf.Collection);
            expect(collection.model).to.eql(Models.Site);
          });

          return site.fetchAll();
        });

        it('passes the column definitions to fetch as second argument to the listener', function() {
          var site = new Models.Site();

          site.on('fetching:collection', function(collection, columns) {
            expect(columns).to.be.an.instanceof(Array);
            expect(columns.length).to.be.above(0);
          });

          return site.fetchAll();
        });

        it('passes options as third argument to the listener', function() {
          var site = new Models.Site();

          site.on('fetching:collection', function(collection, columns, options) {
            expect(options).to.be.an.instanceof(Object);
            expect(options).to.have.property('query');
          });

          return site.fetchAll();
        });
      });

      describe('fetched:collection', function() {
        it('passes the collection as first argument to the listener', function() {
          var site = new Models.Site();

          site.on('fetched:collection', function(collection) {
            expect(collection).to.be.an.instanceof(bookshelf.Collection);
            expect(collection.model).to.eql(Models.Site);
          });

          return site.fetchAll();
        });

        it('passes the fetched columns as second argument to the listener', function() {
          var site = new Models.Site();

          site.on('fetched:collection', function(collection, columns) {
            expect(columns).to.be.an.instanceof(Array);
            expect(columns.length).to.be.above(0);
          });

          return site.fetchAll();
        });

        it('passes options as third argument to the listener', function() {
          var site = new Models.Site();

          site.on('fetching:collection', function(collection, columns, options) {
            expect(options).to.be.an.instanceof(Object);
            expect(options).to.have.property('query');
          });

          return site.fetchAll();
        });
      });
    });

    describe('extend/constructor/initialize', function() {
      var User = bookshelf.Model.extend(
        {
          idAttribute: 'user_id',
          getData: function() {
            return 'test';
          }
        },
        {
          classMethod: function() {
            return 'test';
          }
        }
      );

      var SubUser = User.extend(
        {
          otherMethod: function() {
            return this.getData();
          }
        },
        {
          classMethod2: function() {
            return 'test2';
          }
        }
      );

      var OtherUser = bookshelf.Model.extend(
        {
          idAttribute: 'user_id',
          getData: function() {
            return 'test';
          }
        },
        {
          classMethod: function() {
            return 'test';
          }
        }
      );

      it('can be extended', function() {
        var user = new User({name: 'hoge'});
        var subUser = new SubUser();

        expect(user.idAttribute).to.equal('user_id');
        expect(user.getData()).to.equal('test');
        expect(subUser.otherMethod()).to.equal('test');
        expect(User.classMethod()).to.equal('test');
        expect(SubUser.classMethod()).to.equal('test');
        expect(SubUser.classMethod2()).to.equal('test2');
      });

      it('accepts a custom `constructor` property', function() {
        var User = bookshelf.Model.extend({
          constructor: function() {
            this.item = 'test';
            bookshelf.Model.apply(this, arguments);
          }
        });

        equal(new User().item, 'test');
      });

      it('initializes an empty object for storing changed attributes', function() {
        equal(User.prototype.changed, undefined);
        deepEqual(new User().changed, {});
      });

      context('should have own errors: name of', function() {
        it('NotFoundError', function() {
          var err = new User.NotFoundError();
          var suberr = new SubUser.NotFoundError();

          expect(User.NotFoundError).to.not.be.eql(bookshelf.Model.NotFoundError);
          expect(err).to.be.an.instanceof(bookshelf.Model.NotFoundError);
          expect(User.NotFoundError).to.not.be.eql(SubUser.NotFoundError);
          expect(err).to.not.be.an.instanceof(SubUser.NotFoundError);
          expect(suberr).to.be.an.instanceof(User.NotFoundError);
          expect(User.NotFoundError).to.not.be.eql(OtherUser.NotFoundError);
          expect(err).to.not.be.an.instanceof(OtherUser.NotFoundError);
        });

        it('NoRowsUpdatedError', function() {
          var err = new User.NoRowsUpdatedError();
          var suberr = new SubUser.NoRowsUpdatedError();

          expect(User.NoRowsUpdatedError).to.not.be.eql(bookshelf.Model.NoRowsUpdatedError);
          expect(err).to.be.an.instanceof(bookshelf.Model.NoRowsUpdatedError);
          expect(User.NoRowsUpdatedError).to.not.be.eql(SubUser.NoRowsUpdatedError);
          expect(err).to.not.be.an.instanceof(SubUser.NoRowsUpdatedError);
          expect(suberr).to.be.an.instanceof(User.NoRowsUpdatedError);
          expect(User.NoRowsUpdatedError).to.not.be.eql(OtherUser.NoRowsUpdatedError);
          expect(err).to.not.be.an.instanceof(OtherUser.NoRowsUpdatedError);
        });

        it('NoRowsDeletedError', function() {
          var err = new User.NoRowsDeletedError();
          var suberr = new SubUser.NoRowsDeletedError();

          expect(User.NoRowsDeletedError).to.not.be.eql(bookshelf.Model.NoRowsDeletedError);
          expect(err).to.be.an.instanceof(bookshelf.Model.NoRowsDeletedError);
          expect(User.NoRowsDeletedError).to.not.be.eql(SubUser.NoRowsDeletedError);
          expect(err).to.not.be.an.instanceof(SubUser.NoRowsDeletedError);
          expect(suberr).to.be.an.instanceof(User.NoRowsDeletedError);
          expect(User.NoRowsDeletedError).to.not.be.eql(OtherUser.NoRowsDeletedError);
          expect(err).to.not.be.an.instanceof(OtherUser.NoRowsDeletedError);
        });
      });
    });

    describe('forge', function() {
      it('should create a new model instance', function() {
        var User = bookshelf.Model.extend({
          tableName: 'users'
        });
        var user = User.forge();

        equal(user.tableName, 'users');
        expect(user).to.be.an.instanceof(User);
      });
    });

    describe('#id, #idAttribute', function() {
      it('should attach the id as a property on the model', function() {
        var test = new bookshelf.Model({id: 1});
        equal(test.id, 1);
      });

      it('should reference idAttribute as the key for model.id', function() {
        var Test = bookshelf.Model.extend({
          idAttribute: '_id'
        });
        var test = new Test({_id: 2});

        equal(test.id, 2);
      });

      it('#id should be set when model has custom parse method', function() {
        var TestModel = bookshelf.Model.extend({
          idAttribute: 'test_id',
          parse: function(attrs) {
            return _.mapKeys(attrs, function(val, key) {
              return _.camelCase(key);
            });
          }
        });
        var test = new TestModel({test_id: 2}, {parse: true});

        equal(test.id, 2);
      });
    });

    describe('#requireFetch', function() {
      const FalseAuthor = Models.Author.extend({requireFetch: false});

      describe('with #fetch()', function() {
        it('resolves to null if no record exists and the {require: false} model option is set', function() {
          return new FalseAuthor({id: 200}).fetch().then((model) => {
            equal(model, null);
          });
        });

        it('allows overriding the model level {require: false} option', function() {
          return new FalseAuthor({id: 200})
            .fetch({require: true})
            .then((model) => {
              assert.fail('Expected the promise to be rejected but it resolved');
            })
            .catch((error) => {
              equal(error instanceof FalseAuthor.NotFoundError, true);
              equal(error.message, 'EmptyResponse');
            });
        });

        it('rejects with NotFoundError by default', function() {
          return new Models.Author({id: 200})
            .fetch()
            .then((model) => {
              assert.fail('Expected the promise to be rejected but it resolved');
            })
            .catch((error) => {
              equal(error instanceof Models.Author.NotFoundError, true);
              equal(error.message, 'EmptyResponse');
            });
        });

        it('allows overriding the default Model level option', function() {
          return new FalseAuthor({id: 200}).fetch({require: false}).then((model) => {
            equal(model, null);
          });
        });
      });

      describe('with #fetchAll()', function() {
        it('resolves to null if no record exists and the {require: false} model option is set', function() {
          return new FalseAuthor()
            .where({id: 200})
            .fetchAll()
            .then((models) => {
              equal(models.length, 0);
            });
        });

        it('is not affected by the model level {require: true} option', function() {
          return new Models.Author()
            .where({id: 200})
            .fetchAll()
            .then((models) => {
              equal(models.length, 0);
            });
        });
      });
    });

    describe('query', function() {
      var model;

      beforeEach(function() {
        model = new bookshelf.Model();
      });

      it('returns the Knex builder when no arguments are passed', function() {
        equal(model.query() instanceof QueryBuilder, true);
      });

      it('calls Knex builder method with the first argument, returning the model', function() {
        var q = model.query('where', {id: 1});
        equal(q, model);
      });

      it('passes along additional arguments to the Knex method in the first argument', function() {
        var qb = model.resetQuery().query();
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 0);

        var q = model.query('where', {id: 1});
        equal(q, model);
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 1);
      });

      it('allows passing an object to query', function() {
        var qb = model.resetQuery().query();
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 0);

        var q = model.query({where: {id: 1}, orWhere: ['id', '>', '10']});
        equal(q, model);
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 2);
      });

      it('allows passing a function to query', function() {
        var qb = model.resetQuery().query();
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 0);

        var q = model.query(function(qb) {
          this.where({id: 1}).orWhere('id', '>', '10');
        });

        equal(q, model);
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 2);
      });
    });

    describe('tableName', function() {
      var table;

      beforeEach(function() {
        table = new bookshelf.Model({}, {tableName: 'customers'});
      });

      it('can be passed in the initialize options', function() {
        equal(table.tableName, 'customers');
      });

      it('should set the tableName for the query builder', function() {
        equal(table.query()._single.table, 'customers');
      });
    });

    describe('parse', function() {
      var ParsedSite = Models.Site.extend({
        parse: function(attrs) {
          attrs.name = 'Test: ' + attrs.name;
          return attrs;
        }
      });

      it('parses the model attributes on fetch', function() {
        return new ParsedSite({id: 1}).fetch().then(function(model) {
          equal(model.get('name').indexOf('Test: '), 0);
        });
      });

      it("doesn't parse the model attributes on creation", function() {
        var site = new ParsedSite({name: 'Site'});
        equal(site.get('name'), 'Site');
      });

      it('parses the model attributes on creation if {parse: true} is passed', function() {
        var site = new ParsedSite({name: 'Site'}, {parse: true});
        equal(site.get('name'), 'Test: Site');
      });
    });

    describe('format', function() {
      // TODO: better way to test this.
      it('calls format when saving', function() {
        var M = bookshelf.Model.extend({
          tableName: 'test',
          format: function(attrs) {
            return _.reduce(
              attrs,
              function(memo, val, key) {
                memo[_.snakeCase(key)] = val;
                return memo;
              },
              {}
            );
          }
        });

        var m = new M({firstName: 'Tim', lastName: 'G'});
        m.sync = function() {
          var data = this.format(_.extend({}, this.attributes));
          equal(data.first_name, 'Tim');
          equal(data.last_name, 'G');
          return stubSync;
        };

        return m.save();
      });

      it('does not mutate attributes on format', function() {
        var M = bookshelf.Model.extend({
          tableName: 'sites',
          format: function(attrs) {
            assert.ok(attrs !== this.attributes);
            return attrs;
          }
        });

        return M.forge({id: 1})
          .fetch()
          .call('load');
      });
    });

    describe('refresh', function() {
      var Site = Models.Site;

      it('will fetch a record by present attributes without an ID attribute', function() {
        return Site.forge({name: 'knexjs.org'})
          .refresh()
          .then(function(model) {
            expect(model.id).to.equal(1);
          });
      });

      it("will update a model's attributes by fetching only by `idAttribute`", function() {
        return Site.forge({id: 1, name: 'NOT THE CORRECT NAME'})
          .refresh()
          .then(function(model) {
            expect(model.get('name')).to.equal('knexjs.org');
          });
      });
    });

    describe('#fetch()', function() {
      var Site = Models.Site;
      var Author = Models.Author;

      it('issues a first (get one) to Knex, triggering a fetched event, returning a promise', function() {
        var count = 0;
        var model = Site.forge({id: 1});
        model.on('fetched', function() {
          count++;
        });

        return model.fetch().then(function(model) {
          equal(model.get('id'), 1);
          equal(model.get('name'), 'knexjs.org');
          equal(count, 1);
        });
      });

      it('has a fetching event, which will fail if an error is thrown or if a rejected promise is provided', function() {
        var model = new Site({id: 1});
        model.on('fetching', function() {
          throw new Error('This failed');
        });

        return model
          .fetch()
          .throw(new Error('Err'))
          .catch(function(err) {
            assert(err.message === 'This failed');
          });
      });

      it('allows access to the query builder on the options object in the fetching event', function() {
        var model = new Site({id: 1});
        model.on('fetching', function(model, columns, options) {
          assert(typeof options.query.whereIn === 'function');
        });

        return model.fetch();
      });

      it('does not fail, when joining another table having some columns with the same names - #176', function() {
        var model = new Site({id: 1});
        model.query(function(qb) {
          qb.join('authors', 'authors.site_id', '=', 'sites.id');
        });

        return model.fetch();
      });

      it('allows specification of select columns as an `options` argument', function() {
        return new Author({id: 1}).fetch({columns: ['first_name']}).then(function(model) {
          deepEqual(model.toJSON(), {id: 1, first_name: 'Tim'});
        });
      });

      it('allows specification of select columns in query callback', function() {
        return new Author({id: 1})
          .query('select', 'first_name')
          .fetch()
          .then(function(model) {
            deepEqual(model.toJSON(), {id: 1, first_name: 'Tim'});
          });
      });

      it('will still select default columns if `distinct` is called without columns - #807', function() {
        return new Author({id: 1})
          .query('distinct')
          .fetch()
          .then(function(model) {
            deepEqual(model.toJSON(), {
              id: 1,
              first_name: 'Tim',
              last_name: 'Griesser',
              site_id: 1
            });
          });
      });

      it('rejects with an error if no record exists', function() {
        return new Author({id: 200})
          .fetch()
          .then((model) => {
            assert.fail('Expected the promise to be rejected but it resolved');
          })
          .catch((error) => {
            equal(error instanceof Author.NotFoundError, true);
            equal(error.message, 'EmptyResponse');
          });
      });

      it('resolves to null if no record exists and the {require: false} option is passed', function() {
        return new Author({id: 200}).fetch({require: false}).then((model) => {
          equal(model, null);
        });
      });

      it('uses the schema name passed in options', function() {
        if (dialect !== 'postgresql') return this.skip();

        return new Models.TestAuthor({id: 1}).fetch({withSchema: 'test'}).then(function(author) {
          expect(author.get('name')).to.eql('Ryan Coogler');
        });
      });

      it('locks the table when called with the forUpdate option during a transaction', function() {
        var newAuthorId;

        return new Models.Author()
          .save({first_name: 'foo', site_id: 1})
          .then(function(author) {
            newAuthorId = author.id;

            return Promise.all([
              bookshelf.transaction(function(t) {
                return new Models.Author({id: author.id})
                  .fetch({transacting: t, lock: 'forUpdate'})
                  .then(function() {
                    return Promise.delay(100);
                  })
                  .then(function() {
                    return new Models.Author({id: author.id}).fetch({
                      transacting: t
                    });
                  })
                  .then(function(author) {
                    expect(author.get('first_name')).to.equal('foo');
                  });
              }),
              Promise.delay(25).then(function() {
                return new Models.Author({id: author.id}).save({
                  first_name: 'changed'
                });
              })
            ]);
          })
          .then(function() {
            return new Models.Author({id: newAuthorId}).destroy();
          });
      });

      it('locks the table when called with the forShare option during a transaction', function() {
        var newAuthorId;

        return new Models.Author()
          .save({first_name: 'foo', site_id: 1})
          .then(function(author) {
            newAuthorId = author.id;

            return Promise.all([
              bookshelf.transaction(function(t) {
                return new Models.Author({id: author.id})
                  .fetch({transacting: t, lock: 'forShare'})
                  .then(function() {
                    return Promise.delay(100);
                  })
                  .then(function() {
                    return new Models.Author({id: author.id}).fetch({
                      transacting: t
                    });
                  })
                  .then(function(author) {
                    expect(author.get('first_name')).to.equal('foo');
                  });
              }),
              Promise.delay(60).then(function() {
                return new Models.Author({id: author.id}).save({
                  first_name: 'changed'
                });
              })
            ]);
          })
          .then(function() {
            return new Models.Author({id: newAuthorId}).destroy();
          });
      });

      it("does not try to format the idAttribute if it's already formatted", function() {
        return new Models.OrgModel({organization_id: 2}).fetch().then((organization) => {
          if (dialect === 'postgresql') {
            expect(organization.attributes).to.deep.equal({
              organization_id: 2,
              id: 2,
              name: 'Duplicates',
              is_active: false
            });
          } else {
            expect(organization.attributes).to.deep.equal({
              organization_id: 2,
              id: 2,
              name: 'Duplicates',
              is_active: 0
            });
          }
        });
      });

      it("formats the idAttribute if it's not already formatted", function() {
        return new Models.OrgModel({id: 2}).fetch().then((organization) => {
          if (dialect === 'postgresql') {
            expect(organization.attributes).to.deep.equal({id: 2, name: 'Duplicates', is_active: false});
          } else {
            expect(organization.attributes).to.deep.equal({id: 2, name: 'Duplicates', is_active: 0});
          }
        });
      });
    });

    describe('#fetchAll()', function() {
      var Site = Models.Site;

      it('triggers `fetching:collection` and `fetched:collection` events', function() {
        var site = new Site();
        var isFetchingTriggered = false;
        var isFetchedTriggered = false;

        site.on('fetching:collection', function() {
          equal(isFetchingTriggered, false);
          equal(isFetchedTriggered, false);
          isFetchingTriggered = true;
        });

        site.on('fetched:collection', function() {
          equal(isFetchingTriggered, true);
          equal(isFetchedTriggered, false);
          isFetchedTriggered = true;
        });

        return site.fetchAll().then(function() {
          equal(isFetchingTriggered, true);
          equal(isFetchedTriggered, true);
        });
      });

      it('should load models with duplicate ids when the merge and remove options are false', function() {
        return new Models.Member().fetchAll({merge: false, remove: false}).then(function(members) {
          expect(members.length).to.equal(3);
          expect(members.pluck('name')).to.include.members(['Alice', 'Bob']);
        });
      });

      it('should merge models with duplicate ids by default', function() {
        return new Models.Member().fetchAll().then(function(members) {
          expect(members.length).to.equal(2);
          expect(members.pluck('name')).to.include.members(['Alice', 'Shuri']);
        });
      });

      it('returns an empty collection if there are no results', function() {
        return new Models.Member()
          .where('name', 'hal9000')
          .fetchAll()
          .then((models) => {
            equal(models.length, 0);
          });
      });
    });

    describe('#fetchPage()', function() {
      it('fetches a single page of results with defaults', function() {
        return Models.Customer.forge()
          .fetchPage()
          .then(function(results) {
            expect(results).to.have.property('models');
            expect(results).to.have.property('pagination');

            ['rowCount', 'pageCount', 'page', 'pageSize'].forEach(function(prop) {
              expect(results.pagination).to.have.property(prop);
            });

            expect(results.pagination.rowCount).to.equal(4);
            expect(results.pagination.pageCount).to.equal(1);
            expect(results.pagination.page).to.equal(1);
            expect(results.pagination.pageSize).to.equal(10);
          });
      });

      it('fetches a single page of results without returning rowCount or pageCount', function() {
        return Models.Customer.forge()
          .fetchPage({disableCount: true})
          .then(function(results) {
            expect(results).to.have.property('models');
            expect(results).to.have.property('pagination');

            expect(results.pagination).to.have.property('page');
            expect(results.pagination).to.have.property('pageSize');
            expect(results.pagination).to.not.have.property('rowCount');
            expect(results.pagination).to.not.have.property('pageCount');

            expect(results.pagination.page).to.equal(1);
            expect(results.pagination.pageSize).to.equal(10);
          });
      });

      it('returns an empty collection if there are no results', function() {
        return bookshelf
          .knex('critics_comments')
          .del()
          .then(() => Models.CriticComment.forge().fetchPage())
          .then((results) => {
            equal(results.length, 0);
          });
      });

      it('returns an empty collection with the {require: false} option if there are no results', function() {
        return bookshelf
          .knex('critics_comments')
          .del()
          .then(function() {
            return Models.CriticComment.forge().fetchPage({require: false});
          })
          .then(function(results) {
            expect(results.length).to.equal(0);
          });
      });

      it('returns the limit and offset instead of page and pageSize', function() {
        return Models.Customer.forge()
          .fetchPage({limit: 2, offset: 2})
          .then(function(results) {
            ['rowCount', 'pageCount', 'limit', 'offset'].forEach(function(prop) {
              expect(results.pagination).to.have.property(prop);
            });
          });
      });

      it('fetches a page of results with specified page size', function() {
        return Models.Customer.forge()
          .fetchPage({pageSize: 2})
          .then(function(results) {
            expect(results.pagination.rowCount).to.equal(4);
            expect(results.pagination.pageCount).to.equal(2);
            expect(results.pagination.page).to.equal(1);
          });
      });

      it('fetches a page with specified offset', function() {
        return Models.Customer.forge()
          .orderBy('id', 'ASC')
          .fetchPage({limit: 2, offset: 2})
          .then(function(results) {
            expect(parseInt(results.models[0].get('id'))).to.equal(3);
            expect(parseInt(results.models[1].get('id'))).to.equal(4);
          });
      });

      it('fetches a page by page number', function() {
        return Models.Customer.forge()
          .orderBy('id', 'ASC')
          .fetchPage({pageSize: 2, page: 2})
          .then(function(results) {
            expect(parseInt(results.models[0].get('id'))).to.equal(3);
            expect(parseInt(results.models[1].get('id'))).to.equal(4);
          });
      });

      it('fetches a page when other columns are specified on the original query', function() {
        return Models.Customer.forge()
          .query(function(qb) {
            qb.column.apply(qb, ['name']);
          })
          .fetchPage()
          .then(function(results) {
            expect(results.pagination.rowCount).to.equal(4);
          });
      });

      it('returns correct values for rowCount and pageCount when hasTimestamps is used', function() {
        return Models.Admin.forge()
          .fetchPage({page: 1, pageSize: 4})
          .then(function(admins) {
            expect(admins.pagination.rowCount).to.be.a('number');
            expect(admins.pagination.pageCount).to.be.a('number');
          });
      });

      describe('inside a transaction', function() {
        it('returns consistent results for rowCount and number of models', function() {
          return bookshelf.transaction(function(t) {
            var options = {transacting: t};

            return Models.Site.forge({name: 'A new site'})
              .save(null, options)
              .then(function() {
                options.pageSize = 25;
                options.page = 1;
                return Models.Site.forge().fetchPage(options);
              })
              .then(function(sites) {
                expect(sites.pagination.rowCount).to.eql(sites.models.length);
              });
          });
        });
      });

      describe('with groupBy', function() {
        it('counts grouped rows instead of total rows', function() {
          var total;

          return Models.Blog.count()
            .then(function(count) {
              total = parseInt(count, 10);

              return Models.Blog.forge()
                .query(function(qb) {
                  qb.max('id');
                  qb.groupBy('site_id');
                  qb.whereNotNull('site_id');
                })
                .fetchPage();
            })
            .then(function(blogs) {
              expect(blogs.pagination.rowCount).to.equal(blogs.length);
              expect(blogs.length).to.be.below(total);
            });
        });

        it('counts grouped rows when using table name qualifier', function() {
          var total;

          return Models.Blog.count()
            .then(function(count) {
              total = parseInt(count, 10);

              return Models.Blog.forge()
                .query(function(qb) {
                  qb.max('id');
                  qb.groupBy('blogs.site_id');
                  qb.whereNotNull('site_id');
                })
                .fetchPage();
            })
            .then(function(blogs) {
              expect(blogs.pagination.rowCount).to.equal(blogs.length);
              expect(blogs.length).to.be.below(total);
            });
        });
      });

      describe('with distinct', function() {
        it('counts distinct occurences of a column instead of total rows', function() {
          var total;

          return Models.Post.count()
            .then(function(count) {
              total = parseInt(count, 10);

              return Models.Post.forge()
                .query(function(qb) {
                  qb.distinct('owner_id');
                })
                .fetchPage();
            })
            .then(function(distinctPostOwners) {
              expect(distinctPostOwners.pagination.rowCount).to.equal(distinctPostOwners.length);
              expect(distinctPostOwners.length).to.be.below(total);
            });
        });
      });

      describe('with fetch options', function() {
        var Site = Models.Site;

        afterEach(function() {
          delete Site.prototype.initialize;
        });

        it('ignores standard options for count query', function() {
          const allOptions = [];

          Site.prototype.initialize = function() {
            this.on('fetching:collection', function(collection, columns, options) {
              allOptions.push(_.omit(options, 'query'));
            });
          };

          var site = new Site();

          return site
            .fetchPage({
              require: true,
              withRelated: ['blogs'],
              columns: 'name'
            })
            .then(function() {
              expect(allOptions.length).equals(2);
              expect(allOptions[1]).not.deep.equals(allOptions[0]);

              const countOptions = allOptions.find(function(option) {
                return !_.has(option, ['require', 'withRelated', 'columns']);
              });
              const fetchOptions = allOptions.find(function(option) {
                return _.has(option, ['require', 'withRelated', 'columns']);
              });

              expect(countOptions).not.to.be.null;
              expect(fetchOptions).not.to.be.null;
            });
        });

        it('keeps custom options for count query', function() {
          const allOptions = [];

          Site.prototype.initialize = function() {
            this.on('fetching:collection', function(collection, columns, options) {
              allOptions.push(_.omit(options, 'query'));
            });
          };

          var site = new Site();

          return site
            .fetchPage({
              withRelated: ['blogs'],
              customOption: true
            })
            .then(function() {
              expect(allOptions.length).equals(2);
              expect(allOptions[1]).not.deep.equals(allOptions[0]);

              const countOptions = allOptions.find(function(option) {
                return !_.has(option, ['withRelated']);
              });
              const fetchOptions = allOptions.find(function(option) {
                return _.has(option, ['withRelated']);
              });

              expect(countOptions).not.to.be.null;
              expect(countOptions.customOption).to.equal(true);
              expect(countOptions.customOption).to.equal(fetchOptions.customOption);
              expect(fetchOptions).not.to.be.null;
              expect(fetchOptions.customOption).to.equal(true);
            });
        });
      });
    });

    describe('.fetchPage()', function() {
      it('fetches a page without having to call .forge() manually', function() {
        return Models.Customer.fetchPage().then(function(results) {
          expect(results).to.have.property('models');
          expect(results).to.have.property('pagination');
        });
      });
    });

    describe('orderBy', function() {
      it('returns results in the correct order', function() {
        var asc = Models.Customer.forge()
          .orderBy('id', 'ASC')
          .fetchAll()
          .then(function(result) {
            return result.toJSON().map(function(row) {
              return row.id;
            });
          });

        var desc = Models.Customer.forge()
          .orderBy('id', 'DESC')
          .fetchAll()
          .then(function(result) {
            return result.toJSON().map(function(row) {
              return row.id;
            });
          });

        return Promise.join(asc, desc).then(function(results) {
          expect(results[0].reverse()).to.eql(results[1]);
        });
      });

      it('returns DESC order results with a minus sign', function() {
        return Models.Customer.forge()
          .orderBy('-id')
          .fetchAll()
          .then(function(results) {
            expect(parseInt(results.models[0].get('id'))).to.equal(4);
          });
      });
    });

    describe('#save()', function() {
      var Site = Models.Site;

      after(() => {
        return Site.forge({id: 6})
          .destroy()
          .catch(() => {});
      });

      it('saves a new object', function() {
        return new Site({name: 'Fourth Site'})
          .save()
          .then(function(m) {
            equal(Number(m.get('id')), 5);
            return new bookshelf.Collection(null, {model: Site}).fetch();
          })
          .then(function(c) {
            equal(c.last().id, 5);
            equal(c.last().get('name'), 'Fourth Site');
            equal(c.length, 5);
          });
      });

      it('saves all attributes that are currently set on the model plus the ones passed as argument', function() {
        const blog = new Models.Blog({name: 'A Cool Blog'});

        return blog
          .save({site_id: 1})
          .then((savedBlog) => {
            expect(savedBlog.attributes).to.include({name: 'A Cool Blog', site_id: 1});
            return blog.fetch();
          })
          .then((fetchedBlog) => {
            expect(fetchedBlog.attributes).to.include({name: 'A Cool Blog', site_id: 1});
          })
          .finally(() => {
            return blog.destroy();
          });
      });

      it('ensure events are triggered sequentially when the handlers do async stuff', function() {
        var m = new Site({name: 'new'});

        m.on('saving', function(model) {
          return new Promise(function(resolve) {
            setTimeout(function() {
              model.set('x', 'y');
              resolve();
            }, 200);
          });
        });

        m.on('saving', function(model) {
          equal(model.get('x'), 'y');
          model.unset('x');
          m.off();
        });

        return m.save(null, {method: 'insert'}).then(function() {
          return m.destroy();
        });
      });

      it('updates an existing object', function() {
        return new Site({id: 5, name: 'Fourth Site Updated'})
          .save()
          .then(function() {
            return new bookshelf.Collection(null, {model: Site}).fetch();
          })
          .then(function(c) {
            equal(c.last().id, 5);
            equal(c.last().get('name'), 'Fourth Site Updated');
            equal(c.length, 5);
          });
      });

      it('allows passing a method to save, to call insert or update explicitly', function() {
        return new Site({id: 6, name: 'Fifth site, explicity created'})
          .save(null, {method: 'insert'})
          .then(function() {
            return Site.fetchAll();
          })
          .then(function(c) {
            equal(c.length, 6);
            equal(c.last().id, 6);
            equal(c.last().get('name'), 'Fifth site, explicity created');
          });
      });

      it('errors if the row was not updated', function() {
        return new Site({id: 200, name: 'This doesnt exist'}).save().then(
          function() {
            throw new Error('This should not succeed');
          },
          function(err) {
            expect(err.message).to.equal('No Rows Updated');
          }
        );
      });

      it('does not error if the row was not updated but require is false', function() {
        return new Site({id: 200, name: 'This doesnt exist'}).save({}, {require: false});
      });

      it('should not error if updated row was not affected', function() {
        return new Site({
          id: 5,
          name: 'Fifth site, explicity created'
        }).save();
      });

      it('does not constrain on the `id` during update unless defined', function() {
        var m = new bookshelf.Model({id: null}).query({
          where: {uuid: 'testing'}
        });
        var query = m.query();
        query.update = function() {
          equal(_.filter(this._statements, {grouping: 'where'}).length, 1);
          return Promise.resolve(1);
        };
        m.refresh = () => Promise.resolve({});

        return m.save(null, {method: 'update'}).then(function() {
          var m2 = new bookshelf.Model({id: 1}).query({
            where: {uuid: 'testing'}
          });
          var query2 = m2.query();
          query2.update = function() {
            equal(_.filter(this._statements, {grouping: 'where'}).length, 2);
            return {};
          };
          m2.refresh = () => Promise.resolve({});

          return m2.save(null, {method: 'update'});
        });
      });

      it('allows {patch: true} as an option for only updating passed data', function() {
        var user = new bookshelf.Model({id: 1, first_name: 'Testing'}, {tableName: 'users'});
        var query = user.query();
        user.refresh = () => Promise.resolve({});

        query.then = function(onFulfilled, onRejected) {
          deepEqual(this._single.update, {bio: 'Short user bio'});
          equal(_.filter(this._statements, {grouping: 'where'}).length, 1);
          return Promise.resolve(1).then(onFulfilled, onRejected);
        };

        return user.save({bio: 'Short user bio'}, {patch: true}).then(function(model) {
          equal(model.id, 1);
          equal(model.get('bio'), 'Short user bio');
          equal(model.get('first_name'), 'Testing');
        });
      });

      it('fires saving and creating and then saves', function() {
        var user = new bookshelf.Model({first_name: 'Testing'}, {tableName: 'users'});
        var events = 0;
        user.sync = function() {
          return _.extend(stubSync, {
            insert: function() {
              equal(events, 2);
              return Promise.resolve({});
            }
          });
        };
        user.on('creating saving updating', function() {
          return Promise.resolve().then(function() {
            return Promise.resolve().then(function() {
              events++;
            });
          });
        });

        return user.save();
      });

      it('fires saving and then creating triggers', function() {
        var user = new bookshelf.Model({first_name: 'Testing'}, {tableName: 'users'});
        var triggered = [];
        user.sync = function() {
          return _.extend(stubSync, {
            insert: function() {
              deepEqual(triggered, ['saving', 'creating']);
              return Promise.resolve({});
            }
          });
        };
        user.on('saving', function() {
          return Promise.resolve().then(function() {
            triggered.push('saving');
          });
        });
        user.on('creating', function() {
          return Promise.resolve().then(function() {
            triggered.push('creating');
          });
        });

        return user.save();
      });

      it('refreshes the model after updating', function() {
        return new Models.Member({id: 1}).save({name: 'Okoye'}).then((member) => {
          deepEqual(member.attributes, {id: 1, name: 'Okoye', organization_id: 1});
        });
      });

      it('refreshes the model after inserting', function() {
        return new Models.Tag({name: 'books'}).save().then((tag) => {
          deepEqual(tag.attributes, {id: 5, name: 'books'});
        });
      });

      it('does not refresh the model if {autoRefresh: false} option is passed', function() {
        return new Models.Member({id: 1}).save({name: 'Okoye'}, {autoRefresh: false}).then((member) => {
          deepEqual(member.attributes, {id: 1, name: 'Okoye'});
        });
      });

      it('does not trigger a "fetched" event after refreshing the model', function() {
        const member = new Models.Member({id: 1});
        let isFetchedTriggered = false;
        member.on('fetched', () => {
          isFetchedTriggered = true;
        });

        return member.save({name: 'Shuri'}).then(() => {
          equal(isFetchedTriggered, false);
        });
      });

      it('rejects if the saving event throws an error', function() {
        var Test = bookshelf.Model.extend({
          tableName: 'test',
          initialize: function() {
            this.on('saving', this.handler, this);
          },
          handler: function() {
            throw new Error('Test');
          }
        });
        var test = new Test();

        return test.save().catch(function(e) {
          expect(e.message).to.equal('Test');
        });
      });

      it('Allows setting a uuid, #24 #130', function() {
        var uuidval = uuid.v4();
        var SubSite = Models.Uuid.extend({
          initialize: function() {
            this.on('saving', this._generateId);
          },
          _generateId: function(model, attrs, options) {
            if (model.isNew()) {
              model.set(model.idAttribute, uuidval);
            }
          }
        });
        var subsite = new SubSite({name: 'testing'});

        return subsite
          .save()
          .then(function(model) {
            expect(model.id).to.equal(uuidval);
            expect(model.get('name')).to.equal('testing');
          })
          .then(function() {
            return new SubSite({uuid: uuidval}).fetch();
          })
          .then(function(model) {
            expect(model.get('name')).to.equal('testing');
          });
      });

      it('passes custom `options` passed to `timestamp()` - #881', function() {
        function stubTimestamp(options) {
          expect(options.customOption).to.equal(testOptions.customOption);
        }
        var site = Models.Site.forge({id: 881}, {hasTimestamps: true});
        var testOptions = {method: 'insert', customOption: 'CUSTOM_OPTION'};
        site.timestamp = stubTimestamp;

        return site.save(null, testOptions).call('destroy');
      });

      it('will not break with prefixed id, #583', function() {
        var acmeOrg = new Models.OrgModel({
          name: 'ACME, Inc',
          is_active: true
        });
        var acmeOrg1;

        return acmeOrg
          .save()
          .then(function() {
            acmeOrg1 = new Models.OrgModel({name: 'ACME, Inc'});
            return acmeOrg1.fetch();
          })
          .then(function() {
            equal(typeof acmeOrg1.get('id'), 'number');
            equal(acmeOrg1.attributes.name, 'ACME, Inc');
            equal(acmeOrg1.attributes.organization_id, undefined);
            equal(acmeOrg1.attributes.organization_name, undefined);
            expect(acmeOrg.attributes.name).to.equal('ACME, Inc');
          });
      });
    });

    describe('destroy', function() {
      var Site = Models.Site;

      it('issues a delete to the Knex, returning a promise', function() {
        return new Site({id: 5})
          .destroy()
          .then(function() {
            return new bookshelf.Collection(null, {model: Site}).fetch();
          })
          .then(function(c) {
            equal(c.length, 4);
          });
      });

      it('fails if no idAttribute or wheres are defined on the model', function() {
        return new Site().destroy().then(null, function(e) {
          equal(e.toString(), 'Error: A model cannot be destroyed without a "where" clause or an idAttribute.');
        });
      });

      it('triggers a destroying event on the model', function(ok) {
        var m = new Site({id: 4});
        m.on('destroying', function() {
          m.off();
          ok();
        });

        m.destroy();
      });

      it('will not destroy the model if an error is thrown during the destroying event', function() {
        var m = new Site({id: 1});
        m.on('destroying', function(model) {
          if (model.id === 1) {
            throw new Error('You cannot destroy the first site');
          }
        });

        return m.destroy().then(null, function(e) {
          equal(e.toString(), 'Error: You cannot destroy the first site');
        });
      });

      it('allows access to the query builder on the options object in the destroying event', function() {
        var m = new Site({id: 1});
        m.sync = function() {
          var sync = stubSync;
          sync.query = m.query();
          return sync;
        };
        m.on('destroying', function(model, options) {
          assert(typeof options.query.whereIn === 'function');
        });

        return m.destroy();
      });

      it('will throw an error when trying to destroy a non-existent object', function() {
        return new Site({id: 1337})
          .destroy()
          .then(function() {
            throw new Error('Should not have succeeded');
          })
          .catch(function(error) {
            assert(error instanceof bookshelf.NoRowsDeletedError);
          });
      });

      it('will not throw an error when trying to destroy a non-existent object with {require: false}', function() {
        return new Site({id: 1337}).destroy({require: false}).then(function(site) {
          assert(site instanceof Site);
        });
      });

      it('can destroy from the correct schema', function() {
        if (dialect !== 'postgresql') return this.skip();

        var initialCount;

        return countTestAuthors()
          .then(function(count) {
            initialCount = count;
            return new Models.TestAuthor({id: 1}).destroy({
              withSchema: 'test'
            });
          })
          .then(function(author) {
            expect(author.get('name')).to.be.undefined;
            return countTestAuthors();
          })
          .then(function(count) {
            expect(count).to.be.below(initialCount);
          });
      });
    });

    describe('count', function() {
      it('counts the number of models in a collection', function() {
        return Models.Post.forge()
          .count()
          .then(function(count) {
            checkCount(count, 5);
          });
      });

      it('optionally counts by column (excluding null values)', function() {
        var author = Models.Author.forge();
        return author
          .count()
          .then(function(count) {
            checkCount(count, 5);
            return author.count('last_name');
          })
          .then(function(count) {
            checkCount(count, 4);
          });
      });

      it('counts a filtered query', function() {
        return Models.Post.forge()
          .query('where', 'blog_id', 1)
          .count()
          .then(function(count) {
            checkCount(count, 2);
          });
      });

      it('resets query after completing', function() {
        var posts = Models.Post.collection();
        return posts
          .query('where', 'blog_id', 1)
          .count()
          .then(function(count) {
            checkCount(count, 2);
            return posts.count();
          })
          .then(function(count) {
            checkCount(count, 5);
          });
      });

      it('counts from the correct schema', function() {
        if (dialect !== 'postgresql') return this.skip();

        var initialCount;

        return countTestAuthors()
          .then(function(count) {
            initialCount = count;
            return Models.TestAuthor.forge().save({name: 'Testing'}, {withSchema: 'test'});
          })
          .then(function() {
            return countTestAuthors();
          })
          .then(function(count) {
            expect(count).to.be.above(initialCount);
          });
      });
    });

    describe('resetQuery', function() {
      it('deletes the `_builder` property, resetting the model query builder', function() {
        var m = new bookshelf.Model().query('where', {id: 1});
        equal(_.filter(m.query()._statements, {grouping: 'where'}).length, 1);
        m.resetQuery();
        equal(_.filter(m.query()._statements, {grouping: 'where'}).length, 0);
      });
    });

    describe('hasTimestamps', function() {
      describe('Date value', function() {
        // These tests have to be skipped in MySQL until issue #2524 in knex is fixed
        if (bookshelf.knex.client.dialect === 'mysql') return;

        var admin;

        beforeEach(function() {
          return Models.Admin.forge({username: 'a_new_user'})
            .save()
            .then(function(newAdmin) {
              admin = newAdmin;
            });
        });

        afterEach(function() {
          return admin.destroy();
        });

        it('is the same between saving and fetching models', function() {
          return Models.Admin.forge({id: admin.id})
            .fetch({require: true})
            .then(function(fetchedAdmin) {
              expect(fetchedAdmin.get('created_at')).to.eql(admin.get('created_at'));
              expect(fetchedAdmin.get('updated_at')).to.eql(admin.get('updated_at'));
            });
        });

        it('is the same between saving and fetching all models', function() {
          return Models.Admin.forge()
            .where({id: admin.id})
            .fetchAll()
            .then(function(admins) {
              expect(admins.at(0).get('created_at')).to.eql(admin.get('created_at'));
              expect(admins.at(0).get('updated_at')).to.eql(admin.get('updated_at'));
            });
        });

        it('is the same after updating model', function() {
          return admin.save({username: 'updated_user'}, {patch: true}).then(function(updatedAdmin) {
            expect(updatedAdmin.get('created_at')).to.eql(admin.get('created_at'));
          });
        });

        it('is the same for eager loaded related items', function() {
          return Models.Site.forge({name: 'a site'})
            .save()
            .tap(function(site) {
              return site.admins().attach(admin);
            })
            .then(function(site) {
              return Models.Site.forge({id: site.id}).fetch({
                withRelated: 'admins'
              });
            })
            .tap(function(site) {
              var relatedAdmin = site.related('admins').shift();
              expect(relatedAdmin.get('created_at')).to.eql(admin.get('created_at'));
              expect(relatedAdmin.get('updated_at')).to.eql(admin.get('updated_at'));
            })
            .then(function(site) {
              return site.destroy();
            });
        });

        it('is the same for related items', function() {
          return Models.Site.forge({name: 'a site'})
            .save()
            .bind({})
            .tap(function(site) {
              this.site = site;
              return site.admins().attach(admin);
            })
            .then(function(site) {
              return Models.Site.forge({id: site.id})
                .admins()
                .fetch();
            })
            .then(function(admins) {
              expect(admins.at(0).get('created_at')).to.eql(admin.get('created_at'));
              expect(admins.at(0).get('updated_at')).to.eql(admin.get('updated_at'));
              return this.site.destroy();
            });
        });
      });

      describe('On update', function() {
        it('does not update created_at when {method: "update"} is passed as option to save', function() {
          var m = new bookshelf.Model(null, {hasTimestamps: true});
          m.sync = function() {
            expect(this.get('created_at')).to.be.undefined;
            expect(this.get('updated_at')).to.be.a('date');
            return stubSync;
          };

          return m.save({item: 'test'}, {method: 'update'});
        });

        it("does not update created_at timestamp if the user doesn't set it", function() {
          this.slow(2000);
          var admin = new Models.Admin();
          var originalDate;

          return admin
            .save()
            .then(function(savedAdmin) {
              originalDate = savedAdmin.get('created_at');

              return Promise.delay(1000).then(function() {
                return savedAdmin.save('username', 'pablo');
              });
            })
            .then(function(updatedAdmin) {
              expect(updatedAdmin.get('created_at')).to.be.eql(originalDate);
            });
        });

        it("will automatically set the updated_at timestamp if the user doesn't set it", function() {
          this.slow(2000);
          var admin = new Models.Admin();
          var originalDate;

          return admin
            .save()
            .then(function(savedAdmin) {
              originalDate = savedAdmin.get('updated_at');

              return Promise.delay(1000).then(function() {
                return savedAdmin.save('username', 'pablo');
              });
            })
            .then(function(updatedAdmin) {
              const updatedDate = updatedAdmin.get('updated_at');
              expect(updatedDate.getTime()).to.not.equal(originalDate.getTime());
            });
        });

        it("will not update the updated_at timestamp if the model hasn't changed", function() {
          this.slow(2000);
          var admin = new Models.Admin();
          var originalDate;

          return admin
            .save()
            .then(function(savedAdmin) {
              originalDate = savedAdmin.get('updated_at');

              return Promise.delay(1000).then(function() {
                return savedAdmin.save();
              });
            })
            .then(function(updatedAdmin) {
              expect(updatedAdmin.get('updated_at')).to.be.eql(originalDate);
            });
        });

        it('will set the updated_at timestamp to the user supplied value', function() {
          var admin = new Models.Admin();
          var oldUpdatedAt;
          var newUpdatedAt = new Date('2019-09-01 12:13:14');
          newUpdatedAt.setMinutes(newUpdatedAt.getMinutes() + 10);

          return admin
            .save()
            .then(function(savedAdmin) {
              oldUpdatedAt = savedAdmin.get('updated_at');
              return savedAdmin.save('updated_at', newUpdatedAt);
            })
            .then(function(updatedAdmin) {
              expect(updatedAdmin.get('updated_at')).to.be.eql(newUpdatedAt);
              expect(updatedAdmin.get('updated_at')).to.not.be.eql(oldUpdatedAt);
            });
        });

        it("will not change the existing created_at timestamp if user doesn't set a value for it", function() {
          var model = new Models.Admin();
          var createdAt;

          return model
            .save()
            .then(function(savedAdmin) {
              createdAt = savedAdmin.get('created_at');
              return savedAdmin.save('username', 'pablo');
            })
            .then(function(updatedAdmin) {
              expect(updatedAdmin.get('created_at')).to.be.eql(createdAt);
            });
        });

        it('will set the created_at timestamp to the user supplied value', function() {
          var admin = new Models.Admin();
          var oldCreatedAt;
          var newCreatedAt = new Date(1999, 1, 1);

          return admin
            .save()
            .then(function(savedAdmin) {
              oldCreatedAt = savedAdmin.get('created_at');
              return admin.save('created_at', newCreatedAt);
            })
            .then(function(updatedAdmin) {
              expect(updatedAdmin.get('created_at')).to.be.eql(newCreatedAt);
              expect(updatedAdmin.get('created_at')).to.be.not.eql(oldCreatedAt);
            });
        });

        it('saves correct attributes when modified inside event hook', function() {
          var author = new Models.Author({
            site_id: 1,
            first_name: 'donny',
            last_name: 'immutable'
          });

          return author
            .save()
            .then(() => {
              var onSaving = function() {
                // don't allow modification of 'last_name' field
                this.attributes = this.pick(['id', 'site_id', 'first_name']);
              };

              author.on('saving', function() {
                onSaving.apply(this, arguments);
              });

              return author.save({first_name: 'tony', last_name: 'ravioli'});
            })
            .then(() => {
              return author.refresh();
            })
            .then(() => {
              expect(author.get('first_name')).to.equal('tony');
              expect(author.get('last_name')).to.equal('immutable');
              return author.destroy();
            });
        });
      });

      describe('On insert', function() {
        var m;

        beforeEach(function() {
          m = new (bookshelf.Model.extend({hasTimestamps: true}))();
        });

        it('sets created_at and updated_at when {method: "insert"} is passed as option', function() {
          m.sync = function() {
            expect(this.get('created_at')).to.be.a('date');
            expect(this.get('updated_at')).to.be.a('date');
            return stubSync;
          };

          return m.save({id: 1, item: 'test'}, {method: 'insert'});
        });

        it('will set the created_at and updated_at columns if true', function() {
          m.sync = function() {
            expect(this.get('created_at')).to.be.a('date');
            expect(this.get('updated_at')).to.be.a('date');
            return stubSync;
          };

          return m.save({item: 'test'});
        });

        it("sets created_at to the user specified value if present in the model's attributes", function() {
          var userDate = new Date(1999, 1, 1);
          m.sync = function() {
            expect(this.get('created_at')).to.be.eql(userDate);
            return stubSync;
          };

          return m.save({item: 'test', created_at: userDate});
        });

        it("sets updated_at to the user specified value if present in the model's attributes", function() {
          var userDate = new Date(1999, 1, 1);
          m.sync = function() {
            expect(this.get('updated_at')).to.be.eql(userDate);
            return stubSync;
          };

          return m.save({item: 'test', updated_at: userDate});
        });

        it('will set the timestamps columns to provided time in date option', function() {
          var dateInThePast = new Date(1999, 1, 1);
          m.sync = function() {
            equal(this.get('created_at').toISOString(), dateInThePast.toISOString());
            equal(this.get('updated_at').toISOString(), dateInThePast.toISOString());
            return stubSync;
          };

          return m.save({item: 'test'}, {date: dateInThePast});
        });
      });

      it('allows passing hasTimestamps in the options hash of model instantiation', function() {
        var m = new bookshelf.Model(null, {hasTimestamps: true});
        m.sync = function() {
          expect(this.get('created_at')).to.be.a('date');
          expect(this.get('updated_at')).to.be.a('date');
          return stubSync;
        };

        return m.save({item: 'test'});
      });

      it('allows custom keys for the created and updated values', function() {
        var m = new bookshelf.Model(null, {
          hasTimestamps: ['createdAt', 'updatedAt']
        });
        m.sync = function() {
          expect(this.get('createdAt')).to.be.a('date');
          expect(this.get('updatedAt')).to.be.a('date');
          return stubSync;
        };

        return m.save({item: 'test'});
      });

      it('will accept a falsy value as an option for the updated key name to ignore it', function() {
        var m = new bookshelf.Model(null, {
          hasTimestamps: ['createdAt', null]
        });
        m.sync = function() {
          expect(this.get('createdAt')).to.be.a('date');
          expect(this.get('updatedAt')).to.be.undefined;
          return stubSync;
        };

        return m.save({item: 'test'});
      });

      it('will not set an attribute named "null" when passing a literal null as a key name', function() {
        var m = new bookshelf.Model(null, {
          hasTimestamps: ['createdAt', null]
        });
        m.sync = function() {
          expect(this.get('null')).to.be.undefined;
          return stubSync;
        };

        return m.save({item: 'test'});
      });

      it('will accept a falsy value as an option for the created key to ignore it', function() {
        var m = new bookshelf.Model(null, {
          hasTimestamps: [null, 'updatedAt']
        });
        m.sync = function() {
          expect(this.get('updatedAt')).to.be.a('date');
          expect(this.get('createdAt')).to.be.undefined;
          return stubSync;
        };

        return m.save({item: 'test'});
      });

      it('will not set timestamps on the model if the associated columns are ommitted in fetch', function() {
        return Models.Admin.forge({id: 1})
          .fetch({columns: ['id']})
          .then(function(admin) {
            expect(admin.get('created_at')).to.be.undefined;
          });
      });
    });

    describe('defaults', function() {
      it('assigns defaults on save, rather than initialize', function() {
        var Item = bookshelf.Model.extend({
          defaults: {
            item: 'test',
            json: {key1: 'defaultValue1', key2: 'defaultValue2'}
          }
        });
        var item = new Item({newItem: 'test2', json: {key1: 'value1'}});
        deepEqual(item.toJSON(), {
          newItem: 'test2',
          json: {key1: 'value1'}
        });
        item.sync = function() {
          deepEqual(this.toJSON(), {
            id: 1,
            item: 'test',
            newItem: 'test2',
            json: {key1: 'value1', key2: 'defaultValue2'}
          });
          return stubSync;
        };

        return item.save({id: 1});
      });

      it('only assigns defaults when creating a model, unless {defaults: true} is passed in the save options', function() {
        var Item = bookshelf.Model.extend({defaults: {item: 'test'}});
        var item = new Item({id: 1, newItem: 'test2'});
        deepEqual(item.toJSON(), {id: 1, newItem: 'test2'});
        item.sync = function() {
          deepEqual(this.toJSON(), {id: 1, newItem: 'test2'});
          return stubSync;
        };

        return item.save().then(function() {
          item.sync = function() {
            deepEqual(this.toJSON(), {id: 2, item: 'test', newItem: 'test2'});
            return stubSync;
          };
          return item.save({id: 2}, {defaults: true});
        });
      });
    });

    describe('sync', function() {
      it('creates a new instance of Sync', function() {
        var model = new bookshelf.Model();
        equal(model.sync() instanceof require('../../lib/sync'), true);
      });
    });

    describe('isNew', function() {
      it('uses the idAttribute to determine if the model isNew', function() {
        var model = new bookshelf.Model();
        model.id = 1;
        equal(model.isNew(), false);
        model.set('id', null);
        equal(model.isNew(), true);
      });
    });

    describe('#previous()', function() {
      it('returns undefined for attributes that have not been set, fetched or saved yet', function() {
        var model = new Models.Site({id: 1});
        equal(model.previous('name'), undefined);
      });

      it("returns undefined for attributes that have been set if the model hasn't been synced yet", function() {
        var model = new Models.Site({id: 1});
        equal(model.previous('id'), undefined);
      });

      it('returns the previous value of an attribute the last time it was synced', function() {
        var model = new Models.Site({id: 1});

        return model.fetch().then(function() {
          model.set('id', 2);
          equal(model.previous('id'), 1);
        });
      });

      it("returns the current value of an attribute if it hasn't been changed", function() {
        var model = new Models.Site({id: 1});

        return model.fetch().then(function() {
          equal(model.previous('id'), 1);
        });
      });

      it('returns undefined if no attribute name is supplied', function() {
        var model = new Models.Site({id: 1});
        equal(model.previous(), undefined);
      });
    });

    describe('#previousAttributes()', function() {
      it("returns the model's current attributes if no attributes were changed after fetch", function() {
        return new Models.Site({id: 1}).fetch().then(function(site) {
          expect(site.previousAttributes()).to.eql(site.attributes);
        });
      });

      it("returns the model's current attributes if no attributes were changed after fetching collection", function() {
        return bookshelf.Collection.extend({
          model: Models.Site
        })
          .forge()
          .fetch()
          .then(function(sites) {
            expect(sites.at(0).previousAttributes()).to.eql(sites.at(0).attributes);
          });
      });

      it("returns the model's current attributes if no attributes were changed after save", function() {
        return new Models.Site({id: 1})
          .fetch()
          .then(function(site) {
            return site.save({name: site.get('name')});
          })
          .then(function(site) {
            expect(site.previousAttributes()).to.eql(site.attributes);
          });
      });

      it("returns the model's original attributes if the model has changed", function() {
        return new Models.Site({id: 1}).fetch().then(function(site) {
          var originalAttributes = _.clone(site.attributes);
          site.set('name', 'Blah');
          expect(site.previousAttributes()).to.eql(originalAttributes);
          expect(site.previousAttributes()).to.not.eql(site.attributes);
        });
      });

      it("returns a model's original attributes if a model in a collection has changed", function() {
        return bookshelf.Collection.extend({
          model: Models.Site
        })
          .forge()
          .fetch()
          .then(function(sites) {
            var site = sites.at(0);
            var originalAttributes = _.clone(site.attributes);
            site.set('name', 'Blah');
            expect(site.previousAttributes()).to.eql(originalAttributes);
            expect(site.previousAttributes()).to.not.eql(site.attributes);
          });
      });

      it("returns the model's original attributes after save", function() {
        var originalAttributes;

        return new Models.Site({id: 1})
          .fetch()
          .then(function(site) {
            originalAttributes = _.clone(site.attributes);
            return site.save({name: 'Blah'});
          })
          .then(function(site) {
            expect(site.previousAttributes()).to.eql(originalAttributes);
            expect(site.previousAttributes()).to.not.eql(site.attributes);
          })
          .finally(function() {
            return new Models.Site({id: 1}).save({name: originalAttributes.name});
          });
      });

      it("returns the model's original attributes after save on the 'updated' event", function(done) {
        var originalAttributes;
        var siteModel = new Models.Site({id: 1});

        siteModel.on('updated', function(site) {
          expect(site.previousAttributes()).to.eql(originalAttributes);
          expect(site.previousAttributes()).to.not.eql(site.attributes);

          new Models.Site({id: 1}).save({name: originalAttributes.name}).finally(() => done());
        });

        siteModel.fetch().then(function(site) {
          originalAttributes = _.clone(site.attributes);
          return siteModel.save({name: 'Blah'});
        });
      });

      it("returns the model's current attributes after save without changes on the 'updated' event", function(done) {
        var originalAttributes;
        var siteModel = new Models.Site({id: 1});

        siteModel.on('updated', function(site) {
          expect(site.previousAttributes()).to.eql(site.attributes);
          new Models.Site({id: 1}).save({name: originalAttributes.name}).finally(() => done());
        });

        siteModel.fetch().then(function(site) {
          originalAttributes = _.clone(site.attributes);
          return siteModel.save({name: site.get('name')});
        });
      });

      it("returns the model's current attributes after save without changes on the 'updated' event with a collection", function(done) {
        var originalAttributes;
        var SiteModel = Models.Site.extend({
          initialize: function() {
            this.on('updated', function(site) {
              expect(site.previousAttributes()).to.eql(site.attributes);
              new Models.Site({id: originalAttributes.id}).save({name: originalAttributes.name}).finally(() => done());
            });
          }
        });
        var Sites = bookshelf.Collection.extend({
          model: SiteModel
        });

        Sites.forge()
          .fetch()
          .then(function(sites) {
            var site = sites.at(0);
            originalAttributes = _.clone(site.attributes);
            return site.save({name: site.get('name')});
          });
      });

      it("returns the model's original attributes after destroy", function() {
        var originalAttributes;

        return new Models.Site({name: 'Blah'})
          .save()
          .then(function(site) {
            originalAttributes = _.clone(site.attributes);
            return site.destroy();
          })
          .then(function(site) {
            expect(site.previousAttributes()).to.eql(originalAttributes);
            expect(site.previousAttributes()).to.not.eql(site.attributes);
          });
      });

      it('returns an empty object if no model data has been fetched yet', function() {
        var site = new Models.Site({id: 1});
        expect(site.previousAttributes()).to.eql({});
      });

      it("returns the model's current attributes when the model is eager loaded without changes", function() {
        return new Models.Author({id: 1}).fetch({withRelated: ['site']}).then(function(author) {
          var site = author.related('site');
          expect(site.previousAttributes()).to.eql(site.attributes);
        });
      });

      it("returns the model's original attributes when the model is eager loaded", function() {
        return new Models.Author({id: 1}).fetch({withRelated: ['site']}).then(function(author) {
          var site = author.related('site');
          var originalAttributes = _.clone(site.attributes);

          site.set('name', 'changed name');

          expect(site.previousAttributes()).to.eql(originalAttributes);
          expect(site.attributes).to.not.eql(originalAttributes);
        });
      });
    });

    describe('#hasChanged()', function() {
      it('returns true if passing an attribute name that has changed since the last sync', function() {
        return new Models.Site({id: 1}).fetch().then(function(site) {
          site.set('name', 'Changed site');
          equal(site.hasChanged('name'), true);
        });
      });

      it('returns false if passing an attribute name that has not changed since the last sync', function() {
        return new Models.Site({id: 1}).fetch().then(function(site) {
          site.set('name', 'Changed site');
          equal(site.hasChanged('id'), false);
        });
      });

      it('returns true if no arguments are provided and an attribute of the model has changed', function() {
        return new Models.Site({id: 1}).fetch().then(function(site) {
          site.set('name', 'Changed site');
          equal(site.hasChanged(), true);
        });
      });

      it("returns false if no arguments are provided and the model hasn't changed", function() {
        return new Models.Site({id: 1}).fetch().then(function(site) {
          equal(site.hasChanged(), false);
        });
      });

      it('returns false if attribute is changed and then changed again to the initial value', function() {
        return new Models.Site({id: 1}).fetch().then(function(site) {
          var name = site.get('name');

          site.set('name', 'Changed site');
          site.set('name', name);

          equal(site.hasChanged('name'), false);
        });
      });

      it('returns false after an attribute is changed and the model is saved', function() {
        var originalName;

        return new Models.Site({id: 3})
          .fetch()
          .then(function(site) {
            originalName = site.get('name');
            return site.save({name: 'Changed site'});
          })
          .then(function(savedSite) {
            equal(savedSite.hasChanged('name'), false);
          })
          .finally(function() {
            if (originalName) return new Models.Site({id: 3}).save({name: originalName});
          });
      });
    });

    describe('Model.collection', function() {
      it('creates a new collection for the current model', function() {
        expect(bookshelf.Model.collection()).to.be.an.instanceOf(bookshelf.Collection);

        var NewModel = bookshelf.Model.extend({test: 1});
        var newModelCollection = NewModel.collection([{id: 1}]);

        expect(newModelCollection).to.be.an.instanceOf(bookshelf.Collection);
        expect(newModelCollection.at(0)).to.be.an.instanceOf(NewModel);
      });
    });

    describe('Model.count', function() {
      it('counts the number of matching records in the database', function() {
        return Models.Post.count().then(function(count) {
          checkCount(count, 5);
        });
      });
    });

    describe('model.once', function() {
      var Post = Models.Post;

      it('event.once return a promise', function() {
        var p = new Post({id: 1});
        p.once('event', function() {
          return Promise.resolve(1);
        });
        var promise = p.triggerThen('event');

        equal(promise instanceof Promise, true);

        return promise.then(function(results) {
          deepEqual(results, [1]);
        });
      });
    });

    describe('model.clone', function() {
      var Post = Models.Post;

      it('should be equivalent when cloned', function() {
        var original = Post.forge({author: 'Johnny', body: 'body'});
        original.related('comments').add({email: 'some@email.com'});
        var cloned = original.clone();

        deepEqual(_.omit(cloned, 'cid'), _.omit(original, 'cid'));
      });

      it('should contain a copy of internal QueryBuilder object - #945', function() {
        var original = Post.forge({author: 'Rhys'})
          .where('share_count', '>', 10)
          .query('orderBy', 'created_at');

        var cloned = original.clone();

        expect(original.query()).to.not.equal(cloned.query());
        expect(original.query().toString()).to.equal(cloned.query().toString());

        // Check that a query listener is registered. We must assume that this
        // is the link to `Model.on('query').
        expect(cloned.query()._events).to.have.property('query');
      });
    });

    describe('model.saveMethod', function() {
      var Post = Models.Post;

      it('should default to insert for new model', function() {
        var post = Post.forge();
        post.isNew = function() {
          return true;
        };
        expect(post.saveMethod()).to.equal('insert');
      });

      it('should default to update for non-new model', function() {
        var post = Post.forge();
        post.isNew = function() {
          return false;
        };
        expect(post.saveMethod()).to.equal('update');
      });

      it('should normalize to lowercase', function() {
        var post = Post.forge();
        expect(post.saveMethod({method: 'UpDATe'})).to.equal('update');
        expect(post.saveMethod({method: 'INSERT'})).to.equal('insert');
      });

      it('should always update on patch', function() {
        var post = Post.forge();
        expect(post.saveMethod({patch: true})).to.equal('update');
      });
    });
  });
};
