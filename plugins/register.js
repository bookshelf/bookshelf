module.exports = function (Bookshelf) {
  'use strict';

  var _       = require('lodash');

  // Set up the methods for storing and retrieving models on the Bookshelf
  // instance

  _.extend(Bookshelf, {
    model: function(name, Model) {
      if (Model) {
        this._models = this._models || {};
        this._models[name] = Model;
      }

      return this._models[name];
    },
    collection: function(name, Collection) {
      if (Collection) {
        this._collections = this._collections || {};
        this._collections[name] = Collection;
      }

      return this._collections[name];
    }
  });

  // Resolve a module from a string or module
  function resolveModel(input) {
    // if the input is a string, try to resolve it into a module reference
    if (typeof input === 'string') {
      // Try using a model first, falling back to a collection
      return Bookshelf.model(input) || Bookshelf.collection(input);
    } else {
      // If the input is anything other than a string, return it untouched
      return input;
    }
  }

  var Model = Bookshelf.Model;
  // Monkey patch Bookshelf.Model's relation methods
  _.each(['hasMany', 'hasOne', 'belongsToMany', 'morphOne', 'morphMany', 'belongsTo', 'through'], function(method) {
    // Store the original method
    var original = Model.prototype[method];
    // Patch the method
    Model.prototype[method] = function() {
      // The first argument is always a model, so resolve it
      arguments[0] = resolveModel(arguments[0]);
      return original.apply(this, arguments);
    };
  });

  // morphTo takes the name first, and then a variadic set of models so we
  // can't include it with the rest of the relational methods
  var morphTo = Model.prototype.morphTo;
  Model.prototype.morphTo = function() {
    for (var i = 1; i < arguments.length; i++) {
      arguments[i] = resolveModel(arguments[i]);
    }
    return morphTo.apply(this, arguments);
  };

};