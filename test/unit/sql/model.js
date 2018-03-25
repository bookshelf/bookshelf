var Promise = global.testPromise;
var equal = require('assert').equal;
var notStrictEqual = require('assert').notStrictEqual;
var _ = require('lodash');
var path     = require('path');
var basePath = process.cwd();

module.exports = function() {
  var Model = require(path.resolve(basePath + '/lib/model'));

  describe('Model', function() {
    describe('#save', function() {
      it('should clone the passed in `options` object', function() {
        var model = new Model();
        var options = {
          query: {}
        };

        model.sync = function(opts) {
          notStrictEqual(options, opts);

          return {
            insert: function(opts) {
              return Promise.resolve({});
            }
          };
        };

        return model.save(null, options).then(function() {
          equal(_.difference(Object.keys(options), ['query']).length, 0);
        });
      });
    });

    describe('#timestamp', function() {
      it('will set the updated_at and the created_at attributes to a new date for new models', function() {
        var newModel = new Model({}, {hasTimestamps: true});
        newModel.timestamp();

        expect(newModel.get('created_at')).to.be.an.instanceOf(Date);
        expect(newModel.get('updated_at')).to.be.an.instanceOf(Date);
      });

      it('will not set the created_at attribute to a new date for existing models', function() {
        var existingModel = new Model({id: 1}, {hasTimestamps: true});
        existingModel.timestamp();

        expect(existingModel.get('created_at')).to.be.undefined;
        expect(existingModel.get('updated_at')).to.be.an.instanceOf(Date);
      });

      it('will set the created_at attribute when inserting new models with a predefined id value', function() {
        var model = new Model({id: 1}, {hasTimestamps: true});
        model.timestamp({method: 'insert'});

        expect(model.get('created_at')).to.be.an.instanceOf(Date);
        expect(model.get('updated_at')).to.be.an.instanceOf(Date);
      });

      it('will not set timestamps on a model if hasTimestamps isn\'t set', function () {
        var model = new Model();
        model.timestamp();

        expect(model.get('created_at')).to.not.exist;
        expect(model.get('updated_at')).to.not.exist;
      });
    });
  });
};
