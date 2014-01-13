var _         = require('lodash');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

module.exports = function (bookshelf) {

  describe('Visibility plugin', function () {
    before(function() {
      bookshelf.plugin('visibility');
    });

    it('allows to hide properties from serialization by specifying `this.hidden`', function () {
      var m = new (bookshelf.Model.extend({
        hidden: ['name']
      }))({id: 1, name: 'Joe', lastName: 'Shmoe'});

      deepEqual(_.keys(m.toJSON()), ['id', 'lastName']);
    });

    it('allows to whitelist properties for serialization by specifying `this.visible`', function () {
      var m = new (bookshelf.Model.extend({
        visible: ['name']
      }))({id: 1, name: 'Joe', lastName: 'Shmoe'});

      deepEqual(_.keys(m.toJSON()), ['name']);
    });

    it('has a higher priority for `this.hidden`', function () {
      var m = new (bookshelf.Model.extend({
        hidden: ['id'],
        visible: ['name']
      }))({id: 1, name: 'Joe', lastName: 'Shmoe'});

      deepEqual(_.keys(m.toJSON()), ['name', 'lastName']);
    });

    it('does not modify the `toJSON` result, if neither `this.hidden` nor `this.visible` is defined', function () {
      var m = new (bookshelf.Model.extend({
      }))({id: 1, name: 'Joe', lastName: 'Shmoe'});

      deepEqual(_.keys(m.toJSON()), ['id', 'name', 'lastName']);
    });

  });
};
