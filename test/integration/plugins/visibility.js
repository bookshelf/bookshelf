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

    it('uses an `options.visible` argument to only show those fields on the model', function () {
      var visible = ['firstName'];
      deepEqual(m.toJSON({visible: visible}), {firstName: 'Joe'});
    });

    it('uses an `options.hidden` argument to hide those fields on the model', function () {
      var hidden = ['firstName'];
      deepEqual(m.toJSON({hidden: hidden}), {lastName: 'Shmoe', address: '123 Main St.'});
    });

    it('uses both an `options.hidden` and `options.visible` argument and if both are set, prioritizing `firstName`', function() {
      var visible = ['firstName', 'lastName'];
      var hidden = ['lastName'];
      deepEqual(m.toJSON({visible: visible, hidden: hidden}), {firstName: 'Joe'});
    });

    it('overrides a `visible` property using an `options.visible` argument to only show fields specified by the argument', function () {
      m.visible = ['lastName'];
      var visible = ['firstName'];
      deepEqual(m.toJSON({visible: visible}), {firstName: 'Joe'});
    });

    it('overrides a `hidden` property using an `options.hidden` argument to only show fields specified by the argument', function () {
      m.hidden = ['lastName'];
      var hidden = ['firstName'];
      deepEqual(m.toJSON({hidden: hidden}), {lastName: 'Shmoe', address: '123 Main St.'});
    });

    it('overrides both `hidden` and `visible` using an `options.hidden` and `options.visible` argument, prioritizing `firstName`', function() {
      m.visible = ['lastName', 'address'];
      m.hidden = ['address'];

      var visible = ['firstName', 'lastName'];
      var hidden = ['lastName'];
      deepEqual(m.toJSON({visible: visible, hidden: hidden}), {firstName: 'Joe'});
    });

  });
};
