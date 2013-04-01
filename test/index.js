
var Q = require('q');
var _ = require('underscore');
var Bookshelf = require('../bookshelf');

before(function(ok) {

  Bookshelf.Initialize({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      user : 'root',
      password : 'root',
      database : 'tgdb',
      port : 8889,
      charset : 'utf8'
    }
  });

  // Load all of the tables and
  // data for the tests.
  require('./data/migration')
    .then(function() {
      return require('./data/inserts');
    })
    .then(function() {
      ok();
    }).done();

});

require('./model');
require('./collection');
require('./relations');
require('./events');