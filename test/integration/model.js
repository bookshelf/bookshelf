var _    = require('lodash');
var uuid = require('node-uuid');

var Promise   = global.testPromise;

var assert    = require('assert')
var equal     = require('assert').strictEqual;
var deepEqual = require('assert').deepEqual;
var QueryBuilder = require('knex/lib/query/builder')

module.exports = function(bookshelf) {

  describe('Model', function() {

    var Models    = require('./helpers/objects')(bookshelf).Models;

    var stubSync = {
      first:  function() { return Promise.resolve({}); },
      select: function() { return Promise.resolve({}); },
      insert: function() { return Promise.resolve({}); },
      update: function() { return Promise.resolve(1); },
      del:    function() { return Promise.resolve({}); }
    };

    var dialect = bookshelf.knex.client.dialect;
    var formatNumber = {
      mysql:      _.identity,
      sqlite3:    _.identity,
      postgresql: function(count) { return count.toString() }
    }[dialect];
    var checkCount = function(actual, expected) {
      expect(actual, formatNumber(expected));
    };

    describe('extend/constructor/initialize', function() {

      var User = bookshelf.Model.extend({
        idAttribute: 'user_id',
        getData: function() { return 'test'; }
      }, {
        classMethod: function() { return 'test'; }
      });

      var SubUser = User.extend({
        otherMethod: function() { return this.getData(); }
      }, {
        classMethod2: function() { return 'test2'; }
      });

      var OtherUser = bookshelf.Model.extend({
        idAttribute: 'user_id',
        getData: function() { return 'test'; }
      }, {
        classMethod: function() { return 'test'; }
      });

      it('can be extended', function() {
        var user = new User({name: "hoge"});
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

      it('doesn\'t have ommitted properties', function() {
        equal(User.prototype.changedAttributes, undefined);
        equal((new User()).changedAttributes, undefined);
      });

      context('should have own errors: name of', function(){
        it('NotFoundError', function(){
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

        it('NoRowsUpdatedError', function(){
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

        it('NoRowsDeletedError', function(){
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
      });

    });

    describe('id, idAttribute', function() {

      it('should attach the id as a property on the model', function() {
        var test = new bookshelf.Model({id: 1});
        equal(test.id, (1));
      });

      it('should reference idAttribute as the key for model.id', function() {
        var Test = bookshelf.Model.extend({
          idAttribute: '_id'
        });
        var test2 = new Test({_id: 2});
        equal(test2.id, (2));
      });

    });

    describe('query', function() {

      var model;
      beforeEach(function() {
        model = new bookshelf.Model();
      });

      it('returns the Knex builder when no arguments are passed', function() {
        equal((model.query() instanceof QueryBuilder), true);
      });

      it('calls Knex builder method with the first argument, returning the model', function() {
        var q = model.query('where', {id:1});
        equal(q, (model));
      });

      it('passes along additional arguments to the Knex method in the first argument', function() {
        var qb = model.resetQuery().query();
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 0);
        var q = model.query('where', {id:1});
        equal(q, (model));
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 1);
      });

      it('allows passing an object to query', function() {
        var qb = model.resetQuery().query();
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 0);
        var q = model.query({where: {id: 1}, orWhere: ['id', '>', '10']});
        equal(q, model);
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 2);
      });

      it('allows passing an function to query', function() {
        var qb = model.resetQuery().query();
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 0);
        var q = model.query(function(qb) {
          this.where({id: 1}).orWhere('id', '>', '10');
        });
        equal(q, model);
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 2);
        qb = model.resetQuery().query();
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 0);
        q = model.query(function(qb) {
          qb.where({id: 1}).orWhere('id', '>', '10');
        });
        equal(q, model);
        equal(_.filter(qb._statements, {grouping: 'where'}).length, 2);
      });

    });

    describe('tableName', function() {

      var table = new bookshelf.Model({}, {tableName: 'customers'});

      it('can be passed in the initialize options', function() {
        equal(table.tableName, 'customers');
      });

      it('should set the tableName for the query builder', function() {
        // TODO: Make this doable again...
        // equal(_.findWhere(table.query().statements, {grouping: 'table'}).value, '`customers`');
      });

    });

    describe('toJSON', function() {

      it('includes the idAttribute in the hash', function() {
        var m = new (bookshelf.Model.extend({
          idAttribute: '_id'
        }))({'_id': 1, 'name': 'Joe'});
        deepEqual(m.toJSON(), {'_id': 1, 'name': 'Joe'});
      });

      it('includes the relations loaded on the model, unless {shallow: true} is passed.', function() {
        var m = new bookshelf.Model({id: 1, name: 'Test'});
        m.relations = {someList: new bookshelf.Collection([{id:1}, {id:2}])};
        var json = m.toJSON();
        deepEqual(_.keys(json), ['id', 'name', 'someList']);
        equal(json.someList.length, 2);
        var shallow = m.toJSON({shallow:true});
        deepEqual(_.keys(shallow), ['id', 'name']);
      });

      it('omits new models from collections and relations when {omitNew: true} is passed.', function() {
        var model = new bookshelf.Model({id: 1, attr1: 'Test'});
        model.relations = {
          someList: new bookshelf.Collection([{id: 2}, {attr2: 'Test'}]),
          someRel: new bookshelf.Model({id: 3}),
          otherRel:  new bookshelf.Model({attr3: 'Test'})
        };
        var coll = new bookshelf.Collection([
          model,
          new bookshelf.Model({attr5: 'Test'}),
          new bookshelf.Model({id: 4, attr4: 'Test'})
        ])
        var json = coll.toJSON();
        equal(json.length, 3);
        deepEqual(_.keys(json[0]), ['id', 'attr1', 'someList', 'someRel', 'otherRel']);
        deepEqual(_.keys(json[1]), ['attr5']);
        deepEqual(_.keys(json[2]), ['id', 'attr4']);
        equal(json[0].someList.length, 2);
        var omitNew = coll.toJSON({omitNew: true});
        equal(omitNew.length, 2);
        deepEqual(_.keys(omitNew[0]), ['id', 'attr1', 'someList', 'someRel']);
        deepEqual(_.keys(omitNew[1]), ['id', 'attr4']);
        equal(omitNew[0].someList.length, 1);
      });

      it('returns null for a new model when {omitNew: true} is passed.', function() {
        var model = new bookshelf.Model({attr1: 'Test'});
        var json = model.toJSON();
        deepEqual(_.keys(json), ['attr1']);
        var omitNew = model.toJSON({omitNew: true});
        deepEqual(omitNew, null);
      });
    });

    describe('parse', function() {

      var ParsedSite = Models.Site.extend({
        parse: function (attrs) {
          attrs.name = 'Test: ' + attrs.name;
          return attrs;
        }
      });

      it('parses the model attributes on fetch', function() {
        return new ParsedSite({id: 1})
          .fetch()
          .then(function(model) {
            equal(model.get('name').indexOf('Test: '), 0);
          });
      });

      it('parses the model attributes on creation if {parse: true} is passed', function() {
        var one = new ParsedSite({name: 'Site'});
        equal(one.get('name'), 'Site');
        var two = new ParsedSite({name: 'Site'}, {parse: true});
        equal(two.get('name'), 'Test: Site');
      });

    });

    describe('format', function() {

      // TODO: better way to test this.
      it('calls format when saving', function() {

        var M = bookshelf.Model.extend({
          tableName: 'test',
          format: function(attrs) {
            return _.reduce(attrs, function(memo, val, key) {
              memo[_.snakeCase(key)] = val;
              return memo;
            }, {});
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

        return M.forge({id: 1}).fetch().call('load');
      });

    });

    describe('refresh', function() {
      var Site = Models.Site;

      it('will fetch a record by present attributes without an ID attribute', function() {
        Site.forge({name: 'knexjs.org'}).refresh().then(function (model) {
          expect(model.id).to.equal(1);
        });
      });

      it("will update a model's attributes by fetching only by `idAttribute`", function() {
        Site.forge({id: 1, name: 'NOT THE CORRECT NAME'}).refresh().then(function (model) {
          expect(model.get('name')).to.equal('knexjs.org');
        });
      });

    });

    describe('fetch', function() {

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
        return model.fetch().throw(new Error('Err')).catch(function(err) {
          assert(err.message === 'This failed')
        })
      });

      it('allows access to the query builder on the options object in the fetching event', function() {
        var model = new Site({id: 1});
        model.on('fetching', function(model, columns, options) {
          assert(typeof options.query.whereIn === 'function')
        });
        return model.fetch();
      });

      it('does not fail, when joining another table having some columns with the same names - #176',  function () {
        var model = new Site({id: 1});
        model.query(function (qb) {
          qb.join('authors', 'authors.site_id', '=', 'sites.id');
        });
        return model.fetch()
      });

      it('allows specification of select columns as an `options` argument', function () {
        var model = new Author({id: 1}).fetch({columns: ['first_name']})
          .then(function (model) {
            deepEqual(model.toJSON(), {id: 1, first_name: 'Tim'});
          });
      });

      it('allows specification of select columns in query callback', function () {
        var model = new Author({id: 1}).query('select','first_name').fetch()
          .then(function (model) {
            deepEqual(model.toJSON(), {id: 1, first_name: 'Tim'});
          });
      });

      it('will still select default columns if `distinct` is called without columns - #807', function () {
        var model = new Author({id: 1}).query('distinct').fetch()
          .then(function (model) {
            deepEqual(model.toJSON(), {
              id: 1,
              first_name: 'Tim',
              last_name: 'Griesser',
              site_id: 1
            });
          });
      });

      it('resolves to null if no record exists', function() {
        var model = new Author({id: 200}).fetch()
          .then(function (model) {
            equal(model, null);
          });
      });

    });

    describe('fetchAll', function() {

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

        site.fetchAll().then(function() {
          equal(isFetchingTriggered, true);
          equal(isFetchedTriggered, true);
        }).catch(function() {
          equal(true, false);
        });

      });

    });

    describe('orderBy', function () {
      it('returns results in the correct order', function () {
        var asc = Models.Customer.forge().orderBy('id', 'ASC').fetchAll()
          .then(function (result) {
            return result.toJSON().map(function (row) { return row.id });
          });

        var desc = Models.Customer.forge().orderBy('id', 'DESC').fetchAll()
          .then(function (result) {
            return result.toJSON().map(function (row) { return row.id });
          })

        return Promise.join(asc, desc)
          .then(function (results) {
            expect(results[0].reverse()).to.eql(results[1]);
          });
      });

      it('returns DESC order results with a minus sign', function () {
        return Models.Customer.forge().orderBy('-id').fetchAll().then(function (results) {
          expect(parseInt(results.models[0].get('id'))).to.equal(4);
        });
      })
    });

    describe('save', function() {

      var Site = Models.Site;

      it('saves a new object', function() {

        return new Site({name: 'Fourth Site'}).save().then(function(m) {
          equal(m.get('id'), 4);
          return new bookshelf.Collection(null, {model: Site}).fetch();
        })
        .then(function(c) {
          equal(c.last().id, 4);
          equal(c.last().get('name'), 'Fourth Site');
          equal(c.length, 4);
        });
      });

      it('updates an existing object', function() {
        return new Site({id: 4, name: 'Fourth Site Updated'}).save()
          .then(function() {
            return new bookshelf.Collection(null, {model: Site}).fetch();
          })
          .then(function(c) {
            equal(c.last().id, 4);
            equal(c.last().get('name'), 'Fourth Site Updated');
            equal(c.length, 4);
          });
      });

      it('allows passing a method to save, to call insert or update explicitly', function() {
        return new Site({id: 5, name: 'Fifth site, explicity created'}).save(null, {method: 'insert'})
        .then(function() {
          return Site.fetchAll();
        })
        .then(function(c) {
          equal(c.length, 5);
          equal(c.last().id, 5);
          equal(c.last().get('name'), 'Fifth site, explicity created');
        });
      });

      it('errors if the row was not updated', function() {

        return new Site({id: 200, name: 'This doesnt exist'}).save().then(function() {
          throw new Error('This should not succeed');
        }, function(err) {
          expect(err.message).to.equal('No Rows Updated');
        });

      });

      it('does not error if if the row was not updated but require is false', function() {
        return new Site({id: 200, name: 'This doesnt exist'}).save({}, {require: false});
      });

      it('should not error if updated row was not affected', function() {
        return new Site({id: 5, name: 'Fifth site, explicity created'}).save();
      });

      it('does not constrain on the `id` during update unless defined', function() {

        var m = new bookshelf.Model({id: null}).query({where: {uuid: 'testing'}});
        var query = m.query();
        query.update = function() {
          equal(_.filter(this._statements, {grouping: 'where'}).length, 1);
          return Promise.resolve(1);
        };

        return m.save(null, {method: 'update'}).then(function() {

          var m2 = new bookshelf.Model({id: 1}).query({where: {uuid: 'testing'}});
          var query2 = m2.query();
          query2.update = function() {
            equal(_.filter(this._statements, {grouping: 'where'}).length, 2);
            return {};
          };

          return m2.save(null, {method: 'update'});

        });

      });

      it('allows {patch: true} as an option for only updating passed data', function() {

        var user = new bookshelf.Model({id: 1, first_name: 'Testing'}, {tableName: 'users'});
        var query = user.query();

        query.then = function(onFulfilled, onRejected) {
          deepEqual(this._single.update, {bio: 'Short user bio'});
          equal(_.filter(this._statements, {grouping: 'where'}).length, 1);
          return Promise.resolve(1).then(onFulfilled, onRejected);
        };

        return user
          .save({bio: 'Short user bio'}, {patch: true})
          .then(function(model) {
            equal(model.id, 1);
            equal(model.get('bio'), 'Short user bio');
            equal(model.get('first_name'), 'Testing');
          });

      });

      it('fires saving and creating and then saves', function() {
        var user   = new bookshelf.Model({first_name: 'Testing'}, {tableName: 'users'});
        var query  = user.query();
        var events = 0;
        user.sync  = function() {
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
        var test = new Test;
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
          _generateId: function (model, attrs, options) {
            if (model.isNew()) {
              model.set(model.idAttribute, uuidval);
            }
          }
        });
        var subsite = new SubSite({name: 'testing'});
        return subsite.save().then(function(model) {
          expect(model.id).to.equal(uuidval);
          expect(model.get('name')).to.equal('testing');
        }).then(function() {
          return new SubSite({uuid: uuidval}).fetch();
        }).then(function(model) {
          expect(model.get('name')).to.equal('testing');
        });
      });

        it('passes custom `options` passed to `timestamp()` - #881', function () {
          function stubTimestamp(options) {
            expect(options.customOption).to.equal(testOptions.customOption);
          }
          var site = Models.Site.forge({id: 881}, {hasTimestamps: true});
          var testOptions = {method: 'insert', customOption: 'CUSTOM_OPTION'}
          site.timestamp = stubTimestamp;
          site.save(null, testOptions).call('destroy');
      });

      it('Will not break with prefixed id, #583', function() {

        var acmeOrg = new Models.OrgModel ({name: "ACME, Inc", is_active: true});
        var acmeOrg1;
        return acmeOrg.save ().then (function () {
          acmeOrg1 = new Models.OrgModel ({id: 1})
          return acmeOrg1.fetch();
        }).then (function () {
          equal (acmeOrg1.attributes.id, 1);
          equal (acmeOrg1.attributes.name, "ACME, Inc");
          equal (acmeOrg1.attributes.organization_id, undefined);
          equal (acmeOrg1.attributes.organization_name, undefined);

          expect (acmeOrg.attributes.name).to.equal ("ACME, Inc");
          // field name needs to be processed through model.parse
          equal (acmeOrg.attributes.organization_id, undefined);
          expect (acmeOrg.attributes.id).to.equal (1);
        });
      });

    });

    describe('destroy', function() {

      var Site = Models.Site;

      it('issues a delete to the Knex, returning a promise', function() {

        return new Site({id: 5}).destroy().then(function() {
          return new bookshelf.Collection(null, {model: Site}).fetch();
        })
        .then(function(c) {
          equal(c.length, 4);
        });

      });

      it('fails if no idAttribute or wheres are defined on the model.', function() {

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
            throw new Error("You cannot destroy the first site");
          }
        });
        return m.destroy().then(null, function(e) {
          equal(e.toString(), 'Error: You cannot destroy the first site');
        });
      });

      it('allows access to the query builder on the options object in the destroying event', function() {
        var m = new Site({id: 1});
        m.sync = function () {
          var sync = stubSync;
          sync.query = m.query();
          return sync;
        };
        m.on('destroying', function(model, options) {
          assert(typeof options.query.whereIn === "function");
        });
        return m.destroy();
      });

      it('will throw an error when trying to destroy a non-existent object with {require: true}', function() {
        return new Site({id: 1337}).destroy({require: true}).catch(function(err) {
          assert(err instanceof bookshelf.NoRowsDeletedError)
        })
      });

    });

    describe('count', function() {
      it('counts the number of models in a collection', function() {
        return Models.Post
          .forge()
          .count()
          .then(function(count) {
            checkCount(count, 5);
          });
      });

      it('optionally counts by column (excluding null values)', function() {
        var author = Models.Author.forge();
        return author.count()
          .then(function(count) {
            checkCount(count, 5);
            return author.count('last_name');
          }).then(function(count) {
            checkCount(count, 4);
          });
      });

      it('counts a filtered query', function() {
        return Models.Post
          .forge()
          .query('where', 'blog_id', 1)
          .count()
          .then(function(count) {
            checkCount(count, 2);
          });
      });

      it('resets query after completing', function() {
        var posts =  Models.Post.collection();
        posts.query('where', 'blog_id', 1).count()
          .then(function(count)  {
            checkCount(count, 2);
            return posts.count();
          })
          .then(function(count) { checkCount(count, 5); });
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

      it('will set the created_at and updated_at columns if true', function() {
        var m = new (bookshelf.Model.extend({hasTimestamps: true}))();
        m.sync = function() {
          equal(this.get('item'), 'test');
          equal(_.isDate(this.get('created_at')), true);
          equal(_.isDate(this.get('updated_at')), true);
          return stubSync;
        };
        return m.save({item: 'test'});
      });

      it('only sets the updated_at for existing models', function() {
        var m1 = new (bookshelf.Model.extend({hasTimestamps: true}))();
        m1.sync = function() {
          equal(this.get('item'), 'test');
          equal(_.isDate(this.get('updated_at')), true);
          return stubSync;
        };
        return m1.save({item: 'test'});
      });

      it('allows passing hasTimestamps in the options hash', function() {
        var m = new bookshelf.Model(null, {hasTimestamps: true});
        m.sync = function() {
          equal(this.get('item'), 'test');
          equal(_.isDate(this.get('created_at')), true);
          equal(_.isDate(this.get('updated_at')), true);
          return stubSync;
        };
        return m.save({item: 'test'});
      });

      it('allows custom keys for the created at & update at values', function() {
        var m = new bookshelf.Model(null, {hasTimestamps: ['createdAt', 'updatedAt']});
        m.sync = function() {
          equal(this.get('item'), 'test');
          equal(_.isDate(this.get('createdAt')), true);
          equal(_.isDate(this.get('updatedAt')), true);
          return stubSync;
        };
        return m.save({item: 'test'});
      });

      it('does not set created_at when {method: "update"} is passed', function() {
        var m = new bookshelf.Model(null, {hasTimestamps: true});
        m.sync = function() {
          equal(this.get('item'), 'test');
          equal(_.isDate(this.get('created_at')), false);
          equal(_.isDate(this.get('updated_at')), true);
          return stubSync;
        };
        return m.save({item: 'test'}, {method: 'update'});
      });

      it('sets created_at when {method: "insert"} is passed', function() {
        var m = new bookshelf.Model(null, {hasTimestamps: true});
        m.sync = function() {
          equal(this.id, 1);
          equal(this.get('item'), 'test');
          equal(_.isDate(this.get('created_at')), true);
          equal(_.isDate(this.get('updated_at')), true);
          return stubSync;
        };
        return m.save({id: 1, item: 'test'}, {method: 'insert'});
      });

      it('will accept a falsy value as an option for created and ignore it', function() {
        var m = new bookshelf.Model(null, {hasTimestamps: ['createdAt', null]});
        m.sync = function() {
          equal(this.get('item'), 'test');
          equal(_.isDate(this.get('createdAt')), true);
          equal(_.isDate(this.get('updatedAt')), false);
          return stubSync;
        };
        return m.save({item: 'test'});
      });

      it('will accept a falsy value as an option for updated and ignore it', function() {
        var m = new bookshelf.Model(null, {hasTimestamps: [null, 'updatedAt']});
        m.sync = function() {
          equal(this.get('item'), 'test');
          equal(_.isDate(this.get('updatedAt')), true);
          equal(_.isDate(this.get('createdAt')), false);
          return stubSync;
        };
        return m.save({item: 'test'});
      });

    });

    describe('timestamp', function() {

      it('will set the `updated_at` attribute to a date, and the `created_at` for new entries', function() {
        var newModel      = new bookshelf.Model({}, {hasTimestamps: true});
        var existingModel = new bookshelf.Model({id: 1}, {hasTimestamps: true});
        newModel.timestamp();
        existingModel.timestamp();
        expect(newModel.get('created_at')).to.be.an.instanceOf(Date);
        expect(newModel.get('updated_at')).to.be.an.instanceOf(Date);

        expect(existingModel.get('created_at')).to.not.exist;
        expect(existingModel.get('updated_at')).to.be.an.instanceOf(Date);
      });

      it('will set the `created_at` when inserting new entries', function() {
        var model = new bookshelf.Model({id: 1}, {hasTimestamps: true});
        model.timestamp({method: 'insert'});

        expect(model.get('created_at')).to.be.an.instanceOf(Date);
        expect(model.get('updated_at')).to.be.an.instanceOf(Date);
      });

      it('will not set timestamps on a model without `setTimestamps` set to true', function () {
        var model = new bookshelf.Model();
        model.timestamp();

        expect(model.get('created_at')).to.not.exist;
        expect(model.get('updated_at')).to.not.exist;
      });
    });

    describe('defaults', function() {

      it('assigns defaults on save, rather than initialize', function() {
        var Item = bookshelf.Model.extend({defaults: {item: 'test'}});
        var item = new Item({newItem: 'test2'});
        deepEqual(item.toJSON(), {newItem: 'test2'});
        item.sync = function() {
          deepEqual(this.toJSON(), {id: 1, item: 'test', newItem: 'test2'});
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

      it('creates a new instance of Sync', function(){
        var model = new bookshelf.Model();
        equal((model.sync(model) instanceof require('../../lib/sync')), true);
      });
    });

    describe('isNew', function() {

      it('uses the idAttribute to determine if the model isNew', function(){
        var model = new bookshelf.Model();
        model.id = 1;
        equal(model.isNew(), false);
        model.set('id', null);
        equal(model.isNew(), true);
      });

    });

    describe('previous, previousAttributes', function() {

      it('will return the previous value of an attribute the last time it was synced', function() {
        var count = 0;
        var model = new Models.Site({id: 1});
        equal(model.previous('id'), undefined);

        return model.fetch().then(function() {
          deepEqual(model.previousAttributes(), {id: 1, name: 'knexjs.org'});
          deepEqual(model.changed, {});
          model.set('id', 2);
          equal(model.previous('id'), 1);
          deepEqual(model.changed, {id: 2});
          model.set('id', 1);
          deepEqual(model.changed, {});
        });

      });

      it('will return `undefined` if no attribute is supplied', function() {
        var model = new Models.Site({id: 1});
        equal(model.previous(null), undefined);
      });

    });

    describe('hasChanged', function() {

      it('will determine whether an attribute, or the model has changed', function() {

        return new Models.Site({id: 1}).fetch().then(function(site) {
          equal(site.hasChanged(), false);
          site.set('name', 'Changed site');
          equal(site.hasChanged('name'), true);
          deepEqual(site.changed, {name: 'Changed site'});
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
        post.isNew = function() { return true; }
        expect(post.saveMethod()).to.equal('insert');
      });

      it('should default to update for non-new model', function() {
        var post = Post.forge();
        post.isNew = function() { return false; }
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
