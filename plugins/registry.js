// Registry Plugin -
// Create a central registry of model/collection constructors to
// help with the circular reference problem, and for convenience in relations.
// -----
module.exports = function (bookshelf) {
  'use strict';
  var _ = require('lodash');

  function preventOverwrite(store, name) {
    if (store[name]) throw new Error(name + ' is already defined in the registry');
  }

  bookshelf.registry = bookshelf.registry || {};

  // Set up the methods for storing and retrieving models
  // on the bookshelf instance.
  bookshelf.model = function(name, ModelCtor, staticProps) {
    this._models = this._models || Object.create(null);
    if (ModelCtor) {
      preventOverwrite(this._models, name);
      if (_.isPlainObject(ModelCtor)) {
        ModelCtor = this.Model.extend(ModelCtor, staticProps);
      }
      this._models[name] = ModelCtor;
    }
    return (this._models[name] = this._models[name] || bookshelf.resolve(name));
  };
  bookshelf.collection = function(name, CollectionCtor, staticProps) {
    this._collections = this._collections || Object.create(null);
    if (CollectionCtor) {
      preventOverwrite(this._collections, name);
      if (_.isPlainObject(CollectionCtor)) {
        CollectionCtor = this.Collection.extend(CollectionCtor, staticProps);
      }
      this._collections[name] = CollectionCtor;
    }
    return (this._collections[name] = this._collections[name] || bookshelf.resolve(name));
  };

  // Provide a custom function to resolve the location of a model or collection.
  bookshelf.resolve = function(name) { return void 0; };

  // Check the collection or module caches for a Model or Collection constructor,
  // returning if the input is not an object. Check for a collection first,
  // since these are potentially used with *-to-many relation. Otherwise, check for a
  // registered model, throwing an error if none are found.
  function resolveModel(input) {
    if (typeof input === 'string') {
      return bookshelf.collection(input) || bookshelf.model(input) || (function() {
        throw new Error('The model ' + input + ' could not be resolved from the registry plugin.');
      })();
    }
    return input;
  }

  var Model = bookshelf.Model;
  var Collection = bookshelf.Collection;

  // Re-implement the `bookshelf.Model` relation methods to include a check for the registered model.
  _.each(['hasMany', 'hasOne', 'belongsToMany', 'morphOne', 'morphMany', 'belongsTo', 'through'], function(method) {
    var original = Model.prototype[method];
    Model.prototype[method] = function(Target) {
      // The first argument is always a model, so resolve it and call the original method.
      return original.apply(this, [resolveModel(Target)].concat(_.rest(arguments)));
    };
  });

  // `morphTo` takes the relation name first, and then a variadic set of models so we
  // can't include it with the rest of the relational methods.
  var morphTo = Model.prototype.morphTo;
  Model.prototype.morphTo = function(relationName) {
    return morphTo.apply(this, [relationName].concat(_.map(_.rest(arguments), function(model) {
      return resolveModel(model);
    }, this)));
  };

  // The `through` method exists on the Collection as well, for `hasMany` / `belongsToMany` through relations.
  var collectionThrough = Collection.prototype.through;
  Collection.prototype.through = function(Target) {
    return collectionThrough.apply(this, [resolveModel(Target)].concat(_.rest(arguments)));
  };

};