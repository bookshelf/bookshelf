var Shelf  = require('../bookshelf');
var assert = require('assert');
var Q      = require('q');

describe('Bookshelf.Relation', function () {

  // ----------------------------------
  // Begin Relation Setup:
  // ---------------------------------- 

  var SiteMeta = Shelf.Model.extend({
    tableName: 'sitesmeta',
    site: function () {
      return this.belongsTo(Site);
    }
  });

  var Site = Shelf.Model.extend({
    tableName: 'sites',
    defaults: {
      name: 'Your Cool Site'
    },
    authors: function () { 
      return this.hasMany(Author);
    },
    blogs: function () { 
      return this.hasMany(Blog); 
    },
    meta: function () {
      return this.hasOne(SiteMeta);
    },
    admins: function () {
      return this.belongsToMany(Admin).withPivot({item: 'pivot_item'});
    }
  });

  var Sites = Shelf.Collection.extend({
    model: Site
  });

  var Admin = Shelf.Model.extend({
    tableName: 'admins'
  });

  var Admins = Shelf.Collection.extend({
    model: Admin
  });

  // Author of a blog post.
  var Author = Shelf.Model.extend({
    tableName: 'authors',
    site: function () { 
      return this.belongsTo(Site); 
    },
    posts: function () { 
      return this.belongsToMany(Post); 
    },
    ownPosts: function () { 
      return this.hasMany(Post, 'owner_id'); 
    }
  });

  // A blog for a site.
  var Blog = Shelf.Model.extend({
    tableName: 'blogs',
    defaults: {
      title: ''
    },
    site: function () {
      return this.belongsTo(Site); 
    },
    posts: function () {
      return this.hasMany(Post);
    },
    validate: function (attrs) {
      if (!attrs.title) return 'A title is required.';
    }
  });

  var Blogs = Shelf.Collection.extend({
    model: Blog
  });

  // An individual post on a blog.
  var Post = Shelf.Model.extend({
    tableName: 'posts',
    defaults: {
      author: '',
      title: '',
      body: '',
      published: false
    },
    hasTimestamps: true,
    blog: function () { 
      return this.belongsTo(Blog); 
    },
    authors: function () { 
      return this.belongsToMany(Author);
    },
    tags: function () { 
      return this.belongsToMany(Tag); 
    },
    comments: function () { 
      return this.hasMany(Comment); 
    }
  });

  var Posts = Shelf.Collection.extend({
    model: Post
  });

  var Tag = Shelf.Model.extend({
    tableName: 'tags',
    posts: function () { 
      return this.belongsToMany(Post); 
    }
  });

  var Comment = Shelf.Model.extend({
    tableName: 'comments',
    defaults: {
      email: '',
      post: ''
    },
    posts: function () {
      return this.belongsTo(Post);
    }
  });

  // ----------------------------------
  // END SETUP
  // ---------------------------------- 

  describe('Standard Relations - Models', function () {

    it('handles belongsTo', function (done) {
      var blog = new Blog({id: 4});
      blog.fetch().then(function (resp) {
        var site = blog.site();
        assert.deepEqual(blog.toJSON(), {id: 4, site_id: 2, name: 'Alternate Site Blog'});
        site.fetch().then(function (resp) {
          assert.deepEqual(site.toJSON(), {id: 2, name: 'bookshelfjs.org'});
          done();
        }, done);
      });
    });

    it('handles hasMany', function (done) {
      var blog = new Blog({id: 1});
      blog.fetch().then(function () {
        var posts = blog.posts();
        posts.fetch().then(function () {
          done();
        });
      }, done);
    });

    it('handles hasOne', function (done) {
      var siteMeta = new Site({id: 1}).meta();
      siteMeta.fetch().then(function () {
        done();
      }, done);
    });

    it('handles belongsToMany', function (done) {
      var posts = new Author({id: 1}).posts();
      posts.fetch().then(function () {
        done();
      }, done);
    });

  });


  describe('Eager Loading - Models', function () {

    it('eager loads "hasOne" relationships correctly', function (done) {
      var site = new Site({id: 1});
      site.fetch({
        withRelated: ['admins']
      }).then(function () {
        done();
      }, done);
    });

    it('eager loads "hasMany" relationships correctly', function (done) {
      var site = new Site({id: 1});
      site.fetch({
        withRelated: ['authors', 'blogs']
      }).then(function () {
        done();
      }, done);
    });

    it('eager loads "belongsTo" relationships correctly', function (done) {
      var blog = new Blog({id: 1});
      blog.fetch({
        withRelated: ['site']
      }).then(function () {
        done();
      }, done);
    });

    it('eager loads "belongsToMany" models correctly', function (done) {
      var post = new Post({id: 1});
      post.fetch({
        withRelated: ['tags']
      }).then(function () {
        done();
      }, done);
    });

  });

  describe('Eager Loading - Collections', function () {

    it('eager loads "hasOne" models correctly', function (done) {
      var sites = new Sites();
      sites.fetch({
        withRelated: ['admins']
      }).then(function () {
        done();
      }, done);
    });

    it('eager loads "belongsTo" models correctly', function (done) {
      var blogs = new Blogs();
      blogs.fetch({
        withRelated: ['site']
      }).then(function () {
        done();
      }, done);
    });

    it('eager loads "hasMany" models correctly', function (done) {
      var site = new Site({id: 1});
      site.fetch({
        withRelated: ['blogs']
      }).then(function () {
        done();
      }, done);
    });

    it('eager loads "belongsToMany" models correctly', function (done) {
      var posts = new Posts().query('where', 'blog_id', '=', 1);
      posts.fetch({
        withRelated: ['tags']
      }).then(function () {
        done();
      }, done);
    });

  });

  describe('Nested Eager Loading - Models', function () {
    
    it('eager loads "hasMany" -> "hasMany"', function (done) {
      var site = new Site({id: 1});
      site.fetch({
        withRelated: ['authors.ownPosts']
      }).then(function () {
        done();
      }, done);
    });

    it('does multi deep eager loads', function (done) {
      var site = new Site({id: 1});
      site.fetch({
        withRelated: ['authors.ownPosts', 'authors.site', 'blogs.posts']
      }).then(function () {
        done();
      }, done);
    });

    it('eager loads "hasMany" -> "belongsToMany"', function (done) {
      var site = new Site({id: 1});
      site.fetch({
        withRelated: ['authors.posts']
      }).then(function () {
        done();
      }, done);
    });

  });

  describe('Nested Eager Loading - Collections', function () {

    it('eager loads "hasMany" -> "hasMany"', function (done) {
      var site = new Sites();
      site.fetch({
        withRelated: ['authors.ownPosts']
      }).then(function () {
        done();
      }, done);
    });

  });

  describe('Model & Collection - load', function () {

    it('eager loads relations on a populated model', function (done) {
      var site = new Site({id: 1});
      site.fetch().then(function () {
        site.load(['blogs', 'authors.site']).then(function () {
          done();
        }, done);
      }, done);
    });

    it('eager loads attributes on a collection', function (done) {
      var sites = new Sites();
      sites.fetch().then(function () {
        sites.load(['blogs', 'authors.site']).then(function () {
          done();
        }, done);
      }, done);
    });
  });

  describe('Pivot Tables', function () {

    describe('attach', function () {

      it('provides "attach" for creating or attaching records', function (done) {

        var admin1 = new Admin({username: 'syncable', password: 'test'});
        var admin2 = new Admin({username: 'syncable', password: 'test'});
        Q.all([admin1.save(), admin2.save()]).spread(function () {
          return Q.all([
            new Site({id: 1}).admins().attach([admin1, admin2]),
            new Site({id: 2}).admins().attach(admin2)
          ]);
        }).then(function (resp) {
          return new Site({id: 1}).admins().fetch();
        }).then(function (resp) {
          return new Site({id: 1}).admins().detach();
        }).then(function () {
          return new Site({id: 1}).admins().fetch(); 
        })
        .fail(function () {
          done();
        });

      });

    });

  });

});