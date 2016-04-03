var Promise = require('bluebird');
var expect = require('chai').expect;
var sinon = require('sinon');
var _ = require('lodash');

module.exports = function (bookshelf) {

  describe('Pagination Plugin', function () {

    before(function () {
      return require('../helpers/migration')(bookshelf).then(function () {
        return require('../helpers/inserts')(bookshelf);
      });
    })

    bookshelf.plugin('pagination');
    var Models = require('../helpers/objects')(bookshelf).Models;

    describe('orderBy', function () {

      it('returns results in the correct order', function () {
        var asc = Models.Customer.forge().orderBy('id', 'ASC').fetchAll()
          .then(function (result) {
            return result.toJSON().map(function (row) { return row.id });
          });

        var desc = Models.Customer.forge().orderBy('id', 'DESC').fetchAll()
          .then(function (result) {
            return result.toJSON().map(function (row) { return row.id });
          })

        return Promise.join(asc, desc)
          .then(function (results) {
            expect(results[0].reverse()).to.eql(results[1]);
          });
      });

      it('returns DESC order results with a minus sign', function () {
        return Models.Customer.forge().orderBy('-id').fetchAll().then(function (results) {
          expect(parseInt(results.models[0].get('id'))).to.equal(4);
        });
      })

    });

    describe('fetchPage', function () {

      it('fetches a single page of results with defaults', function () {
        return Models.Customer.forge().fetchPage().then(function (results) {
          ['models', 'pagination'].forEach(function (prop) {
            expect(results).to.have.property(prop);
          });

          ['total', 'limit', 'offset', 'page', 'rowCount'].forEach(function (prop) {
            expect(results.pagination).to.have.property(prop);
          })

          var pagination = results.pagination;

          expect(pagination.limit).to.equal(10);
          expect(pagination.offset).to.equal(0);
          expect(pagination.page).to.equal(1);
          expect(parseInt(pagination.total)).to.equal(4);
        })
      })

      it('fetches a page of results with specified page size', function () {
        return Models.Customer.forge().fetchPage({ limit: 2 }).then(function (results) {
          expect(parseInt(results.pagination.rowCount)).to.equal(2);
          expect(parseInt(results.pagination.total)).to.equal(4);
        })
      })

      it('fetches a page with specified offset', function () {
        return Models.Customer.forge().orderBy('id', 'ASC').fetchPage({ limit: 2, offset: 2 }).then(function (results) {
          expect(parseInt(results.models[0].get('id'))).to.equal(3);
          expect(parseInt(results.models[1].get('id'))).to.equal(4);
        })
      })

      it('fetches a page by page number', function () {
        return Models.Customer.forge().orderBy('id', 'ASC').fetchPage({ limit: 2, page: 2 }).then(function (results) {
          expect(parseInt(results.models[0].get('id'))).to.equal(3);
          expect(parseInt(results.models[1].get('id'))).to.equal(4);
        })
      })
    })
  });
};