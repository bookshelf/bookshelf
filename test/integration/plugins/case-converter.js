module.exports = function(bookshelf) {
  describe('Case Converter Plugin', function() {
    var Author;
    var author;

    before(function() {
      bookshelf.plugin('case-converter');
      Author = require('../helpers/objects')(bookshelf).Models.Author;
      author = new Author({siteId: 1});
    })

    describe('Model#parse()', function() {
      it('converts snake case attributes to camel case', function() {
        var parsedAttributes = author.parse({first_name: 'Aayla', last_name: 'Secura'})
        expect(parsedAttributes).to.have.property('firstName');
        expect(parsedAttributes.firstName).to.equal('Aayla');
      })

      it('converts attributes to camel case when fetching data from the database', function() {
        return new Author({id: 1}).fetch().then(function(author) {
          expect(author.attributes).to.have.property('firstName');
          expect(author.attributes).to.not.have.property('first_name');
          expect(author.get('firstName')).to.equal('Tim');
        })
      })
    })

    describe('Model#format()', function() {
      it('converts camel case attributes to snake case', function() {
        var formattedAttributes = author.format({firstName: 'Aayla', lastName: 'Secura'})
        expect(formattedAttributes).to.have.property('first_name');
        expect(formattedAttributes.first_name).to.equal('Aayla');
      })

      it('converts attributes to snake case when saving data to the database', function() {
        return new Author({siteId: 1, firstName: 'Aayla', lastName: 'Secura'}).save().then(function(author) {
          expect(author.attributes).to.have.property('id')
          expect(author.isNew()).to.be.false;
        })
      })
    })
  })
}
