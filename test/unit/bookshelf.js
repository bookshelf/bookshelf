module.exports = function() {
  describe('Bookshelf', function() {
    let Bookshelf;

    before(() => {
      Bookshelf = require('../../lib/bookshelf');
    });

    describe('.VERSION', function() {
      let bookshelf;

      before(() => {
        const Knex = require('knex');
        bookshelf = Bookshelf(Knex({client: 'sqlite3', useNullAsDefault: true}));
      });

      after(() => {
        return bookshelf.knex.destroy();
      });

      it('should equal version number in package.json', function() {
        const p = require('../../package');
        expect(bookshelf.VERSION).to.equal(p.version);
      });
    });

    describe('Construction', function() {
      it('should fail without a knex instance', function() {
        expect(() => Bookshelf()).to.throw(/Invalid knex/);
      });

      it('should fail if passing a random object', function() {
        expect(() => Bookshelf({config: 'something', options: ['one', 'two']})).to.throw(/Invalid knex/);
      });
    });
  });
};
