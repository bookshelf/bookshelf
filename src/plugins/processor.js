var _ = require('lodash');

module.exports = function processorPlugin(bookshelf) {
  var processors = {};
  var proto = bookshelf.Model.prototype;

  bookshelf.addProcessor = function addProcessor(name, processor) {
    if (typeof name !== 'string' || name.length === 0) throw new Error('You must specify a processor name string');
    if (typeof processor !== 'function') throw new Error('You must specify a function to load as processor');
    processors[name] = processor;
  }

  bookshelf.removeProcessor = function removeProcessor(name) {
    if (Array.isArray(name)) {
      return name.forEach(this.removeProcessor);
    }
    delete processors[name];
  }

  bookshelf.removeAllProcessors = function removeAllProcessors() {
    processors = {};
  }

  bookshelf.Model = bookshelf.Model.extend({
    set: function(key, value, options) {
      var processedKey;
      var self = this;

      if (!key) return this;

      if (this.processors) {
        if (typeof key === 'object') {
          processedKey = _.transform(key, function(result, value, key) {
            result[key] = self.processAttribute(value, key);
          });

          return proto.set.call(this, processedKey, value, options);
        }

        value = this.processAttribute(value, key);
      }

      return proto.set.call(this, key, value, options);
    },

    processAttribute: function(value, key) {
      var processes;

      if (this.processors && this.processors[key]) processes = this.processors[key];
      if (!processes) return value;
      if (!Array.isArray(processes)) processes = [processes];

      processes.forEach(function(process) {
        var processor;

        if (typeof process === 'string') {
          processor = processors[process];
          if (!processor) throw new Error('Unknown processor `' + process + '`');
        }
        else {
          processor = process;
        }

        value = processor(value);
      });

      return value;
    }
  });
};
