var _         = require('lodash');
var Promise   = global.testPromise;
var equal     = require('assert').equal;

module.exports = function(Bookshelf) {

  describe('Relations', function() {

    var output  = require('./output/Relations');
    var dialect = Bookshelf.knex.client.dialect;
    var json    = function(model) {
      return JSON.parse(JSON.stringify(model));
    };
    var checkTest = function(ctx) {
      return function(resp) {
        expect(json(resp)).to.eql(output[ctx.test.title][dialect].result);
      };
    };

    var objs        = require('./helpers/objects')(Bookshelf);
    var Relation    = objs.Relation;
    var Models      = objs.Models;

    // Models
    var Site         = Models.Site;
    var SiteMeta     = Models.SiteMeta;
    var Admin        = Models.Admin;
    var Author       = Models.Author;
    var Blog         = Models.Blog;
    var Post         = Models.Post;
    var Comment      = Models.Comment;
    var Tag          = Models.Tag;
    var User         = Models.User;
    var Role         = Models.Role;
    var Photo        = Models.Photo;
    var PhotoParsed  = Models.PhotoParsed;
    var Customer     = Models.Customer;
    var Instance     = Models.Instance;
    var Hostname     = Models.Hostname;

    var UserParsed = Models.UserParsed;
    var UserTokenParsed = Models.UserTokenParsed;

    describe('Bookshelf Relations', function() {

      describe('Standard Relations - Models', function() {

        it('handles belongsTo (blog, site)', function() {
          return new Blog({id: 4})
            .fetch()
            .then(function(model) {
              return model.site().fetch();
            }).then(checkTest(this));
        });

        it('handles hasMany (posts)', function() {
          return new Blog({id: 1})
            .fetch()
            .then(function(model) {
              return model.posts().fetch();
            })
            .then(checkTest(this));
        });

        it('handles hasOne (meta)', function() {
          return new Site({id: 1})
            .meta()
            .fetch()
            .then(checkTest(this));
        });

        it('handles belongsToMany (posts)', function() {
          return new Author({id: 1})
            .posts()
            .fetch()
            .then(checkTest(this));
        });

      });

      describe('Eager Loading - Models', function() {

        it('eager loads "hasOne" relationships correctly (site -> meta)', function() {
          return new Site({id: 1}).fetch({
            withRelated: ['meta']
          }).then(checkTest(this));
        });

        it('eager loads "hasMany" relationships correctly (site -> authors, blogs)', function() {
          return new Site({id: 1}).fetch({
            withRelated: ['authors', 'blogs']
          }).then(checkTest(this));
        });

        it('eager loads "belongsTo" relationships correctly (blog -> site)', function() {
          return new Blog({id: 3}).fetch({
            withRelated: ['site']
          }).then(checkTest(this));
        });

        // it('Throws an error if you try to fetch a related object without the necessary key', function() {
        //   return new Blog({id: 1}).site().fetch().should.be.rejected;
        // });

        it('eager loads "belongsToMany" models correctly (post -> tags)', function() {
          return new Post({id: 1}).fetch({
            withRelated: ['tags']
          }).then(checkTest(this));
        });

        it('Attaches an empty related model or collection if the `EagerRelation` comes back blank', function() {
          return new Site({id: 3}).fetch({
            withRelated: ['meta', 'blogs', 'authors.posts']
          }).then(checkTest(this));
        });

      });

      describe('Eager Loading - Collections', function() {

        it('eager loads "hasOne" models correctly (sites -> meta)', function() {
          return Site.fetchAll({
            withRelated: ['meta']
          }).then(checkTest(this));
        });

        it('eager loads "belongsTo" models correctly (blogs -> site)', function() {
          return Blog.fetchAll({
            withRelated: ['site']
          }).then(checkTest(this));
        });

        it('eager loads "hasMany" models correctly (site -> blogs)', function() {
          return new Site({id: 1}).fetch({
            withRelated: ['blogs']
          }).then(checkTest(this));
        });

        it('eager loads "belongsToMany" models correctly (posts -> tags)', function() {
          return Post.where('blog_id', 1).fetchAll({withRelated: ['tags']})
            .then(checkTest(this));
        });

      });

      describe('Nested Eager Loading - Models', function() {

        it('eager loads "hasMany" -> "hasMany" (site -> authors.ownPosts)', function() {
          return new Site({id: 1}).fetch({
            withRelated: ['authors.ownPosts']
          }).then(checkTest(this));
        });

        it('eager loads "hasMany" -> "belongsToMany" (site -> authors.posts)', function() {
          return new Site({id: 1}).fetch({
            withRelated: ['authors.posts']
          }).then(checkTest(this));
        });

        it('does multi deep eager loads (site -> authors.ownPosts, authors.site, blogs.posts)', function() {
          return new Site({id: 1}).fetch({
            withRelated: ['authors.ownPosts', 'authors.site', 'blogs.posts']
          }).then(checkTest(this));
        });

      });

      describe('Nested Eager Loading - Collections', function() {

        it('eager loads "hasMany" -> "hasMany" (sites -> authors.ownPosts)', function() {
          return Site.fetchAll({
            withRelated: ['authors.ownPosts']
          }).then(checkTest(this));
        });

      });

      describe('Model & Collection - load', function() {

        it('eager loads relations on a populated model (site -> blogs, authors.site)', function() {
          return new Site({id: 1}).fetch().tap(checkTest(this)).then(function(m) {
            return m.load(['blogs', 'authors.site']);
          });
        });

        it('eager loads attributes on a collection (sites -> blogs, authors.site)', function() {
          return Site.fetchAll().tap(checkTest(this)).then(function(c) {
            return c.load(['blogs', 'authors.site']);
          });
        });
      });

      describe('Pivot Tables', function() {

        beforeEach(function() {
          return Promise.all([
            new Site({id: 1}).admins().detach(),
            new Site({id: 2}).admins().detach()
          ]);
        });

        it('provides "attach" for creating or attaching records', function() {

          var site1  = new Site({id: 1});
          var site2  = new Site({id: 2});
          var admin1 = new Admin({username: 'syncable', password: 'test'});
          var admin2 = new Admin({username: 'syncable', password: 'test'});
          var admin1_id;

          return Promise.all([admin1.save(), admin2.save()])
            .then(function() {
              admin1_id = admin1.id;
              return Promise.all([
                site1.related('admins').attach([admin1, admin2]),
                site2.related('admins').attach(admin2)
              ]);
            })
            .then(function(resp) {
              expect(site1.related('admins')).to.have.length(2);
              expect(site2.related('admins')).to.have.length(1);
            }).then(function() {
              return Promise.all([
                new Site({id: 1}).related('admins').fetch().then(function(c) {
                  c.each(function(m) {
                    equal(m.hasChanged(), false);
                  });
                  equal(c.at(0).pivot.get('item'), 'test');
                  equal(c.length, 2);
                }),
                new Site({id: 2}).related('admins').fetch().then(function(c) {
                  equal(c.length, 1);
                })
              ]);
            })
            .then(function(resp) {
              return Promise.all([
                new Site({id: 1}).related('admins').fetch(),
                new Site({id: 2}).related('admins').fetch()
              ]);
            })
            .spread(function(admins1, admins2) {
              return Promise.all([
                admins1.detach(admin1_id).then(function(c) {
                  expect(admins1).to.have.length(1);
                  return c.fetch();
                }).then(function(c) {
                  equal(c.length, 1);
                }),
                admins2.detach().then(function(c) {
                  expect(admins2).to.have.length(0);
                  return c.fetch();
                }).then(function(c) {
                  equal(c.length, 0);
                })
              ]);
            });
        });

        it('keeps the attach method for eager loaded relations, #120', function() {
          var site1  = new Site({id: 1});
          var site2  = new Site({id: 2});
          var admin1 = new Admin({username: 'syncable', password: 'test'});
          var admin2 = new Admin({username: 'syncable', password: 'test'});
          var admin1_id;

          return Promise.all([admin1.save(), admin2.save(),
            site1.fetch({withRelated: 'admins'}), site2.fetch({withRelated: 'admins'})])
            .then(function() {
              admin1_id = admin1.id;
              return Promise.all([
                site1.related('admins').attach([admin1, admin2]),
                site2.related('admins').attach(admin2)
              ]);
            })
            .then(function(resp) {
              expect(site1.related('admins')).to.have.length(2);
              expect(site2.related('admins')).to.have.length(1);
            }).then(function() {
              return Promise.all([
                new Site({id: 1}).related('admins').fetch().then(function(c) {
                  c.each(function(m) {
                    equal(m.hasChanged(), false);
                  });
                  equal(c.at(0).pivot.get('item'), 'test');
                  equal(c.length, 2);
                }),
                new Site({id: 2}).related('admins').fetch().then(function(c) {
                  equal(c.length, 1);
                })
              ]);
            })
            .then(function(resp) {
              return Promise.all([
                new Site({id: 1}).related('admins').fetch(),
                new Site({id: 2}).related('admins').fetch()
              ]);
            })
            .spread(function(admins1, admins2) {
              return Promise.all([
                admins1.detach(admin1_id).then(function(c) {
                  expect(admins1).to.have.length(1);
                  return c.fetch();
                }).then(function(c) {
                  equal(c.length, 1);
                }),
                admins2.detach().then(function(c) {
                  expect(admins2).to.have.length(0);
                  return c.fetch();
                }).then(function(c) {
                  equal(c.length, 0);
                })
              ]);
            });
        });

      });

      describe('Updating pivot tables with `updatePivot`', function () {
        var admin1_id;
        var admin2_id;

        before(function () {
          var admin1 = new Admin({username: 'updatetest', password: 'test'});
          var admin2 = new Admin({username: 'updatetest2', password: 'test'});
          return Promise.all([admin1.save(),admin2.save()])
          .then(function (admin) {
            admin1_id = admin1.id;
            admin2_id = admin2.id;
            return (new Site({id: 1})).related('admins').attach([admin1, admin2]);
          });
        });

        after(function () {
          return new Site({id: 1}).admins().detach();
        });

        it('updates all rows inside the pivot table belonging to the current model', function() {
          var site1  = new Site({id: 1});
          return site1.admins()
            .updatePivot({item: 'allupdated'})
            .then(function (relation) {
              return relation.withPivot(['item']).fetch().then(function (col) {
                equal(col.get(admin1_id).pivot.get('item'), 'allupdated');
                equal(col.get(admin2_id).pivot.get('item'), 'allupdated');
              });
            });

        });

        it('updates all rows, which match the passed in query-criteria', function() {
          var site1  = new Site({id: 1});
          return site1.admins()
          .updatePivot({item: 'anotherupdate'}, {
            query: {
              whereIn: ['admin_id', [admin1_id]]
            }
          })
          .then(function (relation) {
            return relation.withPivot(['item']).fetch().then(function (col) {
              equal(col.get(admin1_id).pivot.get('item'), 'anotherupdate');
              equal(col.get(admin2_id).pivot.get('item'), 'allupdated');
            });
          });

        });

        it('throws an error if no columns are updated and `require: true` is passed as option', function() {
          // non-existent site
          return (new Site({id: 99999})).admins()
          .updatePivot({'item': 'testvalue'}, {require: true})
          .then(function (relation) {
            throw new Error('this should not happen');
          }).catch(function (err) {
            expect(err).to.be.ok;
            expect(err).to.be.an.instanceof(Error);
          });
        });

      });

      describe('Custom foreignKey & otherKey', function() {

        it('works with many-to-many (user -> roles)', function() {
          return new User({uid: 1})
            .roles()
            .fetch()
            .tap(checkTest(this));
        });

        it('works with eager loaded many-to-many (user -> roles)', function() {
          return new User({uid: 1})
            .fetch({withRelated: ['roles']})
            .tap(checkTest(this));
        });

      });

      describe('Polymorphic associations', function() {

        it('handles morphOne (photo)', function() {
          return new Author({id: 1})
            .photo()
            .fetch()
            .tap(checkTest(this));
        });

        it('handles morphMany (photo)', function() {
          return new Site({id: 1})
            .photos()
            .fetch().tap(checkTest(this));
        });

        it('handles morphTo (imageable "authors")', function() {
          return new Photo({imageable_id: 1, imageable_type: 'authors'})
            .imageable()
            .fetch().tap(checkTest(this));
        });

        it('handles morphTo (imageble "authors", PhotoParsed)', function() {
          return new PhotoParsed({imageable_id_parsed: 1, imageable_type_parsed: 'authors'})
            .imageableParsed()
            .fetch().tap(checkTest(this));
        });

        it('handles morphTo (imageable "sites")', function() {
          return new Photo({imageable_id: 1, imageable_type: 'sites'})
            .imageable()
            .fetch().tap(checkTest(this));
        });

        it('eager loads morphMany (sites -> photos)', function() {
          return new Site().fetchAll({withRelated: ['photos']}).tap(checkTest(this));
        });

        it('eager loads morphTo (photos -> imageable)', function() {
          return Photo.fetchAll({withRelated: ['imageable']}).tap(checkTest(this));
        });

        it('eager loads beyond the morphTo, where possible', function() {
          return Photo.fetchAll({withRelated: ['imageable.authors']}).tap(checkTest(this));
        });

      });

      describe('`through` relations', function() {

        it('handles hasMany `through`', function() {
          return new Blog({id: 1}).comments().fetch().tap(checkTest(this));
        });

        it('eager loads hasMany `through`', function() {
          return Blog.where({site_id: 1}).fetchAll({
            withRelated: 'comments'
          }).then(checkTest(this));
        });

        it('eager loads hasMany `through` using where / fetchAll', function() {
          return Blog.where('site_id', 1).fetchAll({withRelated: 'comments'}).then(checkTest(this));
        });

        it('handles hasOne `through`', function() {
          return new Site({id: 1}).info().fetch().tap(checkTest(this));
        });

        it('eager loads hasOne `through`', function() {
          return Site.where('id', '<', 3).fetchAll({
            withRelated: 'info'
          }).then(checkTest(this));
        });

        it('eager loads belongsToMany `through`', function() {
          return Author.fetchAll({withRelated: 'blogs'}).tap(checkTest(this));
        });

        it('eager loads belongsTo `through`', function() {
          return new Comment().fetchAll({withRelated: 'blog'}).tap(checkTest(this));
        });

      });

    });

    describe('Issue #63 - hasOne relations', function() {

      it('should return Customer (id=1) with settings', function () {

        var expected = {
          id      : 1,
          name    : 'Customer1',
          settings: {
            id : 1,
            Customer_id : 1,
            data : 'Europe/Paris'
          }
        };

        return new Customer({ id: 1 })
          .fetch({ withRelated: 'settings' })
          .then(function (model) {
            var cust = model.toJSON();
            expect(cust).to.eql(expected);
          });
      });

      it('should return Customer (id=4) with settings', function () {

        var expected = {
          id : 4,
          name : 'Customer4',
          settings: {
            id : 2,
            Customer_id : 4,
            data : 'UTC'
          }
        };

        return new Customer({ id: 4 })
          .fetch({ withRelated: 'settings' })
          .then(function (model) {
            var cust = model.toJSON();
            expect(cust).to.eql(expected);
          });
      });
    });

    describe('Issue #65, custom idAttribute with eager loaded belongsTo', function() {

      it('#65 - should eager load correctly for models', function() {

        return new Hostname({hostname: 'google.com'}).fetch({withRelated: 'instance'}).tap(checkTest(this));

      });

      it('#65 - should eager load correctly for collections', function() {

        return new Bookshelf.Collection([], {model: Hostname}).fetch({ withRelated: 'instance'}).tap(checkTest(this));

      });

    });

    describe('Issue #70 - fetching specific columns, and relations', function() {

      it('doesnt pass the columns along to sub-queries', function() {

        return new Author({id: 2})
          .fetch({
            withRelated: 'posts',
            columns: ['id', 'last_name']
          })
          .then(function(author) {

            expect(author.attributes.first_name).to.be.undefined;

            expect(author.related('posts').length).to.equal(2);

          });

      });

    });

    describe('Issue #77 - Using collection.create() on relations', function() {

      it('maintains the correct parent model references when using related()', function() {

        return new Site().fetch({withRelated: 'authors'}).then(function(site) {

          return site.related('authors').create({first_name: 'Dummy', last_name: 'Account'}).then(function(model) {

            expect(model.attributes).to.eql({first_name: 'Dummy', last_name: 'Account', site_id: site.id, id: model.id});

            expect(site.related('authors')).to.have.length(3);

          });

        });

      });

    });

    describe('Issue #97, #377 - Eager loading on parsed models', function() {

      it('correctly pairs eager-loaded models before parse()', function () {
        return Promise.all([
          new Blog({id: 1}).related('parsedPosts').fetch(),
          new Blog({id: 1}).fetch({ withRelated: 'parsedPosts' })
        ]).then(function (data) {
          var parsedPosts = data[0], blog = data[1];
          expect(blog.related('parsedPosts').length).to.equal(parsedPosts.length);
        });
      });

      it('parses eager-loaded models after pairing', function () {
        return new Blog({id: 1}).fetch({ withRelated: 'parsedPosts' })
          .then(function (blog) {
            var attrs = blog.related('parsedPosts').at(0).attributes;
            Object.keys(attrs).forEach(function (key) {
              expect(/_parsed$/.test(key)).to.be.true;
            });
          });
      });

      it('parses eager-loaded morphTo relations (model)', function () {
        return Photo.fetchAll({ withRelated: 'imageableParsed.meta', log: true })
          .then(function (photos) {
            photos.forEach(function(photo) {
              var attrs = photo.related('imageableParsed').attributes;
              Object.keys(attrs).forEach(function (key) {
                expect(/_parsed$/.test(key)).to.be.true;
              });
            });
          });
      });

      it('eager fetches belongsTo correctly on a dual parse', function() {
        return UserTokenParsed.forge({token: 'testing'}).fetch({
          withRelated: ['user']
        }).then(function (model) {
          expect(model.related('user').get('id')).to.equal(10);
        });
      });

      it('eager fetches belongsTo correctly on a dual parse', function() {
        return UserTokenParsed.forge({token: 'testing'}).fetch().then(function(model) {
          return model.load('user');
        }).then(function(model) {
          expect(model.related('user').get('id')).to.equal(10);
        });
      });


    });

    describe('Issue #212 - Skipping unnecessary queries', function () {
      var oldAuthorSync;
      var oldSiteSync;
      var siteSyncCount = 0;
      var author;

      beforeEach(function () {
        siteSyncCount = 0;
      });

      before(function () {
        Photo.prototype.sync = function () {
          return {
            first: function () {
              return Promise.resolve([{
                id:1,
                imageable_type: 'sites',
                imageable_id: null
              }]);
            }
          };
        };

        Author.prototype.sync = function () {
          return {
            select: function () {
              return Promise.resolve([{
                id:1,
                dummy: 'author'
              }]);
            },
            first: function () {
              return Promise.resolve([{
                id:1,
                first_name: 'Johannes',
                last_name: 'Lumpe',
                site_id: null
              }]);
            }
          };
        };

        Site.prototype.sync = function () {
          siteSyncCount++;
          return {
            select: function () {
              return Promise.resolve([{
                id:1,
                dummy: 'content'
              }]);
            },
            first: function () {
              return Promise.resolve([{
                id:1,
                dummy: 'content'
              }]);
            }
          };
        };

      });

      after(function () {
        delete Photo.prototype.sync;
        delete Author.prototype.sync;
        delete Site.prototype.sync;
      });

      it('should not run a query for eagerly loaded `belongsTo` relations if the foreign key is null', function () {
        var a = new Author({id: 1});

        return a.fetch({withRelated:'site'})
        .then(function (model) {
          equal(siteSyncCount, 0);
        }).catch(function (err){
          console.log(err);
        });

      });

      it('should not run a query for eagerly loaded `morphTo` relations if the foreign key is null', function () {
        var p = new Photo({id: 1});

        return p.fetch({withRelated:'imageable'})
        .then(function () {
          equal(siteSyncCount, 0);
        });
      });

    });


    describe('Issue #353 - wrong key set on a belongsTo relation', function() {

      it('should not set the foreign key on the target model when saving', function() {
        return new Blog({id: 4})
        .fetch()
        .then(function(model) {
          return model.site().fetch();
        })
        .then(function (site) {
          return site.save();
        });
      });

    });

  });

};
