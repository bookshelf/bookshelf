var _         = require('lodash');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

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
    });

    it('virtuals are included in the `toJSON` result, if `outputVirtuals` is set to `true` on the model', function () {
      var m = new (bookshelf.Model.extend({
        outputVirtuals: true,
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

    it('virtuals are not included in the `toJSON` result, if `outputVirtuals` is set to `false` or is not defined on the model', function () {
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
      deepEqual(_.keys(json), ['firstName', 'lastName']);
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
