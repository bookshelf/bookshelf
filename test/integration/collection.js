const {equal, deepEqual, fail} = require('assert').strict;

module.exports = function(bookshelf) {
  describe('Collection', function() {
    var output = require('./output/Collection');
    var dialect = bookshelf.knex.client.dialect;
    var json = function(model) {
      return JSON.parse(JSON.stringify(model));
    };
    var formatNumber = require('./helpers').formatNumber(dialect);
    var checkCount = function(actual, expected) {
      equal(actual, formatNumber(expected));
    };
    var checkTest = function(ctx) {
      return function(resp) {
        deepEqual(json(resp), output[ctx.test.title][dialect].result);
      };
    };

    var Models = require('./helpers/objects')(bookshelf).Models;
    var Site = Models.Site;
    var Author = Models.Author;
    var Blog = Models.Blog;
    var Post = Models.Post;

    describe('.extend()', function() {
      it('should have own EmptyError', function() {
        var Sites = bookshelf.Collection.extend({model: Site});
        var OtherSites = bookshelf.Collection.extend({model: Site});
        var err = new Sites.EmptyError();

        expect(Sites.EmptyError).to.not.be.eql(bookshelf.Collection.EmptyError);
        expect(Sites.EmptyError).to.not.be.eql(OtherSites.EmptyError);
        expect(Sites.EmptyError).to.not.be.eql(OtherSites.EmptyError);
        expect(err).to.be.an.instanceof(bookshelf.Collection.EmptyError);
      });
    });

    describe('#count()', function() {
      it('counts the number of models in a collection', function() {
        return bookshelf.Collection.extend({tableName: 'posts'})
          .forge()
          .count()
          .then(function(count) {
            checkCount(count, 5);
          });
      });

      it('optionally counts by column (excluding null values)', function() {
        var authors = bookshelf.Collection.extend({
          tableName: 'authors'
        }).forge();

        return authors
          .count()
          .then(function(count) {
            checkCount(count, 5);
            return authors.count('last_name');
          })
          .then(function(count) {
            checkCount(count, 4);
          });
      });

      it('counts a filtered query', function() {
        return bookshelf.Collection.extend({tableName: 'posts'})
          .forge()
          .query('where', 'blog_id', 1)
          .count()
          .then(function(count) {
            checkCount(count, 2);
          });
      });

      it('counts a `hasMany` relation', function() {
        return new Blog({id: 1})
          .posts()
          .count()
          .tap(function(count) {
            checkCount(count, 2);
          });
      });

      it('counts a `hasMany` `through` relation', function() {
        return new Blog({id: 1})
          .comments()
          .count()
          .tap(function(count) {
            checkCount(count, 1);
          });
      });
    });

    describe('#fetch()', function() {
      it('fetches the models in a collection', function() {
        return bookshelf.Collection.extend({tableName: 'posts'})
          .forge()
          .fetch()
          .tap(checkTest(this));
      });

      it('returns an empty collection if no models can be fetched', function() {
        return bookshelf.Collection.extend({tableName: 'posts'})
          .forge()
          .where('owner_id', 99)
          .fetch()
          .then((collection) => {
            equal(collection.length, 0);
            equal(collection.models.length, 0);
          });
      });

      it('throws an error if no models can be fetched with the require option', function() {
        return bookshelf.Collection.extend({tableName: 'posts'})
          .forge()
          .where('owner_id', 99)
          .fetch({require: true})
          .then(() => {
            fail('Expected the promise to be rejected but it resolved');
          })
          .catch((error) => {
            equal(error.message, 'EmptyResponse');
          });
      });
    });

    describe('#fetchPage()', function() {
      it('fetches a page from a collection', function() {
        return Models.Customer.collection()
          .fetchPage()
          .then(function(results) {
            expect(results).to.have.property('models');
            expect(results).to.have.property('pagination');
          });
      });

      it('fetches a page from a relation collection', function() {
        return Models.User.forge({uid: 1})
          .roles()
          .fetchPage()
          .then(function(results) {
            expect(results.length).to.equal(2);
            expect(results).to.have.property('models');
            expect(results).to.have.property('pagination');
          });
      });

      it('fetches a page from a relation collection with additional condition', function() {
        return Models.User.forge({uid: 1})
          .roles()
          .query(function(query) {
            query.where('roles.rid', '!=', 4);
          })
          .fetchPage()
          .then(function(results) {
            expect(results.length).to.equal(1);
            expect(results).to.have.property('models');
            expect(results).to.have.property('pagination');
          });
      });
    });

    describe('#fetchOne()', function() {
      it('fetches a single model from the collection', function() {
        return new Site({id: 1})
          .authors()
          .fetchOne()
          .then(function(model) {
            return model.get('site_id', 1);
          });
      });

      it('maintains a clone of the query builder from the current collection', function() {
        return new Site({id: 1})
          .authors()
          .query({where: {id: 40}})
          .fetchOne()
          .then((model) => {
            fail('Expected the promise to be rejected but it resolved');
          })
          .catch((error) => {
            equal(error instanceof Author.NotFoundError, true);
          });
      });

      it('rejects with an error if no record exists', function() {
        return new Site({id: 1})
          .authors()
          .query({where: {id: 40}})
          .fetchOne()
          .then((model) => {
            fail('Expected the promise to be rejected but it resolved');
          })
          .catch((error) => {
            equal(
              error instanceof Author.NotFoundError,
              true,
              'Expected error to be an instance of Author.NotFoundError'
            );
            equal(error.message, 'EmptyResponse');
          });
      });

      it('resolves to null with the {require: false} option if no model exists', function() {
        return new Site({id: 1})
          .authors()
          .query({where: {id: 40}})
          .fetchOne({require: false})
          .then(function(model) {
            equal(model, null);
          });
      });
    });

    describe('#orderBy()', function() {
      it('orders the results by column in ascending order', function() {
        return new Site({id: 1})
          .authors()
          .orderBy('first_name', 'ASC')
          .fetch()
          .then(function(result) {
            const expectedCollection = [
              {id: 2, site_id: 1, first_name: 'Bazooka', last_name: 'Joe'},
              {id: 1, site_id: 1, first_name: 'Tim', last_name: 'Griesser'}
            ];

            deepEqual(result.toJSON(), expectedCollection);
          });
      });

      it('orders the results by column in descending order', function() {
        return new Site({id: 1})
          .authors()
          .orderBy('first_name', 'DESC')
          .fetch()
          .then(function(result) {
            const expectedCollection = [
              {id: 1, site_id: 1, first_name: 'Tim', last_name: 'Griesser'},
              {id: 2, site_id: 1, first_name: 'Bazooka', last_name: 'Joe'}
            ];

            deepEqual(result.toJSON(), expectedCollection);
          });
      });

      it('orders the results in ascending order when chained with fetchPage()', function() {
        return Site.collection()
          .orderBy('name')
          .fetchPage()
          .then((sites) => {
            const expectedCollection = [
              {id: 3, name: 'backbonejs.org'},
              {id: 2, name: 'bookshelfjs.org'},
              {id: 1, name: 'knexjs.org'}
            ];

            deepEqual(sites.toJSON(), expectedCollection);
          });
      });

      it('orders the results in descending order when chained with fetchPage()', function() {
        return Site.collection()
          .orderBy('name', 'DESC')
          .fetchPage()
          .then((sites) => {
            const expectedCollection = [
              {id: 1, name: 'knexjs.org'},
              {id: 2, name: 'bookshelfjs.org'},
              {id: 3, name: 'backbonejs.org'}
            ];

            deepEqual(sites.toJSON(), expectedCollection);
          });
      });
    });

    describe('#create()', function() {
      it('creates and saves a new model instance, saving it to the collection', function() {
        return Site.collection()
          .create({name: 'google.com'})
          .then(function(model) {
            expect(model.get('name')).to.equal('google.com');
            return model.destroy();
          });
      });

      it('should populate a `hasMany` or `morphMany` with the proper keys', function() {
        return (
          new Site({id: 10})
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
            })
        );
      });

      it('should not set incorrect foreign key in a `hasMany` `through` relation - #768', function() {
        // This will fail if an unknown field (eg. `blog_id`) is added to insert query.
        return new Blog({id: 768})
          .comments()
          .create({post_id: 5, comment: 'test comment'})
          .tap(function(comment) {
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

      it('should populate the nested relations with the proper keys', function() {
        return new Author({id: 1})
          .fetch({withRelated: 'site.photos'})
          .then(function(author) {
            return author
              .related('site')
              .related('photos')
              .create({
                imageable_id: author.related('site').id,
                url: 'http://image.dev',
                caption: 'this is a test image'
              });
          })
          .then(function(photo) {
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
        return Site.forge({id: 1})
          .related('authorsParsed')
          .create({first_name_parsed: 'John', last_name_parsed: 'Smith'})
          .then(function(author) {
            expect(author.get('first_name_parsed')).to.equal('John');
            expect(author.get('last_name_parsed')).to.equal('Smith');
            expect(author.get('site_id_parsed')).to.equal(1);
            return author.destroy();
          });
      });
    });

    describe('#clone()', function() {
      it('should contain a copy of internal QueryBuilder object - #945', function() {
        var original = Post.collection()
          .query('where', 'share_count', '>', 10)
          .query('orderBy', 'created_at');
        var cloned = original.clone();

        expect(original.query()).to.not.equal(cloned.query());
        expect(original.query().toString()).to.equal(cloned.query().toString());

        // Check that a query listener is registered. We must assume that this
        // is the link to `Model.on('query').
        expect(cloned.query()._events).to.have.property('query');
      });
    });

    describe('#where()', function() {
      it('constrains the fetch call with the specified query conditions', function() {
        const Sites = bookshelf.Collection.extend({model: Site});
        return new Sites()
          .where({name: 'bookshelfjs.org'})
          .fetch()
          .then((sites) => {
            equal(sites.length, 1);
            equal(sites.models[0].get('name'), 'bookshelfjs.org');
          });
      });

      it('can constrain the fetch call with the "key, comparator, value" type conditions', function() {
        const Sites = bookshelf.Collection.extend({model: Site});
        return new Sites()
          .where('name', '<>', 'bookshelfjs.org')
          .fetch()
          .then((sites) => {
            equal(sites.length, 2);
            equal(sites.models[0].get('name'), 'knexjs.org');
            equal(sites.models[1].get('name'), 'backbonejs.org');
          });
      });
    });
  });
};
