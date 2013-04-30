var Q         = require('q');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

// Data
var Models      = require('./data/objects').Models;
var Collections = require('./data/objects').Collections;

// Models
var Site     = Models.Site;
var SiteMeta = Models.SiteMeta;
var Admin    = Models.Admin;
var Author   = Models.Author;
var Blog     = Models.Blog;
var Post     = Models.Post;
var Comment  = Models.Comment;
var Tag      = Models.Tag;

// Collections
var Sites    = Collections.Sites;
var Admins   = Collections.Admins;
var Blogs    = Collections.Blogs;
var Posts    = Collections.Posts;
var Comments = Collections.Comment;

describe('Bookshelf Relations', function() {

  describe('Standard Relations - Models', function() {

    it('handles belongsTo', function(done) {
      new Blog({id: 4}).fetch().then(function(model) {
        deepEqual(model.toJSON(), {id: 4, site_id: 2, name: 'Alternate Site Blog'});
        model.site().fetch().then(function(site) {
          deepEqual(site.toJSON(), {id: 2, name: 'bookshelfjs.org'});
          done();
        }).done();
      });
    });

    it('handles hasMany', function(done) {
      new Blog({id: 1}).fetch().then(function(model) {
        return model.posts().fetch();
      }).then(function() {
        done();
      }).done();
    });

    it('handles hasOne', function(done) {
      new Site({id: 1}).meta().fetch().then(function() {
        done();
      }).done();
    });

    it('handles belongsToMany', function(done) {
      new Author({id: 1}).posts().fetch().then(function() {
        done();
      }).done();
    });

  });


  describe('Eager Loading - Models', function() {

    it('eager loads "hasOne" relationships correctly', function(done) {
      new Site({id: 1}).fetch({
        withRelated: ['meta']
      }).then(function() {
        done();
      }).done();
    });

    it('eager loads "hasMany" relationships correctly', function(done) {
      new Site({id: 1}).fetch({
        withRelated: ['authors', 'blogs']
      }).then(function() {
        done();
      }).done();
    });

    it('eager loads "belongsTo" relationships correctly', function(done) {
      new Blog({id: 1}).fetch({
        withRelated: ['site']
      }).then(function() {
        done();
      }).done();
    });

    it('eager loads "belongsToMany" models correctly', function(done) {
      new Post({id: 1}).fetch({
        withRelated: ['tags']
      }).then(function() {
        done();
      }).done();
    });

  });

  describe('Eager Loading - Collections', function() {

    it('eager loads "hasOne" models correctly', function(done) {
      new Sites().fetch({
        withRelated: ['admins']
      }).then(function() {
        done();
      }).done();
    });

    it('eager loads "belongsTo" models correctly', function(done) {
      new Blogs().fetch({
        withRelated: ['site']
      }).then(function() {
        done();
      }).done();
    });

    it('eager loads "hasMany" models correctly', function(done) {
      new Site({id: 1}).fetch({
        withRelated: ['blogs']
      }).then(function() {
        done();
      }).done();
    });

    it('eager loads "belongsToMany" models correctly', function(done) {
      new Posts().query('where', 'blog_id', '=', 1).fetch({
        withRelated: ['tags']
      }).then(function() {
        done();
      }).done();
    });

  });

  describe('Nested Eager Loading - Models', function() {
    
    it('eager loads "hasMany" -> "hasMany"', function(done) {
      new Site({id: 1}).fetch({
        withRelated: ['authors.ownPosts']
      }).then(function() {
        done();
      }).done();
    });

    it('eager loads "hasMany" -> "belongsToMany"', function(done) {
      new Site({id: 1}).fetch({
        withRelated: ['authors.posts']
      }).then(function() {
        done();
      }).done();
    });

    it('does multi deep eager loads', function(done) {
      new Site({id: 1}).fetch({
        withRelated: ['authors.ownPosts', 'authors.site', 'blogs.posts']
      }).then(function() {
        done();
      }).done();
    });

  });

  describe('Nested Eager Loading - Collections', function() {

    it('eager loads "hasMany" -> "hasMany"', function(done) {
      var site = new Sites();
      site.fetch({
        withRelated: ['authors.ownPosts']
      }).then(function() {
        done();
      }).done();
    });

  });

  describe('Model & Collection - load', function() {

    it('eager loads relations on a populated model', function(done) {
      new Site({id: 1}).fetch().then(function(m) {
        return m.load(['blogs', 'authors.site']);
      }).then(function(m) {
        done();
      }).done();
    });

    it('eager loads attributes on a collection', function(done) {
      new Sites().fetch().then(function(c) {
        return c.load(['blogs', 'authors.site']);
      }).then(function(c) {
        done();
      }).done();
    });
  });

  describe('Pivot Tables', function() {

    it('provides "attach" for creating or attaching records', function(done) {

      var admin1 = new Admin({username: 'syncable', password: 'test'});
      var admin2 = new Admin({username: 'syncable', password: 'test'});
      
      Q.all([admin1.save(), admin2.save()]).spread(function() {
        return Q.all([
          new Site({id: 1}).admins().attach([admin1, admin2]),
          new Site({id: 2}).admins().attach(admin2)
        ]);
      }).then(function(resp) {
        return new Site({id: 1}).admins().fetch();
      }).then(function(resp) {
        return new Site({id: 1}).admins().detach();
      }).then(function() {
        return new Site({id: 1}).admins().fetch(); 
      }).then(function() {
        done();
      }).done();    
    
    });

  });

});