var _         = require('lodash');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

module.exports = function (bookshelf) {

  describe('Cast plugin', function () {
    before(function() {
      bookshelf.plugin('cast');
    });

    it('allows to cast model properties using a function', function () {
      var m = new (bookshelf.Model.extend({
        cast: {
          dateTime: function(value) {
            return new Date(value);
          }
        }
      }))({dateTime: '2015-01-01'});

      equal(m.dateTime, new Date('2015-01-01'));
    });

    it('allows casted properties to be set and get like normal properties', function () {
      var m = new (bookshelf.Model.extend({
        cast: {
          dateTime: function(value) {
            return new Date(value);
          }
        }
      }))({dateTime: '2015-01-01'});

      equal(m.get('dateTime'), new Date('2015-01-01'));

      m.set({dateTime: '2015-02-02'});
      equal(m.get('dateTime'), new Date('2015-02-02'));
    });

    it('allows casted properties to be set in the constructor', function () {
      var m = new (bookshelf.Model.extend({
        cast: {
          dateTime: function(value) {
            return new Date(value);
          }
        }
      }))({dateTime: '2015-01-01'});

      equal(m.get('dateTime'), new Date('2015-01-01'));
    });

  });
  
};
