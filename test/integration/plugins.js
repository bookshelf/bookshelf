var _        = require('lodash');

module.exports = function(Bookshelf) {

  describe('Plugins', function() {

    describe('exec', function() {

      it('adds `then` and `exec` to all sync methods', function() {

        Bookshelf.plugin(require(process.cwd() + '/plugins/exec'));

        var model      = new Bookshelf.Model();
        var collection = new Bookshelf.Collection();

        _.each(['load', 'fetch', 'save', 'destroy'], function(method) {
        var fn = model[method]();
        if (!_.isFunction(fn.then) || !_.isFunction(fn.exec)) {
          throw new Error('then and exec are not both defined');
        }
        });

        _.each(['load', 'fetch'], function(method) {
        var fn = collection[method]();
        if (!_.isFunction(fn.then) || !_.isFunction(fn.exec)) {
          throw new Error('then and exec are not both defined');
        }
        });

      });

    });

  });

};