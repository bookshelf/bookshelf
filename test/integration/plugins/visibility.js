var _         = require('lodash');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

module.exports = function (bookshelf) {

  describe('Visibility plugin', function () {
    var m;

    before(function() {
      bookshelf.plugin('visibility');
    });

    beforeEach(function() {
      m = new bookshelf.Model({firstName: 'Joe', lastName: 'Shmoe', address: '123 Main St.'});
    });

    it('uses a `visible` property on the model will only show those fields', function () {
      m.visible = ['firstName'];
      deepEqual(m.toJSON(), {firstName: 'Joe'});
    });

    it('uses a `hidden` property on the model will hide those fields', function () {
      m.hidden = ['firstName'];
      deepEqual(m.toJSON(), {lastName: 'Shmoe', address: '123 Main St.'});
    });

    it('uses both `hidden` and `visible` if both are set, prioritizing `firstName`', function() {
      m.visible = ['firstName', 'lastName'];
      m.hidden = ['lastName'];
      deepEqual(m.toJSON(), {firstName: 'Joe'});
    });

  });
};
