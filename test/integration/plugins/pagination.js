var Promise = require('bluebird');
var expect = require('chai').expect;
var sinon = require('sinon');

module.exports = function (bookshelf) {

  describe('Pagination Plugin', function () {

    bookshelf.plugin('pagination');
    var Models = require('../helpers/objects')(bookshelf).Models;



    describe('Model instance fetchPage', function () {

      it('fetches a single page of results with defaults', function () {
        return Models.Customer.forge().fetchPage().then(function (results) {
          ['models', 'pagination'].forEach(function (prop) {
            expect(results).to.have.property(prop);
          });

          ['rowCount', 'pageCount', 'page', 'pageSize'].forEach(function (prop) {
            expect(results.pagination).to.have.property(prop);
          })

          var md = results.pagination;

          expect(md.rowCount).to.equal(4);
          expect(md.pageCount).to.equal(1);
          expect(md.page).to.equal(1);
          expect(md.pageSize).to.equal(10);
        })
      })

      it('returns the limit and offset instead of page and pageSize', function () {
        return Models.Customer.forge().fetchPage({ limit: 2, offset: 2 }).then(function (results) {
          var md = results.pagination;
          ['rowCount', 'pageCount', 'limit', 'offset'].forEach(function (prop) {
            expect(md).to.have.property(prop);
          })
        });
      })

      it('fetches a page of results with specified page size', function () {
        return Models.Customer.forge().fetchPage({ pageSize: 2 }).then(function (results) {
          var md = results.pagination;
          expect(md.rowCount).to.equal(4);
          expect(md.pageCount).to.equal(2);
          expect(md.page).to.equal(1);
        })
      })

      it('fetches a page with specified offset', function () {
        return Models.Customer.forge().orderBy('id', 'ASC').fetchPage({ limit: 2, offset: 2 }).then(function (results) {
          var m = results.models
          expect(parseInt(m[0].get('id'))).to.equal(3);
          expect(parseInt(m[1].get('id'))).to.equal(4);
        })
      })

      it('fetches a page by page number', function () {
        return Models.Customer.forge().orderBy('id', 'ASC').fetchPage({ pageSize: 2, page: 2 }).then(function (results) {
          var m = results.models;
          expect(parseInt(m[0].get('id'))).to.equal(3);
          expect(parseInt(m[1].get('id'))).to.equal(4);
        })
      })

      it('fetches a page when other columns are specified on the original query', function () {
        return Models.Customer.forge().query(function (qb) {
          qb.column.apply(qb, ['name'])
        }).fetchPage().then(function (results) {
          var md = results.pagination;
          expect(md.rowCount).to.equal(4);
        })
      })
    })

    describe('Model static fetchPage', function () {
      it('fetches a page without calling forge', function () {
        return Models.Customer.fetchPage().then(function (results) {
          ['models', 'pagination'].forEach(function (prop) {
            expect(results).to.have.property(prop);
          });
        })
      })
    })

    describe('Collection fetchPage', function () {
      it('fetches a page from a collection', function () {
        return Models.Customer.collection().fetchPage().then(function (results) {
          ['models', 'pagination'].forEach(function (prop) {
            expect(results).to.have.property(prop);
          });
        })
      })
    })

  });
};
