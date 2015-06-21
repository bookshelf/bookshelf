var Promise   = global.testPromise;

var assert    = require('assert');
var _         = require('lodash');
var equal     = assert.equal

module.exports = function(bookshelf) {

  describe('Collection', function() {

    var output  = require('./output/Collection');
    var dialect = bookshelf.knex.client.dialect;
    var json    = function(model) {
      return JSON.parse(JSON.stringify(model));
    };
    var checkCount = function(ctx) {
      var formatNumber = {
        mysql:      _.identity,
        sqlite3:    _.identity,
        postgresql: function(count) { return count.toString() }
      }[dialect];
      return function(actual, expected) {
        expect(actual, formatNumber(expected));
      }
    };
    var checkTest = function(ctx) {
      return function(resp) {
        expect(json(resp)).to.eql(output[ctx.test.title][dialect].result);
      };
    };

    var Models      = require('./helpers/objects')(bookshelf).Models;

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

    describe('extend', function() {
      it ('should have own EmptyError', function() {
        var Sites = bookshelf.Collection.extend({model: Site});
        var OtherSites = bookshelf.Collection.extend({model: Site});

        var err = new Sites.EmptyError();
        expect(Sites.EmptyError).to.not.be.eql(bookshelf.Collection.EmptyError);
        expect(Sites.EmptyError).to.not.be.eql(OtherSites.EmptyError);
        expect(Sites.EmptyError).to.not.be.eql(OtherSites.EmptyError);
        expect(err).to.be.an.instanceof(bookshelf.Collection.EmptyError);
      });
    });

    describe('fetch', function() {

      it ('fetches the models in a collection', function() {
        return bookshelf.Collection.extend({tableName: 'posts'})
          .forge()
          .fetch()
          .tap(checkTest(this));
      });

    });

    describe('count', function() {
      it ('counts the number of models in a collection', function() {
        return bookshelf.Collection.extend({tableName: 'posts'})
          .forge()
          .count()
          .then(function(count) {
            checkCount(count, 5);
          });
      });

      it ('optionally counts by column (excluding null values)', function() {
        var authors = bookshelf.Collection.extend({tableName: 'authors'}).forge();

        return authors.count()
          .then(function(count) {
            checkCount(count, 5);
            return authors.count('last_name');
          }).then(function(count) {
            checkCount(count, 4);
          });
      });

      it ('counts a filtered query', function() {
        return bookshelf.Collection.extend({tableName: 'posts'})
          .forge()
          .query('where', 'blog_id', 1)
          .count()
          .then(function(count) {
            checkCount(count, 2);
          });
      });

      it ('counts a `hasMany` relation', function() {
        return new Blog({id: 1})
          .posts()
          .count()
          .tap(function(count) {
            checkCount(count, 2);
          });
      });

      it ('counts a `hasMany` `through` relation', function() {
        return new Blog({id: 1})
          .comments()
          .count()
          .tap(function(count) {
            checkCount(count, 1);
          });
      });
    });

    describe('fetchOne', function() {

      it ('fetches a single model from the collection', function() {
        return new Site({id:1})
          .authors()
          .fetchOne()
          .then(function(model) {
            return model.get('site_id', 1);
          });
      });

      it ('maintains a clone of the query builder from the current collection', function() {

        return new Site({id:1})
          .authors()
          .query({where: {id: 40}})
          .fetchOne()
          .then(function(model) {
            equal(model, null);
          });

      });

      it ('follows the typical model options, like require: true', function() {

        return new Site({id:1})
          .authors()
          .query({where: {id: 40}})
          .fetchOne({require: true})
          .throw(new Error())
          .catch(function(err) {
            assert(err instanceof Author.NotFoundError, 'Error is a Site.NotFoundError')
          });

      });

    });

    describe('sync', function() {

      it('creates a new instance of Sync', function(){
        var model = new bookshelf.Model();
        assert(model.sync(model) instanceof require('../../lib/sync'));
      });

    });

    describe('create', function() {

      it('creates and saves a new model instance, saving it to the collection', function () {

        return Site.collection().create({name: 'google.com'}).then(function(model) {
          expect(model.get('name')).to.equal('google.com');
          return model.destroy();
        });

      });

      it('should populate a `hasMany` or `morphMany` with the proper keys', function() {

        return new Site({id: 10})
          .authors()
          .create({first_name: 'test', last_name: 'tester'})
          .then(function(author) {
            expect(author.get('first_name')).to.equal('test');
            expect(author.get('last_name')).to.equal('tester');
            expect(author.get('site_id')).to.equal(10);
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
                expect(photo.get('imageable_id')).to.equal(10);
                expect(photo.get('imageable_type')).to.equal('sites');
                expect(photo.get('url')).to.equal('http://image.dev');
              });
          })
          // The following is for testing custom columnNames.
          .then(function() {
            return new Site({id: 10})
              .thumbnails()
              .create({
                url: 'http://image.dev',
                caption: 'this is a test image'
              })
              .then(function(photo) {
                expect(photo.get('ImageableId')).to.equal(10);
                expect(photo.get('ImageableType')).to.equal('sites');
                expect(photo.get('url')).to.equal('http://image.dev');
              });
          });

      });

      it('should not set incorrect foreign key in a `hasMany` `through` relation - #768', function() {

        // This will fail if an unknown field (eg. `blog_id`) is added to insert query.
        return new Blog({id: 768})
          .comments()
          .create({post_id: 5, comment: 'test comment'})
          .tap(function (comment) {
            return comment.destroy();
          });
      });

      it('should automatically create a join model when joining a belongsToMany', function() {

        return new Site({id: 1})
          .admins()
          .create({username: 'test', password: 'test'})
          .then(function(admin) {
            expect(admin.get('username')).to.equal('test');
          });

      });

      it('should maintain the correct constraints when creating a model from a relation', function() {
        var authors = new Site({id: 1}).authors();
        var query   = authors.query();
        query.then = function(onFufilled, onRejected) {
          // TODO: Make this doable again...
          // expect(this.values[0]).to.eql([['first_name', 'Test'], ['last_name', 'User'], ['site_id', 1]]);
          return Promise.resolve(this.toString()).then(onFufilled, onRejected);
        };
        return authors.create({first_name: 'Test', last_name: 'User'});
      });

      it('should populate the nested relations with the proper keys', function() {

        return new Author({id: 1}).fetch({withRelated: 'site.photos'}).then(function(author) {
          return author.related('site').related('photos').create({
            imageable_id: author.related('site').id,
            url: 'http://image.dev',
            caption: 'this is a test image'
          });

        }).then(function(photo) {
          expect(photo.get('url')).to.equal('http://image.dev');
          return photo.destroy();
        });

      });

      it('can require items in the response', function() {
        return bookshelf.Collection.extend({tableName: 'posts'})
          .query('where', {id: '1000'})
          .fetch({require: true})
          .catch(function(err) {
            expect(err.message).to.equal('EmptyResponse');
            throw err;
          })
          .catch(bookshelf.Collection.EmptyError, function(err) {
            expect(err.message).to.equal('EmptyResponse');
          });
      });

      it('correctly parses added relation keys', function() {
        return Site.forge({id: 1}).related('authorsParsed')
          .create({first_name_parsed: 'John', last_name_parsed: 'Smith'})
          .then(function (author) {
            expect(author.get('first_name_parsed')).to.equal('John');
            expect(author.get('last_name_parsed')).to.equal('Smith');
            expect(author.get('site_id_parsed')).to.equal(1);
            return author.destroy();
          });
      });
    });

  });

};
