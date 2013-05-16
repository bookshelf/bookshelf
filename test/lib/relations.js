var When      = require('when');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

// Data
module.exports = function(Bookshelf, handler) {

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

  // Collections
  var Sites    = Collections.Sites;
  var Admins   = Collections.Admins;
  var Blogs    = Collections.Blogs;
  var Posts    = Collections.Posts;
  var Comments = Collections.Comment;

  describe('Bookshelf Relations', function() {

    describe('Standard Relations - Models', function() {

      it('handles belongsTo', function(ok) {

        var responses = [];

        new Blog({id: 4})
          .fetch()
          .then(function(model) {
            responses.push({blog: model.toJSON()});
            return model.site().fetch();
          })
          .then(function(site) {
            responses.push({site: site.toJSON()});
            return responses;
          })
          .then(handler(ok), ok);
      });

      it('handles hasMany', function(ok) {
        new Blog({id: 1})
          .fetch()
          .then(function(model) {
            return model.posts().fetch();
          })
          .then(handler(ok), ok);
      });

      it('handles hasOne', function(ok) {
        new Site({id: 1})
          .meta()
          .fetch()
          .then(handler(ok), ok);
      });

      it('handles belongsToMany', function(ok) {
        new Author({id: 1})
          .posts()
          .fetch()
          .then(handler(ok), ok);
      });

    });

    describe('Eager Loading - Models', function() {

      it('eager loads "hasOne" relationships correctly', function(ok) {
        new Site({id: 1}).fetch({
          withRelated: ['meta']
        }).then(handler(ok), ok);
      });

      it('eager loads "hasMany" relationships correctly', function(ok) {
        new Site({id: 1}).fetch({
          withRelated: ['authors', 'blogs']
        }).then(handler(ok), ok);
      });

      it('eager loads "belongsTo" relationships correctly', function(ok) {
        new Blog({id: 3}).fetch({
          withRelated: ['site']
        }).then(handler(ok), ok);
      });

      it('Throws an error if you try to fetch a related object without the necessary key', function(ok) {
        new Blog({id: 1}).site().fetch().then(null, function() {
          ok();
        });
      });

      it('eager loads "belongsToMany" models correctly', function(ok) {
        new Post({id: 1}).fetch({
          withRelated: ['tags']
        }).then(handler(ok), ok);
      });

    });

    describe('Eager Loading - Collections', function() {

      it('eager loads "hasOne" models correctly', function(ok) {
        new Sites().fetch({
          withRelated: ['admins']
        }).then(handler(ok), ok);
      });

      it('eager loads "belongsTo" models correctly', function(ok) {
        new Blogs().fetch({
          withRelated: ['site']
        }).then(handler(ok), ok);
      });

      it('eager loads "hasMany" models correctly', function(ok) {
        new Site({id: 1}).fetch({
          withRelated: ['blogs']
        }).then(handler(ok), ok);
      });

      it('eager loads "belongsToMany" models correctly', function(ok) {
        new Posts()
          .query('where', 'blog_id', '=', 1)
          .fetch({
            withRelated: ['tags']
          })
          .then(handler(ok), ok);
      });

    });

    describe('Nested Eager Loading - Models', function() {

      it('eager loads "hasMany" -> "hasMany"', function(ok) {
        new Site({id: 1}).fetch({
          withRelated: ['authors.ownPosts']
        }).then(handler(ok), ok);
      });

      it('eager loads "hasMany" -> "belongsToMany"', function(ok) {
        new Site({id: 1}).fetch({
          withRelated: ['authors.posts']
        }).then(handler(ok), ok);
      });

      it('does multi deep eager loads', function(ok) {
        new Site({id: 1}).fetch({
          withRelated: ['authors.ownPosts', 'authors.site', 'blogs.posts']
        }).then(handler(ok), ok);
      });

    });

    describe('Nested Eager Loading - Collections', function() {

      it('eager loads "hasMany" -> "hasMany"', function(ok) {
        var site = new Sites();
        site.fetch({
          withRelated: ['authors.ownPosts']
        }).then(handler(ok), ok);
      });

    });

    describe('Model & Collection - load', function() {

      it('eager loads relations on a populated model', function(ok) {
        new Site({id: 1}).fetch().then(function(m) {
          return m.load(['blogs', 'authors.site']);
        }).then(handler(ok), ok);
      });

      it('eager loads attributes on a collection', function(ok) {
        new Sites().fetch().then(function(c) {
          return c.load(['blogs', 'authors.site']);
        }).then(handler(ok), ok);
      });
    });

    describe('Pivot Tables', function() {

      it('provides "attach" for creating or attaching records', function(ok) {

        var admin1 = new Admin({username: 'syncable', password: 'test'});
        var admin2 = new Admin({username: 'syncable', password: 'test'});

        When.all([admin1.save(), admin2.save()])
          .then(function() {
            return When.all([
              new Site({id: 1}).admins().attach([admin1, admin2]),
              new Site({id: 2}).admins().attach(admin2)
            ]);
          })
          .then(function(resp) {
            return When.all([
              new Site({id: 1}).admins().fetch().then(function(c) {
                equal(c.at(0).has('pivot_item'), true);
                equal(c.length, 2);
              }),
              new Site({id: 2}).admins().fetch().then(function(c) {
                equal(c.length, 1);
              })
            ]);
          })
          .then(function(resp) {
            return When.all([
              new Site({id: 1}).admins().detach().then(function(c) {
                equal(c.length, 0);
              }),
              new Site({id: 2}).admins().detach().then(function(c) {
                equal(c.length, 0);
              })
            ]).then(function() {
              ok();
            });
          })
          .then(null, function(e) {
            console.log(e.stack);
          });
      });

    });

  });

};