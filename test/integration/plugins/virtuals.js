var _         = require('lodash');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;
var expect    = require('chai').expect;

module.exports = function (bookshelf) {

  describe('Virtuals plugin', function () {
    before(function() {
      bookshelf.plugin('virtuals');
    });

    it('allows to create virtual properties on the model', function () {
      var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});

      equal(m.fullName, 'Joe Shmoe');
    });

    it('allows to create virtual properties with getter and setter', function () {
      var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: {
            get: function () {
              return this.get('firstName') + ' ' + this.get('lastName');
            },
            set: function(value) {
              value = value.split(' ');
              this.set('firstName', value[0]);
              this.set('lastName', value[1]);
            }
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});

      equal(m.fullName, 'Joe Shmoe');
      m.fullName = 'Jack Shmoe';

      equal(m.fullName, 'Jack Shmoe');
      equal(m.get('firstName'), 'Jack');
      equal(m.get('lastName'), 'Shmoe');
    });

    it('defaults virtual properties with no setter to a noop', function () {
       var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: function () {
            return this.get('firstName') + ' ' + this.get('lastName');
          }
        }
      }))({fullName: 'Jane Doe'});

      expect(m.attributes.fullName).to.be.undefined;

      m.set('fullName', 'John Doe');

      expect(m.attributes.fullName).to.be.undefined;
    });

    it('allows virtual properties to be set and get like normal properties', function () {
      var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: {
            get: function () {
              return this.get('firstName') + ' ' + this.get('lastName');
            },
            set: function(value) {
              value = value.split(' ');
              this.set('firstName', value[0]);
              this.set('lastName', value[1]);
            }
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});

      equal(m.get('fullName'), 'Joe Shmoe');

      m.set('fullName', 'Jack Shmoe');
      equal(m.get('firstName'), 'Jack');
      equal(m.get('lastName'), 'Shmoe');

      // setting virtual should not set attribute
      equal(m.attributes['fullName'], undefined);

      m.set({fullName: 'Peter Griffin', dogName:'Brian'});
      equal(m.get('firstName'), 'Peter');
      equal(m.get('lastName'), 'Griffin');
      equal(m.get('dogName'), 'Brian');

      // setting virtual should not set attribute
      equal(m.attributes['fullName'], undefined);
    });

    it('allows virtual properties to be set in the constructor', function () {
      var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: {
            get: function () {
              return this.get('firstName') + ' ' + this.get('lastName');
            },
            set: function(value) {
              value = value.split(' ');
              this.set('firstName', value[0]);
              this.set('lastName', value[1]);
            }
          }
        }
      }))({fullName: 'Peter Griffin', dogName:'Brian'});

      equal(m.get('firstName'), 'Peter');
      equal(m.get('lastName'), 'Griffin');
      equal(m.get('dogName'), 'Brian');
      equal(m.attributes['fullName'], undefined);
    });

    it('virtuals are included in the `toJSON` result by default', function () {
      var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
          },
          fullNameWithGetSet: {
            get: function () {
              return this.get('firstName') + ' ' + this.get('lastName');
            },
            set: function(value) {
              value = value.split(' ');
              this.set('firstName', value[0]);
              this.set('lastName', value[1]);
            }
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});

      var json = m.toJSON();
      deepEqual(_.keys(json), ['firstName', 'lastName', 'fullName', 'fullNameWithGetSet']);
    });

    it('virtuals are not included in the `toJSON` result, if `outputVirtuals` is set to `false`', function () {
      var m = new (bookshelf.Model.extend({
        outputVirtuals: false,
        virtuals: {
          fullName: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});
      var json = m.toJSON();
      deepEqual(_.keys(json), ['firstName', 'lastName']);
    });

    it('virtuals are included in the `toJSON` result, if `outputVirtuals` is set to `false` but `virtuals: true` is set in the `options` for `toJSON`', function () {
      var m = new (bookshelf.Model.extend({
        outputVirtuals: false,
        virtuals: {
          fullName: function() {
            return this.get('firstName') + ' ' + this.get('lastName');
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});
      var json = m.toJSON({virtuals: true});
      deepEqual(_.keys(json), ['firstName', 'lastName', 'fullName']);
    });

    it('virtuals are not included in the `toJSON` result, if `outputVirtuals` is set to `true` but `virtuals: false` is set in the `options` for `toJSON`', function () {
      var m = new (bookshelf.Model.extend({
        outputVirtuals: true,
        virtuals: {
          fullName: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});

      var json = m.toJSON({virtuals: false});
      deepEqual(_.keys(json), ['firstName', 'lastName']);
    });

    it('does not crash when no virtuals are set - #168', function () {
      var m = new bookshelf.Model();
      m.set('firstName', 'Joe');
      equal(m.get('firstName'), 'Joe');
    });

    it('works fine with `underscore` methods - #170', function () {
       var m = new (bookshelf.Model.extend({
        outputVirtuals: true,
        virtuals: {
          fullName: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});

      deepEqual(m.keys(), ['firstName', 'lastName', 'fullName']);
      deepEqual(m.values(), ['Joe', 'Shmoe', 'Joe Shmoe']);
      deepEqual(m.pairs(), [['firstName', 'Joe'], ['lastName', 'Shmoe'], ['fullName', 'Joe Shmoe']]);
      deepEqual(m.invert(), {'Joe': 'firstName', 'Shmoe': 'lastName','Joe Shmoe': 'fullName'});
      deepEqual(m.pick('fullName'), {'fullName': 'Joe Shmoe'});
      deepEqual(m.omit('firstName'), {'lastName': 'Shmoe', 'fullName': 'Joe Shmoe'});
    });

  });
};
