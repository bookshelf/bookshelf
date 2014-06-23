var Promise = global.testPromise;

module.exports = function(bookshelf) {

  describe('Collection', function() {

    var Backbone = require('backbone');

    var output  = require('./output/Collection');
    var dialect = bookshelf.knex.client.dialect;
    var json    = function(model) {
      return JSON.parse(JSON.stringify(model));
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

    describe('fetch', function() {

      it ('fetches the models in a collection', function() {
        return bookshelf.Collection.extend({tableName: 'posts'})
          .forge()
          .fetch()
          .tap(checkTest(this));
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
            expect(model).to.be.null;
          });

      });

      it ('follows the typical model options, like require: true', function() {

        return expect(new Site({id:1})
          .authors()
          .query({where: {id: 40}})
          .fetchOne({require: true})).to.be.rejected;

      });

    });

    describe('sync', function() {

      it('creates a new instance of Sync', function(){
        var model = new bookshelf.Model();
        expect(model.sync(model)).to.be.an.instanceOf(require('../../lib/sync'));
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

    });

  });

};