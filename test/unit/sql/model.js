var Promise   = testPromise;
var equal = require('assert').equal;
var _ = require('lodash');

module.exports = function() {

  // This module is included into the `bookshelf` repository,
  // and run from the root of the directory.
  var path     = require('path');
  var basePath = process.cwd();

  var Model = require(path.resolve(basePath + '/dialects/sql/model')).Model;

  describe('Model', function () {

    describe('#save', function () {

      it('should clone the passed in `options` object', function () {
        var model = new Model();
        var options = {
          query: {}
        };

        model.sync = function () {
          return {
            insert: function() {
              return Promise.resolve({});
            }
          };
        };

        return model.save(null, options).then(function () {
          equal(_.difference(Object.keys(options), ['query']).length, 0);
        });
      });

    });

  });

};
