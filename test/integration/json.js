var _       = require('lodash');
var Promise = global.testPromise;


module.exports = function(bookshelf) {

  var isJsonSupported;

  function checkResponse(actual, expected) {
    // Knex will store strings if client does not support JSON.
    if (!isJsonSupported) {
      expected = _.mapValues(expected, function(value) {
        if (_.isObject(value)) {
          return JSON.stringify(value);
        }
        return value
      });
    }
    expect(actual).to.eql(expected);
  }

  before(function() {
    return require('./helpers/json/supported')(bookshelf).then(function(supported) {
      isJsonSupported = supported;
      return require('./helpers/json/migration')(bookshelf)
    }).then(function() {
       return require('./helpers/json/inserts')(bookshelf);
    });
  });

  describe('JSON support', function() {
    var Models = require('./helpers/json/objects')(bookshelf).Models;

    var Tank = Models.Tank;
    var Command = Models.Command;


    it('can `fetch` a model with a JSON column', function() {
      return Command.forge({id: 0}).fetch()
        .then(function(command) {
          checkResponse(command.attributes, {
            id: 0,
            unit_id: 1,
            type: 'move',
            info: {
              target: {
                x: 5,
                y: 10
              }
            }
          });
        });
    });

    it('Trying to fetch a model automatically excludes JSON column', function() {
      return Command.forge({unit_id: 1, type: 'attack', info: {test: 'blah'}}).fetch()
        .then(function(command) {
          checkResponse(command.attributes, {
            id: 1,
            unit_id: 1,
            type: 'attack',
            info: {
              weapon: 'cannon',
              target: {
                x: 2,
                y: 2
              }
            }
          });
        });
    });
  });
};
