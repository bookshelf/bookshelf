var Q = require('q');
var _ = require('underscore');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

var Bookshelf = require('../bookshelf');
var Backbone  = Bookshelf.Backbone;
var Models    = require('./data/objects').Models;

var stubSync = {
  first:  function() { return {}; },
  select: function() { return {}; },
  insert: function() { return {}; },
  update: function() { return {}; },
  del:    function() { return {}; }
};

describe('Bookshelf.Model', function() {
  
  // var base;
  // var Base = Bookshelf.Model.extend({
  //   tableName: 'authors'
  // });

  // beforeEach(function() {
  //   if (base) base.off();
  //   base = new Base();
  // });

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

    it('Prevents invalid attributes on new object creation, unless {guard: false} is passed', function() {
      var Test = Bookshelf.Model.extend({guarded: ['password']});
      var x = new Test({name: 'test', password: '123'});
      equal(x.get('name'), 'test');
      equal(x.get('password'), void 0);
      var y = new Test({name: 'test', password: '123'}, {guard: false});
      equal(y.get('name'), 'test');
      equal(y.get('password'), '123');
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

  describe('convert', function() {

    it('properly handles the inheritance chain', function() {
      var One = Backbone.Model.extend({
        customMethod: function(val) { return val || 1; }
      });
      var Two = One.extend({
        secondMethod: function(val) { return One.prototype.customMethod.call(this, val || 2); }
      });
      var Three = Two.extend({
        thirdCustomMethod: function() { return this.secondMethod(3); }
      });
      var Converted = Bookshelf.Model.convert(Three, {
        test: function() {
          equal(this.thirdCustomMethod(Converted), 3);
          equal(this.secondMethod(), 2);
          equal(this.customMethod(), 1);
        }
      });
      new Converted().test();
    });
    
    it('breaks on invalid object conversions', function() {
      var Invalid = function() {};
          Invalid.prototype = {testMethod: function() {}};
      try {
        Bookshelf.Model.convert(Invalid, {newMethod: function() {}});
      } catch (e) {
        equal(e.toString(), 'Error: Only Backbone objects may be converted.');
      }
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

  describe('set, fillable, guarded', function() {
    var model;
    beforeEach(function(){
      var Model = Bookshelf.Model.extend({
        fillable: ['name', 'role'],
        guarded:  ['role']
      });
      model = new Model();
    });
    afterEach(function() { model.off(); });

    it('is an array, with the list of whitelisted attributes', function() {
      equal(_.isArray(model.fillable), true);
    });

    it('should only allow the mass assignment of the specified items', function() {
      model.set({name: 'Tim', role: 'admin'});
      deepEqual(model.toJSON(), {name: 'Tim'});
    });

    it('should override fillable with guarded', function() {
      model.set({name: 'Tim', role: 'user'});
      equal(model.has('role'), false);
    });

    it('assign guarded or protected items without mass assignment', function() {
      model.set({name: 'Tim', 'role': 'admin'});
      model.set('role', 'admin');
      equal(model.get('role'), 'admin');
    });

    it('should trigger an inaccessible event on a guarded mass-assignment', function() {
      var output = [];
      model.on('inaccessible', function() { output = arguments; });
      model.set({name: 'Tim', role: 'admin'});
      equal(output[0], (model));
      deepEqual(output[1], {role: 'admin'});
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
      equal(qb.wheres.length, (0));
      var q = model.query('where', {id:1});
      equal(q, (model));
      equal(qb.wheres.length, (1));
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
      new ParsedSite({id: 1}).fetch().then(function(model) {
        equal(model.get('name').indexOf('Test: '), 0);
        ok();
      });
    });

    it('parses the model attributes on creation if {parse: true} is passed', function() {
      var one = new ParsedSite({name: 'Site'});
      equal(one.get('name'), 'Site');
      var two = new ParsedSite({name: 'Site'}, {parse: true});
      equal(two.get('name'), 'Test: Site');
    });

  });

  describe('fetch', function() {

    var Site = Models.Site;

    it('issues a first (get one) to Knex, returning a promise', function(ok) {

      new Site({id: 1}).fetch().then(function(model) {
        equal(model.get('id'), 1);
        equal(model.get('name'), 'knexjs.org');
        ok();
      }).done();

    });

    it('accepts succeess & error options, similar to standard Backbone', function(ok) {
      var count = 0;
      new Site().set({id: 1}).fetch({
        success: function() {
          count++;
        }
      }).then(function() {
        return new Site({id: 10}).fetch({
          error: function() {
            count++;
          }
        });
      })
      .then(function() {
        equal(count, 2);
        ok();
      });
    });

    it('triggers an "emptyResponse" error event when no records are found on set or save', function(ok) {
      var site = new Site().set({id: 10});
      site.on('error', function(model, msg, options) { 
        deepEqual(site, model);
        equal("emptyResponse", msg);
        ok();
      });
      site.fetch();
    });

  });

  describe('save', function() {

    var Site = Models.Site;

    it('saves an new object', function(ok) {
      new Site({name: 'Third Site'}).save().then(function() {
        return new Bookshelf.Collection(null, {model: Site}).fetch();
      })
      .then(function(c) {
        equal(c.last().id, 3);
        equal(c.last().get('name'), 'Third Site');
        equal(c.length, 3);
        ok();
      }).done();
    });

    it('updates an existing object', function(ok) {
      new Site({id: 3, name: 'Third Site Updated'}).save()
      .then(function() {
        return new Bookshelf.Collection(null, {model: Site}).fetch();
      })
      .then(function(c) {
        equal(c.last().id, 3);
        equal(c.last().get('name'), 'Third Site Updated');
        equal(c.length, 3);
        ok();
      }).done();
    });

    it('allows passing a method to save, to call insert or update explicitly', function(ok) {
      new Site({id: 4, name: 'Fourth site, explicity created'}).save(null, {method: 'insert'})
      .then(function() {
        return new Bookshelf.Collection(null, {model: Site}).fetch();
      })
      .then(function(c) {
        equal(c.length, 4);
        equal(c.last().id, 4);
        equal(c.last().get('name'), 'Fourth site, explicity created');
        ok();
      }).done();
    });

  });

  describe('destroy', function() {

    var Site = Models.Site;

    it('issues a delete to the Knex, returning a promise', function(ok) {
      new Site({id:4}).destroy().then(function() {
        return new Bookshelf.Collection(null, {model: Site}).fetch();
      })
      .then(function(c) {
        equal(c.length, 3);
        ok();
      })
      .done();
    });

    it('fails if no idAttribute or wheres are defined on the model.', function(ok) {
      new Site().destroy().then(null, function(e) {
        equal(e.toString(), 'A model cannot be destroyed without a "where" clause or an idAttribute.');
        ok();
      }).done();
    });

    it('triggers a destroy event on the model', function(ok) {
      var m = new Site({id: 3});
      m.on('destroy', function() {
        m.off();
        ok();
      });
      m.destroy();
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
      m.save({item: 'test'}).done();
    });

    it('only sets the updated_at for existing models', function(ok) {
      var m1 = new (Bookshelf.Model.extend({hasTimestamps: true}))();
      m1.sync = function() {
        equal(this.get('item'), 'test');
        equal(_.isDate(this.get('updated_at')), true);
        ok();
        return stubSync;
      };
      m1.save({item: 'test'}).done();
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
      m.save({item: 'test'}).done();
    });
  });

  describe('timestamp', function() {

    it('will set the `updated_at` attribute to a date, and the `created_at` for new entries', function() {
      var m  = new Bookshelf.Model();
      var m1 = new Bookshelf.Model({id: 1});
      m.timestamp();
      m1.timestamp();
      equal(_.isDate(m.get('created_at')), true);
      equal(_.isDate(m.get('updated_at')), true);
      equal(_.isEmpty(m1.get('created_at')), true);
      equal(_.isDate(m1.get('updated_at')), true);
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
      var item = new Item({id: 1});
      deepEqual(item.toJSON(), {id: 1});
      item.sync = function() {
        deepEqual(this.toJSON(), {id: 1, item: 'test'});
        ok();
        return stubSync;
      };
      item.save().done();
    });
  
  });


  describe('validate / isValid', function() {
    
    var model;

    beforeEach(function() {
      model = new (Bookshelf.Model.extend({
        item: 'test',
        validate: function() {
          return 'this is an error';
        }
      }))();
    });

    it('will fail if a non-true, non empty value is returned', function(ok) {
      model.isValid().then(null, function() {
        ok();
      }).done();
    });

    it('will fail if a non-true, non empty value is returned', function(ok) {
      model.save('tim', 'test').fail(function() {
        ok();
      });
    });

    it('keeps the context of the model', function(ok) {
      model = new (Bookshelf.Model.extend({
        item: 'test',
        validate: function() {
          equal(this.item, 'test');
        }
      }))();
      model.isValid().then(function() {
        ok();
      }).done();
    });

    it('accepts a deferrred object', function() {
      model = new (Bookshelf.Model.extend({
        item: 'test',
        validate: function () {
          var dfd = Q.defer();
          setTimeout(function () {
            dfd.resolve('Passes isValid');
          }, 100);
          return dfd.promise;
        }
      }))();
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

  describe('sync', function() {

    it('creates a new instance of Bookshelf.Sync', function(){
      var model = new Bookshelf.Model();
      equal((model.sync(model) instanceof Bookshelf.Sync), true);
    });
  });  

});