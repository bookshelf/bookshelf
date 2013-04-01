
var Bookshelf = require('../bookshelf');
var Backbone = Bookshelf.Backbone;

var _ = require('underscore');
var Q = require('q');

var assert    = require('assert');
var equal     = assert.equal;
var deepEqual = assert.deepEqual;

var stubSync = {
  first: function() { return {}; },
  select: function() { return {}; },
  insert: function() { return {}; },
  update: function() { return {}; },
  del: function() { return {}; }
};

describe('Bookshelf.Model', function() {
  
  var base;
  var Base = Bookshelf.Model.extend({
    tableName: 'authors'
  });

  beforeEach(function() {
    if (base) base.off();
    base = new Base();
  });

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

    it('returns the Knex builder when no arguments are passed', function() {
      equal((base.query() instanceof Bookshelf.Knex.Builder), true);
    });

    it('calls Knex builder method with the first argument, returning the model', function() {
      var q = base.query('where', {id:1});
      equal(q, (base));
    });

    it('passes along additional arguments to the Knex method in the first argument', function() {
      var qb = base.query();
      equal(qb.wheres.length, (0));
      var q = base.query('where', {id:1});
      equal(q, (base));
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

    it('includes the ', function() {

    });

  });

  describe('parse', function() {

    it('parses the model attributes on fetch');

    it('parses the model attributes on creation if {parse: true} is passed');

  });

  describe('fetch', function() {

    it('issues a first (get one) to Knex, returning a promise', function(ok) {

      base.set({id: 1}).fetch().then(function() {
        equal(base.get('first_name'), 'Tim');
        equal(base.get('last_name'), 'Griesser');
        ok();
      }).done();

    });

    it('accepts succeess & error options, similar to standard Backbone', function(ok) {
      var count = 0;
      base.set({id: 1}).fetch({
        success: function() {
          count++;
        }
      }).then(function() {
        return new Base({id: 10}).fetch({
          error: function() {
            count++;
          }
        });
      })
      .then(function() {
        ok();
      });
    });

    it('triggers an "emptyResponse" error event when no records are found on set or save', function(ok) {
      base.set({id: 10});
      base.on('error', function(model, msg, options) { 
        deepEqual(base, model);
        equal("emptyResponse", msg);
        ok();
      });
      base.fetch();
    });

  });

  describe('destroy', function() {

    it('issues a delete to the Knex, returning a promise');

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
        assert(true);
        ok();
      });
    });

    it('keeps the context of the model', function(ok) {
      model = new (Bookshelf.Model.extend({
        item: 'test',
        validate: function() {
          this.item === 'test';
          return true;
        }
      }))();
      model.isValid().then(function() {
        ok();
      }).done();
    });

    it('accepts a deferrred object', function () {

    });

  });

  describe('save', function() {

    it('saves an new object');

    it('updates an existing object');

    it('allows passing a method to save, to call insert or update explicitly');

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

    it('allows passing hasTimestamps in the options hash', function (ok) {
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

    it('will set the `updated_at` attribute to a date, and the `created_at` for new entries', function () {
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

});