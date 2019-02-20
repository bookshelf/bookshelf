var expect = require('chai').expect;
var _ = require('lodash');

module.exports = function(bookshelf) {
  describe('Pagination Plugin', function() {
    bookshelf.plugin('pagination');
    var Models = require('../helpers/objects')(bookshelf).Models;

    describe('Model#fetchPage()', function() {
      it('fetches a single page of results with defaults', function() {
        return Models.Customer.forge()
          .fetchPage()
          .then(function(results) {
            ['models', 'pagination'].forEach(function(prop) {
              expect(results).to.have.property(prop);
            });
            ['rowCount', 'pageCount', 'page', 'pageSize'].forEach(function(prop) {
              expect(results.pagination).to.have.property(prop);
            });

            var md = results.pagination;

            expect(md.rowCount).to.equal(4);
            expect(md.pageCount).to.equal(1);
            expect(md.page).to.equal(1);
            expect(md.pageSize).to.equal(10);
          });
      });

      it('returns an empty collection if there are no results', function() {
        return bookshelf
          .knex('critics_comments')
          .del()
          .then(function() {
            return Models.CriticComment.forge().fetchPage();
          })
          .then(function(results) {
            expect(results.length).to.equal(0);
          });
      });

      it('returns the limit and offset instead of page and pageSize', function() {
        return Models.Customer.forge()
          .fetchPage({limit: 2, offset: 2})
          .then(function(results) {
            var md = results.pagination;
            ['rowCount', 'pageCount', 'limit', 'offset'].forEach(function(prop) {
              expect(md).to.have.property(prop);
            });
          });
      });

      it('fetches a page of results with specified page size', function() {
        return Models.Customer.forge()
          .fetchPage({pageSize: 2})
          .then(function(results) {
            var md = results.pagination;
            expect(md.rowCount).to.equal(4);
            expect(md.pageCount).to.equal(2);
            expect(md.page).to.equal(1);
          });
      });

      it('fetches a page with specified offset', function() {
        return Models.Customer.forge()
          .orderBy('id', 'ASC')
          .fetchPage({limit: 2, offset: 2})
          .then(function(results) {
            var m = results.models;
            expect(parseInt(m[0].get('id'))).to.equal(3);
            expect(parseInt(m[1].get('id'))).to.equal(4);
          });
      });

      it('fetches a page by page number', function() {
        return Models.Customer.forge()
          .orderBy('id', 'ASC')
          .fetchPage({pageSize: 2, page: 2})
          .then(function(results) {
            var m = results.models;
            expect(parseInt(m[0].get('id'))).to.equal(3);
            expect(parseInt(m[1].get('id'))).to.equal(4);
          });
      });

      it('fetches a page when other columns are specified on the original query', function() {
        return Models.Customer.forge()
          .query(function(qb) {
            qb.column.apply(qb, ['name']);
          })
          .fetchPage()
          .then(function(results) {
            var md = results.pagination;
            expect(md.rowCount).to.equal(4);
          });
      });

      it('returns correct values for rowCount and pageCount when hasTimestamps is used', function() {
        return Models.Admin.forge()
          .fetchPage({page: 1, pageSize: 4})
          .then(function(admins) {
            expect(admins.pagination.rowCount).to.be.a('number');
            expect(admins.pagination.pageCount).to.be.a('number');
          });
      });
    });

    describe('Model.fetchPage()', function() {
      it('fetches a page without calling forge', function() {
        return Models.Customer.fetchPage().then(function(results) {
          ['models', 'pagination'].forEach(function(prop) {
            expect(results).to.have.property(prop);
          });
        });
      });
    });

    describe('Collection#fetchPage()', function() {
      it('fetches a page from a collection', function() {
        return Models.Customer.collection()
          .fetchPage()
          .then(function(results) {
            ['models', 'pagination'].forEach(function(prop) {
              expect(results).to.have.property(prop);
            });
          });
      });

      it('fetches a page from a relation collection', function() {
        return Models.User.forge({uid: 1})
          .roles()
          .fetchPage()
          .then(function(results) {
            expect(results.length).to.equal(1);
            ['models', 'pagination'].forEach(function(prop) {
              expect(results).to.have.property(prop);
            });
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
            expect(results.length).to.equal(0);
            ['models', 'pagination'].forEach(function(prop) {
              expect(results).to.have.property(prop);
            });
          });
      });
    });

    describe('inside a transaction', function() {
      it('returns consistent results for rowCount and number of models', function() {
        return bookshelf.transaction(function(t) {
          var options = {transacting: t};

          return Models.Site.forge({name: 'A new site'})
            .save(null, options)
            .then(function() {
              options.pageSize = 25;
              options.page = 1;
              return Models.Site.forge().fetchPage(options);
            })
            .then(function(sites) {
              expect(sites.pagination.rowCount).to.eql(sites.models.length);
            });
        });
      });
    });

    describe('with groupBy', function() {
      it('counts grouped rows instead of total rows', function() {
        var total;

        return Models.Blog.count()
          .then(function(count) {
            total = parseInt(count, 10);

            return Models.Blog.query(function(qb) {
              qb.max('id');
              qb.groupBy('site_id');
              qb.whereNotNull('site_id');
            }).fetchPage();
          })
          .then(function(blogs) {
            expect(blogs.pagination.rowCount).to.equal(blogs.length);
            expect(blogs.length).to.be.below(total);
          });
      });

      it('counts grouped rows when using table name qualifier', function() {
        var total;

        return Models.Blog.count()
          .then(function(count) {
            total = parseInt(count, 10);

            return Models.Blog.query(function(qb) {
              qb.max('id');
              qb.groupBy('blogs.site_id');
              qb.whereNotNull('site_id');
            }).fetchPage();
          })
          .then(function(blogs) {
            expect(blogs.pagination.rowCount).to.equal(blogs.length);
            expect(blogs.length).to.be.below(total);
          });
      });
    });

    describe('with distinct', function() {
      it('counts distinct occurences of a column instead of total rows', function() {
        var total;

        return Models.Post.count()
          .then(function(count) {
            total = parseInt(count, 10);

            return Models.Post.query(function(qb) {
              qb.distinct('owner_id');
            }).fetchPage();
          })
          .then(function(distinctPostOwners) {
            expect(distinctPostOwners.pagination.rowCount).to.equal(distinctPostOwners.length);
            expect(distinctPostOwners.length).to.be.below(total);
          });
      });
    });

    describe('with fetch Options', function() {
      var Site = Models.Site;

      afterEach(function() {
        delete Site.prototype.initialize;
      });

      it('ignore standard options for count query', function() {
        const allOptions = [];

        Site.prototype.initialize = function() {
          this.on('fetching:collection', function(collection, columns, options) {
            allOptions.push(_.omit(options, 'query'));
          });
        };

        var site = new Site();

        return site
          .fetchPage({
            require: true,
            withRelated: ['blogs'],
            columns: 'name'
          })
          .then(function() {
            expect(allOptions.length).equals(2);
            expect(allOptions[1]).not.deep.equals(allOptions[0]);

            const countOptions = allOptions.find(function(option) {
              return !_.has(option, ['require', 'withRelated', 'columns']);
            });
            const fetchOptions = allOptions.find(function(option) {
              return _.has(option, ['require', 'withRelated', 'columns']);
            });

            expect(countOptions).not.to.be.null;
            expect(fetchOptions).not.to.be.null;
          });
      });

      it('keep custom options for count query', function() {
        const allOptions = [];

        Site.prototype.initialize = function() {
          this.on('fetching:collection', function(collection, columns, options) {
            allOptions.push(_.omit(options, 'query'));
          });
        };

        var site = new Site();

        return site
          .fetchPage({
            withRelated: ['blogs'],
            customOption: true
          })
          .then(function() {
            expect(allOptions.length).equals(2);
            expect(allOptions[1]).not.deep.equals(allOptions[0]);

            const countOptions = allOptions.find(function(option) {
              return !_.has(option, ['withRelated']);
            });
            const fetchOptions = allOptions.find(function(option) {
              return _.has(option, ['withRelated']);
            });

            expect(countOptions).not.to.be.null;
            expect(fetchOptions).not.to.be.null;
            expect(countOptions.customOption).to.equal(true);
            expect(fetchOptions.customOption).to.equal(true);
            expect(countOptions.customOption).to.equal(fetchOptions.customOption);
          });
      });
    });
  });
};
