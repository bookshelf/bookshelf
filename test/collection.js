var Bookshelf = require('../bookshelf');
var Backbone = Bookshelf.Backbone;

var _ = require('underscore');
var Q = require('q');

var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

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

    it('returns the `idAttribute` attribute from the `Collection#model` prototype', function() {
      var collection = new (Bookshelf.Collection.extend({
        model: Bookshelf.Model.extend({
          idAttribute: 'test'
        })
      }))();
      equal(collection.idAttribute(), 'test');
    });
  });

  describe('fetch', function() {
    
    it ('fetches the models in a collection', function (ok) {
      var Posts = Bookshelf.Collection.extend({
        tableName: 'posts'
      });
      var posts = new Posts();
      posts.fetch().then(function (collection) {
        equal(posts.length, 5);
        deepEqual(posts.at(0).keys(), ['id', 'owner_id', 'blog_id', 'name', 'content']);
        deepEqual(collection, posts);
        ok();
      }).done();
    });
  });

  describe('sync', function() {

    it('creates a new instance of Bookshelf.Sync', function(){
      var model = new Bookshelf.Model();
      equal((model.sync(model) instanceof Bookshelf.Sync), true);
    });
  });

  describe('create', function() {

  });

  describe('parse', function() {

  });

});