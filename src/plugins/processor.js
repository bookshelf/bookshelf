/**
 * Attribute Processor Plugin
 *
 * Allows defining custom processor functions that handle transformation of values whenever they are `.set()` on a model. This
 * plugin modifies the {@link Model#set} method so that any defined processor functions get called when a value is set on a
 * model. It also adds some methods to {@link Bookshelf} instances to handle adding and removing processors.
 */

var _ = require('lodash');

module.exports = function processorPlugin(bookshelf) {
  var processors = {};
  var proto = bookshelf.Model.prototype;

  /**
   * @method Bookshelf#addProcessor
   * @description
   * Adds a processor to the associated Bookshelf instance. You must specify a name string and the function to add:
   *
   *     var bookshelf = Bookshelf(knex);
   *     bookshelf.plugin('processor');
   *     bookshelf.addProcessor('trim', function(string) { return string.trim(); });
   *
   * @param {string} name The name of the processor to add. This is how the processor will be identified.
   * @param {function} processor The actual processor function to add.
   * @return {undefined}
   */
  bookshelf.addProcessor = function addProcessor(name, processor) {
    if (typeof name !== 'string' || name.length === 0) throw new Error('You must specify a processor name string');
    if (typeof processor !== 'function') throw new Error('You must specify a function to load as processor');
    processors[name] = processor;
  }

  /**
   * @method Bookshelf#removeProcessor
   * @description
   * Removes a previously added processor from the associated Bookshelf instance. You must specify a name string. If the name
   * doesn't match an existing processor nothing will change and no error will be emitted.
   *
   *     var bookshelf = Bookshelf(knex);
   *     bookshelf.plugin('processor');
   *     bookshelf.removeProcessor('trim');
   *
   * @param {string} name The name of the processor to remove. This is the same name string that was used when adding it.
   * @return {undefined}
   */
  bookshelf.removeProcessor = function removeProcessor(name) {
    if (Array.isArray(name)) {
      return name.forEach(this.removeProcessor);
    }
    delete processors[name];
  }

  /**
   * @method Bookshelf#removeAllProcessors
   * @description
   * Removes all previously added processors from the associated Bookshelf instance. If there are no processors already then
   * nothing will change and no error will be emitted.
   *
   *     var bookshelf = Bookshelf(knex);
   *     bookshelf.plugin('processor');
   *     bookshelf.removeAllProcessors();
   *
   * @return {undefined}
   */
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

    /**
     * @method Model#processAttribute
     * @memberof Model
     * @description
     * Tries to process an attribute using the associated processor or just returning the value as it is if there are no
     * processors defined for the attribute being transformed. This method is used internally by the Processor Plugin and there
     * is usually no reason to use it directly.
     *
     *     var bookshelf = Bookshelf(knex);
     *     var MyModel = bookshelf.Model.extend({
     *       tableName: 'my_models',
     *       processors: {
     *         name: 'trim'
     *       }
     *     });
     *
     *     bookshelf.plugin('processor');
     *     var processedValue = new MyModel().processAttribute('something   ', 'name');
     *     // processedValue === 'something'
     *
     * @param {mixed} value The value that is to be transformed.
     * @param {string} key The attribute name key.
     * @return {mixed} The transformed value.
     */
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
