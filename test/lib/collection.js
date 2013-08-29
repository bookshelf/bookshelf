var _ = require('underscore');
var when = require('when');

var ok        = require('assert').ok;
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

module.exports = function(Bookshelf, handler) {

  var Backbone = Bookshelf.Backbone;

  var Models      = require('../shared/objects')(Bookshelf).Models;
  var Collections = require('../shared/objects')(Bookshelf).Collections;

  // Models
  var Site     = Models.Site;
  var SiteMeta = Models.SiteMeta;
  var Admin    = Models.Admin;
  var Author   = Models.Author;
  var Blog     = Models.Blog;
  var Post     = Models.Post;
  var Comment  = Models.Comment;
  var Tag      = Models.Tag;
  var User     = Models.User;
  var Role     = Models.Role;
  var Photo    = Models.Photo;

  // Collections
  var Sites    = Collections.Sites;
  var Admins   = Collections.Admins;
  var Blogs    = Collections.Blogs;
  var Posts    = Collections.Posts;
  var Comments = Collections.Comment;
  var Photos   = Collections.Photos;


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

  describe('forge', function() {

    it('should create a new collection instance', function() {
      var User = Bookshelf.Model.extend({
        tableName: 'users'
      });
      var Users = Bookshelf.Collection.extend({
        model: User
      });
      var users = Users.forge();
      equal(users.tableName(), 'users');
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
      Bookshelf.Collection.extend({tableName: 'posts'})
        .forge()
        .fetch()
        .then(handler(this, ok), ok);
    });

  });

  describe('fetchOne', function() {

    it ('fetches a single model from the collection', function (ok) {

      new Site({id:1})
        .authors()
        .fetchOne()
        .then(function(model) {
          model.get('site_id', 1);
          ok();
        }, ok);
    });

    it ('maintains a clone of the query builder from the current collection', function (ok) {

      new Site({id:1})
        .authors()
        .query({where: {id: 40}})
        .fetchOne()
        .then(function(model) {
          if (model === null) {
            ok();
          }
        }, ok);
    });

    it ('follows the typical model options, like require: true', function (ok) {

      new Site({id:1})
        .authors()
        .query({where: {id: 40}})
        .fetchOne({require: true})
        .then(null, function() {
          ok();
        });
    });

  });

  describe('sync', function() {

    it('creates a new instance of Bookshelf.Sync', function(){
      var model = new Bookshelf.Model();
      equal((model.sync(model) instanceof Bookshelf.Sync), true);
    });
  });

  describe('create', function() {

    it('creates and saves a new model instance, saving it to the collection', function (ok) {

      new Sites().create({name: 'google.com'}).then(function(model) {
        equal(model.get('name'), 'google.com');
        return model.destroy().then(function() {
          ok();
        });
      }, ok);

    });

    it('should populate a `hasMany` or `morphMany` with the proper keys', function(ok) {

      new Site({id: 10})
        .authors()
        .create({first_name: 'test', last_name: 'tester'})
        .then(function(author) {
          equal(author.get('first_name'), 'test');
          equal(author.get('last_name'), 'tester');
          equal(author.get('site_id'), 10);
          return author.destroy();
        })
        .then(function() {
          return new Site({id: 10})
            .photos()
            .create({
              url: 'http://image.dev',
              caption: 'this is a test image'
            })
            .then(function(photo) {
              equal(photo.get('imageable_id'), 10);
              equal(photo.get('imageable_type'), 'sites');
              equal(photo.get('url'), 'http://image.dev');
            });
        })
        .then(function() {
          ok();
        }, ok);
    });

    it('should automatically create a join model when joining a belongsToMany', function (ok) {

      new Site({id: 1})
        .admins()
        .create({username: 'test', password: 'test'})
        .then(function(admin) {
          equal(admin.get('username'), 'test');
          ok();
        }, function(e) {
          console.log(e);
          ok();
        });

    });

    it('should maintain the correct constraints when creating a model from a relation', function(ok) {

      var authors = new Site({id: 1}).authors();
      var query   = authors.query();

      query.then = function(onFufilled, onRejected) {

        deepEqual(_.object(this.values[0]), {
          site_id: 1,
          first_name: 'Test',
          last_name: 'User'
        });

        return when.resolve(this.toString()).then(onFufilled, onRejected);
      };

      authors
        .create({first_name: 'Test', last_name: 'User'})
        .then(function(model) {
          ok();
        });

    });


  });

};