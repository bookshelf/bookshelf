/*global describe, it */
var _ = require('underscore');
_.str = require('underscore.string');

var When = require('when');

var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

module.exports = function(Bookshelf, handler) {

  var Backbone = Bookshelf.Backbone;
  var Models    = require('../shared/objects')(Bookshelf).Models;

  var stubSync = {
    first:  function() { return When.resolve({}); },
    select: function() { return When.resolve({}); },
    insert: function() { return When.resolve({}); },
    update: function() { return When.resolve({}); },
    del:    function() { return When.resolve({}); }
  };

  describe('extend/constructor/initialize', function() {

    var User = Bookshelf.Model.extend({
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

    it('can be extended', function() {
      var user = new User();
      var subUser = new SubUser();
      equal(user.idAttribute, ('user_id'));
      equal(user.getData(), 'test');
      equal(subUser.otherMethod(), 'test');
      equal(User.classMethod(), 'test');
      equal(SubUser.classMethod(), 'test');
      equal(SubUser.classMethod2(), 'test2');
    });

    it('accepts a custom `constructor` property', function() {
      var User = Bookshelf.Model.extend({
        constructor: function() {
          this.item = 'test';
          Bookshelf.Model.apply(this, arguments);
        }
      });
      equal(new User().item, 'test');
    });

  });

  describe('forge', function() {

    it('should create a new model instance', function() {
      var User = Bookshelf.Model.extend({
        tableName: 'users'
      });
      var user = User.forge();
      equal(user.tableName, 'users');
    });

  });

  describe('id, idAttribute', function() {

    it('should attach the id as a property on the model', function() {
      var test = new Bookshelf.Model({id: 1});
      equal(test.id, (1));
    });

    it('should reference idAttribute as the key for model.id', function() {
      var Test = Bookshelf.Model.extend({
        idAttribute: '_id'
      });
      var test2 = new Test({_id: 2});
      equal(test2.id, (2));
    });

  });

  describe('get', function() {

    it('should use the same get method as the Backbone library', function() {
      var attached = ['get'];
      _.each(attached, function(item) {
        deepEqual(Bookshelf.Model.prototype[item], Bookshelf.Backbone.Model.prototype[item]);
      });
    });

  });

  describe('query', function() {

    var model = new Bookshelf.Model();

    it('returns the Knex builder when no arguments are passed', function() {
      equal((model.query() instanceof Bookshelf.Knex.Builder), true);
    });

    it('calls Knex builder method with the first argument, returning the model', function() {
      var q = model.query('where', {id:1});
      equal(q, (model));
    });

    it('passes along additional arguments to the Knex method in the first argument', function() {
      var qb = model.resetQuery().query();
      equal(qb.wheres.length, 0);
      var q = model.query('where', {id:1});
      equal(q, (model));
      equal(qb.wheres.length, 1);
    });

    it('allows passing an object to query', function() {
      var qb = model.resetQuery().query();
      equal(qb.wheres.length, 0);
      var q = model.query({where: {id: 1}, orWhere: ['id', '>', '10']});
      equal(q, model);
      equal(qb.wheres.length, 2);
    });

    it('allows passing an function to query', function() {
      var qb = model.resetQuery().query();
      equal(qb.wheres.length, 0);
      var q = model.query(function(qb) {
        this.where({id: 1}).orWhere('id', '>', '10');
      });
      equal(q, model);
      equal(qb.wheres.length, 2);
      qb = model.resetQuery().query();
      equal(qb.wheres.length, 0);
      q = model.query(function(qb) {
        qb.where({id: 1}).orWhere('id', '>', '10');
      });
      equal(q, model);
      equal(qb.wheres.length, 2);
    });

  });

  describe('tableName', function() {

    var table = new Bookshelf.Model({}, {tableName: 'customers'});

    it('can be passed in the initialize options', function() {
      equal(table.tableName, 'customers');
    });

    it('should set the tableName for the query builder', function() {
      equal(table.query().from(), ('customers'));
    });

  });

  describe('toJSON', function() {

    it('includes the idAttribute in the hash', function() {
      var m = new (Bookshelf.Model.extend({
        idAttribute: '_id'
      }))({'_id': 1, 'name': 'Joe'});
      deepEqual(m.toJSON(), {'_id': 1, 'name': 'Joe'});
    });

    it('includes the relations loaded on the model, unless {shallow: true} is passed.', function() {
      var m = new Bookshelf.Model({id: 1, name: 'Test'});
      m.relations = {someList: new Bookshelf.Collection([{id:1}, {id:2}])};
      var json = m.toJSON();
      deepEqual(_.keys(json), ['id', 'name', 'someList']);
      equal(json.someList.length, 2);
      var shallow = m.toJSON({shallow:true});
      deepEqual(_.keys(shallow), ['id', 'name']);
    });
  });

  describe('parse', function() {

    var ParsedSite = Models.Site.extend({
      parse: function (attrs) {
        attrs.name = 'Test: ' + attrs.name;
        return attrs;
      }
    });

    it('parses the model attributes on fetch', function(ok) {
      new ParsedSite({id: 1})
        .fetch()
        .then(function(model) {
          equal(model.get('name').indexOf('Test: '), 0);
          ok();
        }, ok);
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
    it('calls format when saving', function(ok) {

      var M = Backbone.Model.extend({
        tableName: 'test',
        format: function(attrs) {
          return _.reduce(attrs, function(memo, val, key) {
            memo[_.str.underscored(key)] = val;
            return memo;
          }, {});
        }
      });

      var m = new M({firstName: 'Tim', lastName: 'G'});
      m.sync = function() {
        var data = this.format(_.extend({}, this.attributes));
        equal(data.first_name, 'Tim');
        equal(data.last_name, 'G');
        ok();
        return stubSync;
      };
      m.save();

    });

  });

  describe('fetch', function() {

    var Site = Models.Site;

    it('issues a first (get one) to Knex, triggering a fetched event, returning a promise', function(ok) {
      var count = 0;
      var model = new Site({id: 1});
      model.on('fetched', function() {
        count++;
      });

      model.fetch().then(function(model) {
        equal(model.get('id'), 1);
        equal(model.get('name'), 'knexjs.org');
        equal(count, 1);
        ok();
      });

    });

    it('has a fetching event, which will fail if an error is thrown or if a rejected promise is provided', function(ok) {

      var model = new Site({id: 1});
      model.on('fetching', function() {
        throw new Error("This failed");
      });
      model.fetch().then(null, function() {
        ok();
      });

    });

  });

  describe('save', function() {

    var Site = Models.Site;

    it('saves a new object', function(ok) {
      new Site({name: 'Fourth Site'}).save().then(function(m) {
        equal(m.get('id'), 4);
        return new Bookshelf.Collection(null, {model: Site}).fetch();
      })
      .then(function(c) {
        equal(c.last().id, 4);
        equal(c.last().get('name'), 'Fourth Site');
        equal(c.length, 4);
        ok();
      }).then(null, ok);
    });

    it('updates an existing object', function(ok) {
      new Site({id: 4, name: 'Fourth Site Updated'}).save()
        .then(function() {
          return new Bookshelf.Collection(null, {model: Site}).fetch();
        })
        .then(function(c) {
          equal(c.last().id, 4);
          equal(c.last().get('name'), 'Fourth Site Updated');
          equal(c.length, 4);
          ok();
        }).then(null, ok);
    });

    it('allows passing a method to save, to call insert or update explicitly', function(ok) {
      new Site({id: 5, name: 'Fifth site, explicity created'}).save(null, {method: 'insert'})
      .then(function() {
        return new Bookshelf.Collection(null, {model: Site}).fetch();
      })
      .then(function(c) {
        equal(c.length, 5);
        equal(c.last().id, 5);
        equal(c.last().get('name'), 'Fifth site, explicity created');
        ok();
      }).then(null, ok);
    });

    it('does not constrain on the `id` during update unless defined', function(ok) {

      var m = new Bookshelf.Model({id: null}).query({where: {uuid: 'testing'}});
      var query = m.query();
      query.update = function() {
        equal(this.wheres.length, 1);
        return When.resolve({});
      };
      m.save(null, {method: 'update'}).then(function() {

        var m2 = new Bookshelf.Model({id: 1}).query({where: {uuid: 'testing'}});
        var query2 = m2.query();
        query2.update = function() {
          equal(this.wheres.length, 2);
          ok();
        };
        m2.save(null, {method: 'update'});

      });

    });

    it('allows {patch: true} as an option for only updating passed data', function(ok) {

      var user = new Bookshelf.Model({id: 1, first_name: 'Testing'}, {tableName: 'users'});
      var query = user.query();

      query.then = function(onFulfilled, onRejected) {
        equal(this.bindings.length, 2);
        equal(this.wheres.length, 1);
        return When.resolve(this.toString()).then(onFulfilled, onRejected);
      };

      user
        .save({bio: 'Short user bio'}, {patch: true})
        .then(function(model) {
          equal(model.id, 1);
          equal(model.get('bio'), 'Short user bio');
          equal(model.get('first_name'), 'Testing');
          ok();
        });

    });

  });

  describe('destroy', function() {

    var Site = Models.Site;

    it('issues a delete to the Knex, returning a promise', function(ok) {
      new Site({id: 5}).destroy().then(function() {
        return new Bookshelf.Collection(null, {model: Site}).fetch();
      })
      .then(function(c) {
        equal(c.length, 4);
        ok();
      })
      ;
    });

    it('fails if no idAttribute or wheres are defined on the model.', function(ok) {
      new Site().destroy().then(null, function(e) {
        equal(e.toString(), 'Error: A model cannot be destroyed without a "where" clause or an idAttribute.');
        ok();
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

    it('will not destroy the model if an error is thrown during the destroying event', function(ok) {
      var m = new Site({id: 1});
      m.on('destroying', function(model) {
        if (model.id === 1) {
          throw new Error("You cannot destroy the first site");
        }
      });
      m.destroy().then(null, function(e) {
        equal(e.toString(), 'Error: You cannot destroy the first site');
        ok();
      });
    });

  });

  describe('resetQuery', function() {

    it('deletes the `_builder` property, resetting the model query builder', function() {
      var m = new Bookshelf.Model().query('where', {id: 1});
      equal(m.query().wheres.length, 1);
      m.resetQuery();
      equal(m.query().wheres.length, 0);
    });
  });

  describe('hasTimestamps', function() {

    it('will set the created_at and updated_at columns if true', function(ok) {
      var m = new (Bookshelf.Model.extend({hasTimestamps: true}))();
      m.sync = function() {
        equal(this.get('item'), 'test');
        equal(_.isDate(this.get('created_at')), true);
        equal(_.isDate(this.get('updated_at')), true);
        ok();
        return stubSync;
      };
      m.save({item: 'test'});
    });

    it('only sets the updated_at for existing models', function(ok) {
      var m1 = new (Bookshelf.Model.extend({hasTimestamps: true}))();
      m1.sync = function() {
        equal(this.get('item'), 'test');
        equal(_.isDate(this.get('updated_at')), true);
        ok();
        return stubSync;
      };
      m1.save({item: 'test'});
    });

    it('allows passing hasTimestamps in the options hash', function(ok) {
      var m = new Bookshelf.Model(null, {hasTimestamps: true});
      m.sync = function() {
        equal(this.get('item'), 'test');
        equal(_.isDate(this.get('created_at')), true);
        equal(_.isDate(this.get('updated_at')), true);
        ok();
        return stubSync;
      };
      m.save({item: 'test'});
    });

    it('allows custom keys for the created at & update at values', function(ok) {
      var m = new Bookshelf.Model(null, {hasTimestamps: ['createdAt', 'updatedAt']});
      m.sync = function() {
        equal(this.get('item'), 'test');
        equal(_.isDate(this.get('createdAt')), true);
        equal(_.isDate(this.get('updatedAt')), true);
        ok();
        return stubSync;
      };
      m.save({item: 'test'});
    });

    it('does not set created_at when {method: "update"} is passed', function(ok) {
      var m = new Bookshelf.Model(null, {hasTimestamps: true});
      m.sync = function() {
        equal(this.get('item'), 'test');
        equal(_.isDate(this.get('created_at')), false);
        equal(_.isDate(this.get('updated_at')), true);
        ok();
        return stubSync;
      };
      m.save({item: 'test'}, {method: 'update'});
    });

  });

  describe('timestamp', function() {

    it('will set the `updated_at` attribute to a date, and the `created_at` for new entries', function() {
      var m  = new Bookshelf.Model();
      var m1 = new Bookshelf.Model({id: 1});
      var ts  = m.timestamp();
      var ts2 = m1.timestamp();
      equal(_.isDate(ts.created_at), true);
      equal(_.isDate(ts.updated_at), true);
      equal(_.isEmpty(ts2.created_at), true);
      equal(_.isDate(ts2.updated_at), true);
    });
  });

  describe('resetQuery', function() {

    it('deletes the `_builder` property, resetting the model query builder', function() {
      var m = new Bookshelf.Model().query('where', {id: 1});
      equal(m.query().wheres.length, 1);
      m.resetQuery();
      equal(m.query().wheres.length, 0);
    });
  });

  describe('defaults', function() {

    it('assigns defaults on save, rather than initialize', function(ok) {
      var Item = Bookshelf.Model.extend({defaults: {item: 'test'}});
      var item = new Item({newItem: 'test2'});
      deepEqual(item.toJSON(), {newItem: 'test2'});
      item.sync = function() {
        deepEqual(this.toJSON(), {id: 1, item: 'test', newItem: 'test2'});
        ok();
        return stubSync;
      };
      item.save({id: 1});
    });

    it('only assigns defaults when creating a model, unless {defaults: true} is passed in the save options', function(ok) {
      var Item = Bookshelf.Model.extend({defaults: {item: 'test'}});
      var item = new Item({id: 1, newItem: 'test2'});
      deepEqual(item.toJSON(), {id: 1, newItem: 'test2'});
      item.sync = function() {
        deepEqual(this.toJSON(), {id: 1, newItem: 'test2'});
        return stubSync;
      };
      item.save();
      item.sync = function() {
        deepEqual(this.toJSON(), {id: 2, item: 'test', newItem: 'test2'});
        ok();
        return stubSync;
      };
      item.save({id: 2}, {defaults: true});
    });

  });

  describe('sync', function() {

    it('creates a new instance of Bookshelf.Sync', function(){
      var model = new Bookshelf.Model();
      equal((model.sync(model) instanceof Bookshelf.Sync), true);
    });
  });

  describe('isNew', function() {

    it('uses the idAttribute to determine if the model isNew', function(){
      var model = new Bookshelf.Model();
      model.id = 1;
      equal(model.isNew(), false);
      delete model.id;
      equal(model.isNew(), true);
    });

  });

  describe('previous, previousAttributes', function() {

    it('will return the previous value of an attribute the last time it was synced', function(ok) {
      var count = 0;
      var model = new Models.Site({id: 1});
      model.on('change', function() {
        count++;
      });
      equal(model.previous('id'), void 0);
      model.fetch().then(function() {
        deepEqual(model.previousAttributes(), {id: 1, name: 'knexjs.org'});
        deepEqual(model.changed, {});
        model.set('id', 2);
        equal(model.previous('id'), 1);
        deepEqual(model.changed, {id: 2});
        model.set('id', 1);
        equal(count, 1);
        ok();
      }).then(null, ok);

    });

  });

  describe('hasChanged', function(ok) {

    var site = new Models.Site({name: 'Third Site'});
    equal(site.hasChanged('name'), true);
    deepEqual(site.changed, {name: 'Third Site'});
    site.fetch().then(function() {
      deepEqual(site.hasChanged, {});
    });

  });

};