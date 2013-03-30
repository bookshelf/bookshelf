
var Q = require('q');
var _ = require('underscore');
var Shelf = require('../bookshelf');

describe('Bookshelf.js', function() {

  before(function (done) {

    Shelf.initialize({
      client: 'mysql',
      connection: {
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        port     : 8889,
        database : 'tgdb',
        charset  : 'utf8'
      }
    });

    // Shelf.initialize({
    //   client: 'sqlite3',
    //   connection: {
    //     debug    : true,
    //     filename  : './tgdb'
    //   }
    // });    

    var promise = require('./schema/migration').then(function () {
      return require('./schema/inserts');
    }).then(function () {
      done();
    }, function (err) {
      console.log(promise.stack);
      console.log(arguments);
      console.log(Knex.lastQuery);
      done(err);
    });
  
    return promise;

  });

  require('./model');
  require('./collection');
  require('./relation');
  require('./events');
});
