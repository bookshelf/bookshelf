const Promise = require('bluebird');
var equal = require('assert').equal;
var helpers = require('./helpers');

module.exports = function(Bookshelf) {
  describe('Relations', function() {
    var output = require('./output/Relations');
    var dialect = Bookshelf.knex.client.dialect;
    var json = function(model) {
      model = model.toJSON();

      if (Array.isArray(model)) {
        return helpers.sortCollection(model);
      }

      return helpers.sort(model);
    };
    var checkTest = function(ctx, options) {
      return function(resp) {
        resp = options && options.sort === false ? resp.toJSON() : json(resp);
        expect(resp).to.eql(output[ctx.test.title][dialect].result);
      };
    };

    var objs = require('./helpers/objects')(Bookshelf);
    var Models = objs.Models;

    // Models
    var Site = Models.Site;
    var Admin = Models.Admin;
    var Author = Models.Author;
    var Critic = Models.Critic;
    var CriticComment = Models.CriticComment;
    var Blog = Models.Blog;
    var Post = Models.Post;
    var Comment = Models.Comment;
    var User = Models.User;
    var Thumbnail = Models.Thumbnail;
    var Photo = Models.Photo;
    var PhotoParsed = Models.PhotoParsed;
    var Customer = Models.Customer;
    var Hostname = Models.Hostname;
    var UserTokenParsed = Models.UserTokenParsed;
    var LeftModel = Models.LeftModel;
    var RightModel = Models.RightModel;
    var JoinModel = Models.JoinModel;
    var Locale = Models.Locale;
    var Translation = Models.Translation;
    var Organization = Models.OrgModel.extend({
      members: function() {
        return this.hasMany(Models.Member, 'organization_id');
      }
    });

    describe('Bookshelf Relations', function() {
      describe('Standard Relations - Models', function() {
        it('handles belongsTo (blog, site)', function() {
          return new Blog({id: 4})
            .fetch()
            .then(function(model) {
              return model.site().fetch();
            })
            .then(checkTest(this));
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
          return new Site({id: 1})
            .fetch({
              withRelated: ['meta']
            })
            .then(checkTest(this));
        });

        it('does not load "hasOne" relationship when it doesn\'t exist (site -> meta)', function() {
          return new Site({id: 3}).fetch({withRelated: ['meta']}).then(function(site) {
            expect(site.toJSON()).to.not.have.property('meta');
          });
        });

        it('eager loads "hasMany" relationships correctly (site -> authors, blogs)', function() {
          return new Site({id: 1})
            .fetch({
              withRelated: ['authors', 'blogs']
            })
            .then(checkTest(this));
        });

        it('eager loads "hasMany" relationships when children have duplicate ids', function() {
          return new Organization({id: 2})
            .fetch({
              withRelated: ['members'],
              merge: false,
              remove: false
            })
            .then(function(organization) {
              expect(organization.related('members').pluck('name')).to.include.members(['Alice', 'Bob']);
            });
        });

        it('eager loads "belongsTo" relationships correctly (blog -> site)', function() {
          return new Blog({id: 3})
            .fetch({
              withRelated: ['site']
            })
            .then(checkTest(this));
        });

        it('does not load "belongsTo" relationship when foreignKey is null (blog -> site) #1299', function() {
          return new Blog({id: 5})
            .fetch({
              withRelated: ['site']
            })
            .then(checkTest(this));
        });

        it('throws an error if you try to fetch a related object without the necessary key', function() {
          return new Blog({id: 1})
            .site()
            .fetch()
            .then(function() {
              return Promise.reject();
            })
            .catch(function(error) {
              expect(error).to.be.an.instanceOf(Error);
            });
        });

        it('eager loads "belongsToMany" models correctly (post -> tags)', function() {
          return new Post({id: 1})
            .fetch({
              withRelated: ['tags']
            })
            .then(checkTest(this));
        });

        it('attaches an empty related model or collection if the `EagerRelation` comes back blank', function() {
          return new Site({id: 3})
            .fetch({
              withRelated: ['meta', 'blogs', 'authors.posts']
            })
            .then(checkTest(this));
        });

        it('maintains eager loaded column specifications, #510', function() {
          return new Site({id: 1})
            .fetch({
              withRelated: [
                {
                  authors: function(qb) {
                    qb.columns('id', 'site_id', 'first_name');
                  }
                }
              ]
            })
            .then(checkTest(this));
        });

        it('can load relations when foreign key is 0', function() {
          return new Models.Backup({id: 1, backup_type_id: 0})
            .save()
            .then(function() {
              return Models.Backup.fetchAll({withRelated: ['type']});
            })
            .then(function(backups) {
              var relatedType = backups.at(0).related('type');
              expect(relatedType.get('name')).to.be.a('string');
              expect(relatedType.get('name')).to.not.be.empty;
            });
        });

        it('throws an error on undefined first withRelated relations', function() {
          return new Site({id: 1})
            .fetch({
              withRelated: ['undefinedRelation']
            })
            .then(
              function() {
                throw new Error('This should not succeed');
              },
              function(err) {
                expect(err.message).to.equal('undefinedRelation is not defined on the model.');
              }
            );
        });

        it('throws an error on undefined non-first withRelated relations', function() {
          return new Site({id: 1})
            .fetch({
              withRelated: ['authors', 'undefinedRelation']
            })
            .then(
              function() {
                throw new Error('This should not succeed');
              },
              function(err) {
                expect(err.message).to.equal('undefinedRelation is not defined on the model.');
              }
            );
        });

        it('is possible to add withRelated in events', function() {
          var TestSiteMeta = Models.SiteMeta.extend({
            initialize: function() {
              this.on('fetching fetching:collection', function(model, columns, options) {
                if (!options.withRelated) options.withRelated = [];
                options.withRelated.push('site');
              });
            }
          });

          return new TestSiteMeta({id: 1}).fetch().then(function(sitemeta) {
            expect(sitemeta.related('site').get('id')).to.not.be.undefined;
          });
        });

        describe("emits 'fetching' and 'fetched' events for eagerly loaded relations with", function() {
          afterEach(function() {
            delete Site.prototype.initialize;
          });

          it('withRelated option', function() {
            var countFetching = 0;
            var countFetched = 0;
            Site.prototype.initialize = function() {
              this.on('fetching', function() {
                countFetching++;
              });
              this.on('fetched', function() {
                countFetched++;
              });
            };

            return Blog.forge({id: 1})
              .fetch({withRelated: ['site']})
              .then(function() {
                equal(countFetching, 1);
                equal(countFetched, 1);
              });
          });

          it('load() method', function() {
            var countFetching = 0;
            var countFetched = 0;
            Site.prototype.initialize = function() {
              this.on('fetching', function() {
                countFetching++;
              });
              this.on('fetched', function() {
                countFetched++;
              });
            };

            return Blog.where({id: 1})
              .fetch()
              .then(function(blog) {
                return blog.load('site').then(function() {
                  equal(countFetching, 1);
                  equal(countFetched, 1);
                });
              });
          });
        });
      });

      describe('Eager Loading - Collections', function() {
        it('eager loads "hasOne" models correctly (sites -> meta)', function() {
          return Site.fetchAll({
            withRelated: ['meta']
          }).then(checkTest(this));
        });

        it('eager loads "belongsTo" models correctly (blogs -> site) including #1299', function() {
          return Blog.fetchAll({
            withRelated: ['site']
          }).then(checkTest(this));
        });

        it('eager loads "hasMany" models correctly (site -> blogs)', function() {
          return new Site({id: 1})
            .fetch({
              withRelated: ['blogs']
            })
            .then(checkTest(this));
        });

        it('eager loads "belongsToMany" models correctly (posts -> tags)', function() {
          return Post.where('blog_id', 1)
            .fetchAll({withRelated: ['tags']})
            .then(checkTest(this));
        });

        it('eager loads "belongsToMany" models correctly and parent is not undefined', function() {
          return Post.where('blog_id', 1)
            .fetchAll({withRelated: ['tags']})
            .then(function(result) {
              result.models[0].related('tags').relatedData.parentId.should.eql(1);
            });
        });

        it('when parent model has custom id attribute and a parse method that mutates it', function() {
          return Organization.forge({id: 1})
            .fetch({withRelated: ['members']})
            .then(function(organization) {
              expect(organization.related('members').length).to.be.above(0);
            });
        });
      });

      describe('Nested Eager Loading - Models', function() {
        it('eager loads "hasMany" -> "hasMany" (site -> authors.ownPosts)', function() {
          return new Site({id: 1})
            .fetch({
              withRelated: ['authors.ownPosts']
            })
            .then(checkTest(this));
        });

        it('eager loads "hasMany" -> "belongsToMany" (site -> authors.posts)', function() {
          return new Site({id: 1})
            .fetch({
              withRelated: {
                'authors.posts': function(qb) {
                  return qb.orderBy('posts.id', 'ASC');
                }
              }
            })
            .then(checkTest(this, {sort: false}));
        });

        it('does multi deep eager loads (site -> authors.ownPosts, authors.site, blogs.posts)', function() {
          return new Site({id: 1})
            .fetch({
              withRelated: ['authors.ownPosts', 'authors.site', 'blogs.posts']
            })
            .then(checkTest(this));
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
          return new Site({id: 1})
            .fetch()
            .tap(checkTest(this))
            .then(function(m) {
              return m.load(['blogs', 'authors.site']);
            });
        });

        it('eager loads attributes on a collection (sites -> blogs, authors.site)', function() {
          return Site.fetchAll()
            .tap(checkTest(this))
            .then(function(c) {
              return c.load(['blogs', 'authors.site']);
            });
        });
      });

      describe('Pivot Tables', function() {
        beforeEach(function() {
          return Promise.all([new Site({id: 1}).admins().detach(), new Site({id: 2}).admins().detach()]);
        });

        it("attaching event get's triggered", function(done) {
          var site1 = new Site({id: 1});
          var admin1 = new Admin({username: 'syncable', password: 'test'});

          admin1
            .save()
            .then(function() {
              site1.related('admins').on('attaching', function(collection, modelToAttach) {
                expect(collection).to.exist;
                expect(modelToAttach.get('username')).to.eql(admin1.get('username'));
                done();
              });

              return site1.related('admins').attach(admin1);
            })
            .catch(done);
        });

        it("creating event get's triggered", function(done) {
          var site1 = new Site({id: 1});
          var admin1 = new Admin({username: 'syncable', password: 'test'});

          admin1
            .save()
            .then(function() {
              site1.related('admins').on('creating', function(collection, data, options) {
                expect(collection).to.exist;
                expect(data.site_id).to.exist;
                expect(data.admin_id).to.exist;
                expect(options).to.not.exist;
                done();
              });

              return site1.related('admins').attach(admin1);
            })
            .catch(done);
        });

        it('has an attaching event, which will fail if an error is thrown', function() {
          var site1 = new Site({id: 1});
          var admin1 = new Admin({username: 'syncable', password: 'test'});

          return admin1
            .save()
            .then(function() {
              site1.related('admins').on('attaching', function() {
                throw new Error('This failed');
              });
              return site1.related('admins').attach(admin1);
            })
            .throw(new Error())
            .catch(function(err) {
              equal(err.message, 'This failed');
            });
        });

        it('has an detaching event, which will fail if an error is thrown', function() {
          var site1 = new Site({id: 1});
          var admin1 = new Admin({username: 'syncable', password: 'test'});

          return admin1
            .save()
            .then(function() {
              site1.related('admins').on('detaching', function() {
                throw new Error('This failed');
              });

              return site1.related('admins').attach(admin1);
            })
            .then(function() {
              return site1.related('admins').detach(admin1);
            })
            .throw(new Error())
            .catch(function(err) {
              equal(err.message, 'This failed');
            });
        });

        it('provides "attach" for creating or attaching records', function() {
          var site1 = new Site({id: 1});
          var site2 = new Site({id: 2});
          var admin1 = new Admin({username: 'syncable', password: 'test'});
          var admin2 = new Admin({username: 'syncable', password: 'test'});
          var admin1_id;

          return Promise.all([admin1.save(), admin2.save()])
            .then(function() {
              admin1_id = admin1.id;

              return Promise.all([
                site1.related('admins').attach([admin1, admin2]),
                site2.related('admins').attach(admin2),
                site1.related('admins').on('attached', function(c) {
                  return c.fetch().then(function(c) {
                    equal(c.length, 2);
                  });
                }),
                site2.related('admins').on('attached', function(c) {
                  return c.fetch().then(function(c) {
                    equal(c.length, 1);
                  });
                })
              ]);
            })
            .spread(function(site1Admins, site2Admins) {
              expect(site1Admins).to.equal(site1.related('admins'));
              expect(site2Admins).to.equal(site2.related('admins'));

              expect(site1.related('admins')).to.have.length(2);
              expect(site2.related('admins')).to.have.length(1);
            })
            .then(function() {
              return Promise.all([
                new Site({id: 1})
                  .related('admins')
                  .fetch()
                  .then(function(c) {
                    c.forEach(function(m) {
                      equal(m.hasChanged(), false);
                    });
                    equal(c.at(0).pivot.get('item'), 'test');
                    equal(c.length, 2);
                  }),
                new Site({id: 2})
                  .related('admins')
                  .fetch()
                  .then(function(c) {
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
                }),
                admins2.detach().then(function(c) {
                  expect(admins2).to.have.length(0);
                }),
                admins1.on('detached', function(c) {
                  return c.fetch().then(function(c) {
                    equal(c.length, 1);
                  });
                }),
                admins2.on('detached', function(c) {
                  return c.fetch({require: false}).then(function(c) {
                    equal(c.length, 0);
                  });
                })
              ]);
            });
        });

        it('keeps the attach method for eager loaded relations, #120', function() {
          var site1 = new Site({id: 1});
          var site2 = new Site({id: 2});
          var admin1 = new Admin({username: 'syncable', password: 'test'});
          var admin2 = new Admin({username: 'syncable', password: 'test'});
          var admin1_id;

          return Promise.all([
            admin1.save(),
            admin2.save(),
            site1.fetch({withRelated: 'admins'}),
            site2.fetch({withRelated: 'admins'})
          ])
            .then(function() {
              admin1_id = admin1.id;
              return Promise.all([
                site1.related('admins').attach([admin1, admin2]),
                site2.related('admins').attach(admin2),
                site1.related('admins').on('attached', function(c) {
                  return c.fetch().then(function(c) {
                    equal(c.length, 2);
                  });
                }),
                site2.related('admins').on('attached', function(c) {
                  return c.fetch().then(function(c) {
                    equal(c.length, 1);
                  });
                })
              ]);
            })
            .then(function(resp) {
              expect(site1.related('admins')).to.have.length(2);
              expect(site2.related('admins')).to.have.length(1);
            })
            .then(function() {
              return Promise.all([
                new Site({id: 1})
                  .related('admins')
                  .fetch()
                  .then(function(c) {
                    c.forEach(function(m) {
                      equal(m.hasChanged(), false);
                    });
                    equal(c.at(0).pivot.get('item'), 'test');
                    equal(c.length, 2);
                  }),
                new Site({id: 2})
                  .related('admins')
                  .fetch()
                  .then(function(c) {
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
                }),
                admins2.detach().then(function(c) {
                  expect(admins2).to.have.length(0);
                }),
                admins1.on('detached', function(c) {
                  return c.fetch().then(function(c) {
                    equal(c.length, 1);
                  });
                }),
                admins2.on('detached', function(c) {
                  return c.fetch({require: false}).then(function(c) {
                    equal(c.length, 0);
                  });
                })
              ]);
            });
        });

        it('can attach `belongsToMany` relation to models eager loaded with `fetchAll`, #629', function() {
          return Author.fetchAll({withRelated: ['posts']})
            .then(function(authors) {
              return Promise.all([
                authors
                  .at(0)
                  .related('posts')
                  .detach(),
                new Post({id: 1}).fetch()
              ]);
            })
            .then(function(models) {
              expect(models[0]).to.have.length(0);
              return models[0].attach(models[1]);
            })
            .then(function(posts) {
              expect(posts).to.have.length(1);
            });
        });

        it('keeps the pivotal helper methods when cloning a collection having `relatedData` with `type` "belongsToMany", #1197', function() {
          var pivotalProps = [
            'attach',
            'detach',
            'updatePivot',
            'withPivot',
            '_processPivot',
            '_processPlainPivot',
            '_processModelPivot'
          ];
          var author = new Author({id: 1});
          var posts = author.related('posts');
          pivotalProps.forEach(function(prop) {
            expect(posts[prop]).to.be.an.instanceof(Function);
          });

          var clonedAuthor = author.clone();
          var clonedPosts = clonedAuthor.related('posts');
          pivotalProps.forEach(function(prop) {
            expect(clonedPosts[prop]).to.equal(posts[prop]);
          });
        });
      });

      describe('Updating pivot tables with `updatePivot`', function() {
        var admin1_id;
        var admin2_id;

        before(function() {
          var admin1 = new Admin({username: 'updatetest', password: 'test'});
          var admin2 = new Admin({username: 'updatetest2', password: 'test'});
          return Promise.all([admin1.save(), admin2.save()]).then(function(admin) {
            admin1_id = admin1.id;
            admin2_id = admin2.id;
            return new Site({id: 1}).related('admins').attach([admin1, admin2]);
          });
        });

        after(function() {
          return new Site({id: 1}).admins().detach();
        });

        it('updates all rows inside the pivot table belonging to the current model', function() {
          var site1 = new Site({id: 1});
          return site1
            .admins()
            .updatePivot({item: 'allupdated'})
            .then(function(relation) {
              return relation
                .withPivot(['item'])
                .fetch()
                .then(function(col) {
                  equal(col.get(admin1_id).pivot.get('item'), 'allupdated');
                  equal(col.get(admin2_id).pivot.get('item'), 'allupdated');
                });
            });
        });

        it('updates all rows, which match the passed in query-criteria', function() {
          var site1 = new Site({id: 1});
          return site1
            .admins()
            .updatePivot(
              {item: 'anotherupdate'},
              {
                query: {
                  whereIn: ['admin_id', [admin1_id]]
                }
              }
            )
            .then(function(relation) {
              return relation
                .withPivot(['item'])
                .fetch()
                .then(function(col) {
                  equal(col.get(admin1_id).pivot.get('item'), 'anotherupdate');
                  equal(col.get(admin2_id).pivot.get('item'), 'allupdated');
                });
            });
        });

        it('throws an error if no columns are updated and `require: true` is passed as option', function() {
          // non-existent site
          return new Site({id: 99999})
            .admins()
            .updatePivot({item: 'testvalue'}, {require: true})
            .then(function(relation) {
              throw new Error('this should not happen');
            })
            .catch(function(err) {
              equal(err instanceof Error, true);
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
          return new User({uid: 1}).fetch({withRelated: ['roles']}).tap(checkTest(this));
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
            .fetch()
            .tap(checkTest(this));
        });

        it('handles morphTo with custom morphValue (imageable "authors")', function() {
          return new Photo({imageable_id: 1, imageable_type: 'profile_pic'})
            .imageable()
            .fetch()
            .tap(checkTest(this));
        });

        it('handles morphTo (imageble "authors", PhotoParsed)', function() {
          return new PhotoParsed({
            imageable_id_parsed: 1,
            imageable_type_parsed: 'profile_pic'
          })
            .imageableParsed()
            .fetch()
            .tap(checkTest(this));
        });

        it('has no side effects for morphTo (imageable "authors", PhotoParsed)', function() {
          var photoParsed = new PhotoParsed({
            imageable_id_parsed: 1,
            imageable_type_parsed: 'profile_pic'
          });
          return photoParsed
            .imageableParsed()
            .fetch()
            .then(function() {
              return photoParsed.fetch();
            })
            .then(checkTest(this));
        });

        it('handles morphTo (imageable "sites")', function() {
          return new Photo({imageable_id: 1, imageable_type: 'sites'})
            .imageable()
            .fetch()
            .tap(checkTest(this));
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

        it('handles morphOne with custom columnNames (thumbnail)', function() {
          return new Author({id: 1})
            .thumbnail()
            .fetch()
            .tap(checkTest(this));
        });

        it('handles morphMany with custom columnNames (thumbnail)', function() {
          return new Site({id: 1})
            .thumbnails()
            .fetch()
            .tap(checkTest(this));
        });

        it('handles morphTo with custom columnNames (imageable "authors")', function() {
          return new Thumbnail({ImageableId: 1, ImageableType: 'authors'})
            .imageable()
            .fetch()
            .tap(checkTest(this));
        });

        it('handles morphTo with custom columnNames (imageable "sites")', function() {
          return new Thumbnail({ImageableId: 1, ImageableType: 'sites'})
            .imageable()
            .fetch()
            .tap(checkTest(this));
        });

        it('eager loads morphMany with custom columnNames (sites -> thumbnails)', function() {
          return Site.fetchAll({withRelated: ['thumbnails']}).tap(checkTest(this));
        });

        it('eager loads morphTo with custom columnNames (thumbnails -> imageable)', function() {
          return Thumbnail.fetchAll({withRelated: ['imageable']}).tap(checkTest(this));
        });

        it('eager loads beyond the morphTo with custom columnNames, where possible', function() {
          return Thumbnail.fetchAll({withRelated: ['imageable.authors']}).tap(checkTest(this));
        });

        it('throws an error if the type attribute is not defined', function() {
          return Bookshelf.knex('photos')
            .insert({caption: 'a caption', imageable_id: 1})
            .then(function() {
              return Photo.fetchAll({withRelated: ['imageable']});
            })
            .then(function(photos) {
              expect(photos).to.be.undefined;
            })
            .catch(function(error) {
              var expectedMessage =
                "The target polymorphic model could not be determined because it's missing the " + 'type attribute';
              expect(error.message).to.equal(expectedMessage);
            })
            .then(function() {
              return Photo.where('imageable_type', null).destroy({
                require: false
              });
            });
        });

        it('throws an error if the type attribute is not one of the expected types', function() {
          var badType = 'not the one';

          return Bookshelf.knex('photos')
            .insert({
              caption: 'a caption',
              imageable_id: 1,
              imageable_type: badType
            })
            .then(function() {
              return Photo.fetchAll({withRelated: ['imageable']});
            })
            .then(function(photos) {
              expect(photos).to.be.undefined;
            })
            .catch(function(error) {
              var expectedMessage =
                'The target polymorphic type "' + badType + '" is not one of the defined target types';
              expect(error.message).to.equal(expectedMessage);
            })
            .then(function() {
              return Photo.where('imageable_type', badType).destroy({
                require: false
              });
            });
        });
      });

      describe('`through` relations', function() {
        it('handles hasMany `through`', function() {
          return new Blog({id: 1})
            .comments()
            .fetch()
            .tap(checkTest(this));
        });

        it('eager loads hasMany `through`', function() {
          return Blog.where({site_id: 1})
            .fetchAll({
              withRelated: 'comments'
            })
            .then(checkTest(this));
        });

        it('eager loads hasMany `through` using where / fetchAll', function() {
          return Blog.where('site_id', 1)
            .fetchAll({withRelated: 'comments'})
            .then(checkTest(this));
        });

        it('handles hasOne `through`', function() {
          return new Site({id: 1})
            .info()
            .fetch()
            .tap(checkTest(this));
        });

        it('eager loads hasOne `through`', function() {
          return Site.where('id', '<', 3)
            .fetchAll({
              withRelated: 'info'
            })
            .then(checkTest(this));
        });

        it('eager loads belongsToMany `through`', function() {
          return Author.fetchAll({
            withRelated: {
              blogs: function(qb) {
                return qb.orderBy('blogs.id', 'ASC');
              }
            }
          }).tap(checkTest(this, {sort: false}));
        });

        it('eager loads belongsTo `through`', function() {
          return new Comment().fetchAll({withRelated: 'blog'}).tap(checkTest(this));
        });
      });
    });

    describe('Issue #63 - hasOne relations', function() {
      it('should return Customer (id=1) with settings', function() {
        var expected = {
          id: 1,
          name: 'Customer1',
          settings: {
            id: 1,
            Customer_id: 1,
            data: 'Europe/Paris'
          }
        };

        return new Customer({id: 1}).fetch({withRelated: 'settings'}).then(function(model) {
          var cust = model.toJSON();
          expect(cust).to.eql(expected);
        });
      });

      it('should return Customer (id=4) with settings', function() {
        var expected = {
          id: 4,
          name: 'Customer4',
          settings: {
            id: 2,
            Customer_id: 4,
            data: 'UTC'
          }
        };

        return new Customer({id: 4}).fetch({withRelated: 'settings'}).then(function(model) {
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
        return new Bookshelf.Collection([], {model: Hostname}).fetch({withRelated: 'instance'}).tap(checkTest(this));
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
          return site
            .related('authors')
            .create({first_name: 'Dummy', last_name: 'Account'})
            .then(function(model) {
              expect(model.attributes).to.eql({
                first_name: 'Dummy',
                last_name: 'Account',
                site_id: site.id,
                id: model.id
              });
              expect(site.related('authors')).to.have.length(3);
            });
        });
      });
    });

    describe('Issue #97, #377 - Eager loading on parsed models', function() {
      it('correctly pairs eager-loaded models before parse()', function() {
        return Promise.all([
          new Blog({id: 1}).related('parsedPosts').fetch(),
          new Blog({id: 1}).fetch({withRelated: 'parsedPosts'})
        ]).spread(function(parsedPosts, blog) {
          expect(blog.related('parsedPosts').length).to.equal(parsedPosts.length);
        });
      });

      it('parses eager-loaded models after pairing', function() {
        return new Blog({id: 1}).fetch({withRelated: 'parsedPosts'}).then(function(blog) {
          var attrs = blog.related('parsedPosts').at(0).attributes;
          Object.keys(attrs).forEach(function(key) {
            expect(/_parsed$/.test(key)).to.be.true;
          });
        });
      });

      it('parses eager-loaded models previous attributes after pairing', function() {
        return new Blog({id: 1}).fetch({withRelated: 'parsedPosts'}).then(function(blog) {
          var previous = blog
            .related('parsedPosts')
            .at(0)
            .previousAttributes();

          expect(previous).to.not.eql({});
          Object.keys(previous).forEach(function(key) {
            expect(/_parsed$/.test(key)).to.be.true;
          });
        });
      });

      it('parses eager-loaded morphTo relations (model)', function() {
        return Photo.fetchAll({
          withRelated: 'imageableParsed.meta',
          log: true
        }).then(function(photos) {
          photos.forEach(function(photo) {
            var attrs = photo.related('imageableParsed').attributes;
            Object.keys(attrs).forEach(function(key) {
              expect(/_parsed$/.test(key)).to.be.true;
            });
          });
        });
      });

      it('eager fetches belongsTo correctly on a dual parse', function() {
        return UserTokenParsed.forge({token: 'testing'})
          .fetch({
            withRelated: ['user']
          })
          .then(function(model) {
            expect(model.related('user').get('id')).to.equal(10);
          });
      });

      it('eager fetches belongsTo correctly on a dual parse', function() {
        return UserTokenParsed.forge({token: 'testing'})
          .fetch()
          .then(function(model) {
            return model.load('user');
          })
          .then(function(model) {
            expect(model.related('user').get('id')).to.equal(10);
          });
      });
    });

    describe('Issue #212 - Skipping unnecessary queries', function() {
      var siteSyncCount = 0;

      beforeEach(function() {
        siteSyncCount = 0;
      });

      before(function() {
        Photo.prototype.sync = function() {
          return {
            first: function() {
              return Promise.resolve([
                {
                  id: 1,
                  imageable_type: 'sites',
                  imageable_id: null
                }
              ]);
            }
          };
        };

        Author.prototype.sync = function() {
          return {
            select: function() {
              return Promise.resolve([
                {
                  id: 1,
                  dummy: 'author'
                }
              ]);
            },
            first: function() {
              return Promise.resolve([
                {
                  id: 1,
                  first_name: 'Johannes',
                  last_name: 'Lumpe',
                  site_id: null
                }
              ]);
            }
          };
        };

        Site.prototype.sync = function() {
          siteSyncCount++;
          return {
            select: function() {
              return Promise.resolve([
                {
                  id: 1,
                  dummy: 'content'
                }
              ]);
            },
            first: function() {
              return Promise.resolve([
                {
                  id: 1,
                  dummy: 'content'
                }
              ]);
            }
          };
        };
      });

      after(function() {
        delete Photo.prototype.sync;
        delete Author.prototype.sync;
        delete Site.prototype.sync;
      });

      it('should not run a query for eagerly loaded `belongsTo` relations if the foreign key is null', function() {
        var a = new Author({id: 1});

        return a.fetch({withRelated: 'site'}).then(function(model) {
          equal(siteSyncCount, 0);
        });
      });

      it('should not run a query for eagerly loaded `morphTo` relations if the foreign key is null', function() {
        var p = new Photo({id: 1});

        return p.fetch({withRelated: 'imageable'}).then(function() {
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
          .then(function(site) {
            return site.save();
          });
      });
    });

    describe('Issue #578 - lifecycle events on pivot model for belongsToMany().through()', function() {
      // Overrides the `initialize` method on the JoinModel to throw an Error
      // when the current lifecycleEvent is triggered. Additionally overrides
      // the Left/Right models `.belongsToMany().through()` configuration with
      // the overridden JoinModel.
      function initializeModelsForLifecycleEvent(lifecycleEvent) {
        JoinModel = JoinModel.extend({
          initialize: (function(v) {
            return function() {
              this.on(lifecycleEvent, function() {
                throw new Error('`' + lifecycleEvent + '` triggered on JoinModel()');
              });
            };
          })(lifecycleEvent)
        });

        LeftModel = LeftModel.extend({
          rights: function() {
            return this.belongsToMany(RightModel).through(JoinModel);
          }
        });

        RightModel = RightModel.extend({
          lefts: function() {
            return this.belongsToMany(LeftModel)
              .through(JoinModel)
              .withPivot(['parsedName']);
          }
        });
      }

      // First, initialize the models for the current `lifecycleEvent`, then
      // step through the entire lifecycle of a JoinModel, returning a promise.
      function joinModelLifecycleRoutine(lifecycleEvent) {
        initializeModelsForLifecycleEvent(lifecycleEvent);
        return new LeftModel()
          .save()
          .then(function(left) {
            // creating, saving, created, saved
            return [left, left.rights().create()];
          })
          .spread(function(left, right) {
            // fetching, fetched
            return [left, right, right.lefts().fetch()];
          })
          .spread(function(left, right, lefts) {
            // updating, updated
            return [left, right, left.rights().updatePivot({})];
          })
          .spread(function(left, right, relationship) {
            return new LeftModel().save().then(function(left) {
              return [left, right, right.lefts().attach(left)];
            });
          })
          .spread(function(left, right, relationship) {
            // destroying, destroyed
            return left.rights().detach(right);
          });
      }

      // For each lifecycle event that should be triggered on the JoinModel,
      // build a test that verifies the expected Error is being thrown by the
      // JoinModel's lifecycle event handler.

      [
        'creating',
        'created',
        'saving',
        'saved',
        'fetching',
        'fetched',
        'updating',
        'updated',
        'destroying',
        'destroyed'
      ].forEach(function(v) {
        it('should trigger pivot model lifecycle event: ' + v, function() {
          return joinModelLifecycleRoutine(v).catch(function(err) {
            equal(err instanceof Error, true);
            equal(err.message, '`' + v + '` triggered on JoinModel()');
          });
        });
      });
    });

    describe('Issue #1388 - Custom foreignKeyTarget & otherKeyTarget', function() {
      it('works with hasOne relation (locale -> translation)', function() {
        return new Locale({isoCode: 'pt'})
          .translation()
          .fetch()
          .then(checkTest(this));
      });

      it('works with eager loaded hasOne relation (locale -> translation)', function() {
        return new Locale({isoCode: 'pt'}).fetch({withRelated: 'translation'}).then(checkTest(this));
      });

      it('works with hasOne `through` relation (customer -> locale)', function() {
        return new Customer({name: 'Customer2'})
          .locale()
          .fetch()
          .then(checkTest(this));
      });

      it('works with eager loaded hasOne `through` relation (customer -> locale)', function() {
        return new Customer({name: 'Customer2'}).fetch({withRelated: 'locale'}).then(checkTest(this));
      });

      it('works with hasMany relation (locale -> translations)', function() {
        return new Locale({isoCode: 'en'})
          .translations()
          .fetch()
          .then(checkTest(this));
      });

      it('works with eager loaded hasMany relation (locale -> translations)', function() {
        return new Locale({isoCode: 'en'}).fetch({withRelated: 'translations'}).then(checkTest(this));
      });

      it('works with hasMany `through` relation (customer -> locales)', function() {
        return new Customer({name: 'Customer1'})
          .locales()
          .fetch()
          .then(checkTest(this));
      });

      it('works with eager loaded hasMany `through` relation (customer -> locales)', function() {
        return new Customer({name: 'Customer1'}).fetch({withRelated: 'locales'}).then(checkTest(this));
      });

      it('works with belongsTo relation (translation -> locale)', function() {
        return new Translation({code: 'pt'})
          .locale()
          .fetch()
          .then(checkTest(this));
      });

      it('works with eager loaded belongsTo relation (translation -> locale)', function() {
        return new Translation({code: 'pt'}).fetch({withRelated: 'locale'}).then(checkTest(this));
      });

      it('works with belongsTo `through` relation (locale -> customer)', function() {
        return new Locale({isoCode: 'pt'})
          .customer()
          .fetch()
          .then(checkTest(this));
      });

      it('works with eager loaded belongsTo `through` relation (locale -> customer)', function() {
        return new Locale({isoCode: 'pt'}).fetch({withRelated: 'customer'}).then(checkTest(this));
      });

      it('works with belongsToMany relation (locale -> customers)', function() {
        return new Locale({isoCode: 'en'})
          .customers()
          .fetch()
          .then(checkTest(this));
      });

      it('works with eager loaded belongsToMany relation (locale -> customers)', function() {
        return new Locale({isoCode: 'en'}).fetch({withRelated: 'customers'}).then(checkTest(this));
      });

      it('works with belongsToMany `through` relation (locale -> customers)', function() {
        return new Locale({isoCode: 'en'})
          .customersThrough()
          .fetch()
          .then(checkTest(this));
      });

      it('works with eager belongsToMany `through` relation (locale -> customers)', function() {
        return new Locale({isoCode: 'en'}).fetch({withRelated: 'customersThrough'}).then(checkTest(this));
      });
    });

    describe('Binary ID relations', function() {
      it('should group relations properly with binary ID columns', function() {
        const critic1Id = Buffer.from('93', 'hex');
        const critic2Id = Buffer.from('90', 'hex');
        const critic1 = new Critic({id: critic1Id, name: '1'});
        const critic2 = new Critic({id: critic2Id, name: '2'});
        const comment1 = new CriticComment({critic_id: critic1Id, comment: 'c1-1'});
        const comment2 = new CriticComment({critic_id: critic1Id, comment: 'c1-2'});
        const comment3 = new CriticComment({critic_id: critic2Id, comment: 'c2-1'});
        return Promise.all([
          critic1.save(null, {method: 'insert'}),
          critic2.save(null, {method: 'insert'}),
          comment1.save(),
          comment2.save(),
          comment3.save()
        ])
          .then(function() {
            return Critic.where('name', 'IN', ['1', '2'])
              .orderBy('name', 'ASC')
              .fetchAll({withRelated: 'comments'});
          })
          .then(function(critics) {
            critics = critics.serialize();
            expect(critics).to.have.lengthOf(2);
            expect(critics[0].comments).to.have.lengthOf(2);
            expect(critics[1].comments).to.have.lengthOf(1);
          });
      });
    });

    describe('PR #2059 - opts.query on fetching with morphTo', function() {
      it('should correctly set query on fetching with morphTo', async function() {
        const {Photo} = objs.generateEventModels({
          fetching: function(table, model, columns, options) {
            // Check that options.query actually queries this table
            equal(options.query._single.table, table);
          }
        });

        // Execute a query that will trigger fetching events
        // These have assertions
        return Photo.forge().fetchAll({withRelated: 'imageable'});
      });
    });
  });
};
