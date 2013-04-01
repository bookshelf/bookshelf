var Bookshelf = require('../bookshelf');
var Backbone = Bookshelf.Backbone;

var _ = require('underscore');
var Q = require('q');

var assert    = require('assert');
var equal     = assert.equal;
var deepEqual = assert.deepEqual;

describe('Bookshelf.Collection', function() {

  describe('extend/constructor/initialize', function() {

    var Users = Bookshelf.Collection.extend({
      getData: function() { return 'test'; }
    }, {
      classMethod: function() { return 'test'; }
    });
    
    var SubUsers = Users.extend({
      otherMethod: function() { return this.getData(); }
    }, {
      classMethod2: function() { return 'test2'; }
    });

    it('can be extended', function() {
      var users = new Users();
      var subUsers = new SubUsers();
      equal(users.getData(), 'test');
      equal(subUsers.otherMethod(), 'test');
      equal(Users.classMethod(), 'test');
      equal(SubUsers.classMethod(), 'test');
      equal(SubUsers.classMethod2(), 'test2');
    });

    it('accepts a custom `constructor` property', function() {
      var Users = Bookshelf.Collection.extend({
        constructor: function() {
          this.item = 'test';
          Bookshelf.Collection.apply(this, arguments);
        }
      });
      equal(new Users().item, 'test');
    });
  });

  describe('convert', function() {

    it('properly handles the inheritance chain', function() {
      var One = Backbone.Collection.extend({
        customMethod: function(val) { return val || 1; }
      });
      var Two = One.extend({
        secondMethod: function(val) { return One.prototype.customMethod.call(this, val || 2); }
      });
      var Three = Two.extend({
        thirdCustomMethod: function() { return this.secondMethod(3); }
      });
      var Converted = Bookshelf.Collection.convert(Three, {
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
        Bookshelf.Collection.convert(Invalid, {newMethod: function() {}});
      } catch (e) {
        equal(e.toString(), 'Error: Only Backbone objects may be converted.');
      }
    });
  });

  describe('model', function() {
    
    it('does not permit polymorphic models', function(ok) {
      var Collection = Bookshelf.Collection.extend({
        model: function() { return new Bookshelf.Model(); }
      });
      try {
        new Collection([{id: 1}]);
      } catch (e) {
        equal(e.toString(), 'Error: Only Bookshelf Model constructors are allowed as the Collection#model attribute.');
        ok();
      }
    });
  });

  describe('tableName', function() {

    it('returns the `tableName` attribute off the `Collection#model` prototype', function() {
      var collection = new (Bookshelf.Collection.extend({
        model: Bookshelf.Model.extend({
          tableName: 'test'
        })
      }))();
      equal(collection.tableName(), 'test');
    });
  });

  describe('idAttribute', function() {

    it('returns the `tableName` attribute from the `Collection#model` prototype', function() {
      var collection = new (Bookshelf.Collection.extend({
        model: Bookshelf.Model.extend({
          idAttribute: 'test'
        })
      }))();
      equal(collection.idAttribute(), 'test');
    });
  });

  describe('fetch', function() {

  });

  describe('sync', function() {

  });

  describe('create', function() {

  });

  describe('parse', function() {

  });

});