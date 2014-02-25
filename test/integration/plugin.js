var _ = require('lodash');

module.exports = function (Bookshelf) {

  var options, spy;
  beforeEach(function () {
    options = {};
    spy = sinon.spy();
  });

  describe('Plugin', function () {

    it('can be the name of an included plugin', function () {
      Bookshelf.plugin('registry');
      expect(Bookshelf).to.itself.respondTo('model');
    });

    it('can be the path to a plugin', function () {
      var plugin = require('./helpers/plugin');
      Bookshelf.plugin('./test/integration/helpers/plugin', options);
      expect(plugin).to.have.been.calledWith(Bookshelf, options);
    });

    it('can be an array of plugins', function () {
      Bookshelf.plugin([spy], options);
      expect(spy).to.have.been.calledWith(Bookshelf, options);
    });

    it('can be a function', function () {
      Bookshelf.plugin(spy, options);
      expect(spy).to.have.been.calledWith(Bookshelf, options);
    });

    it('returns the Bookshelf instance for chaining', function () {
      expect(Bookshelf.plugin(spy, options)).to.equal(Bookshelf);
    });

  });

};