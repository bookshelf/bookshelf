// Registry Plugin -
// Create a central registry of model/collection constructors to
// help with the circular reference problem, and for convenience in relations.
// -----
module.exports = function (Bookshelf) {
  'use strict';
  var _ = require('lodash');

  function preventOverwrite(store, name) {
    if (store[name]) throw new Error(name + ' is already defined in the registry');
  }

  // Set up the methods for storing and retrieving models
  // on the Bookshelf instance.
  Bookshelf.model = function(name, ModelCtor) {
    this._models = this._models || Object.create(null);
    if (ModelCtor) {
      preventOverwrite(this._models, name);
      this._models[name] = ModelCtor;
    }
    return this._models[name];
  };
  Bookshelf.collection = function(name, CollectionCtor) {
    this._collections = this._collections || Object.create(null);
    if (CollectionCtor) {
      preventOverwrite(this._collections, name);
      this._collections[name] = CollectionCtor;
    }
    return this._collections[name];
  };

  // Check the collection or module caches for a Model or Collection constructor,
  // returning if the input is not an object. Check for a collection first,
  // since these are potentially used with *-to-many relation. Otherwise, check for a
  // registered model, throwing an error if none are found.
  function resolveModel(input) {
    if (typeof input === 'string') {
      return Bookshelf.collection(input) || Bookshelf.model(input) || (function() {
        throw new Error('The model ' + input + ' could not be resolved from the registry plugin.');
      })();
    }
    return input;
  }

  var Model = Bookshelf.Model;
  var Collection = Bookshelf.Collection;

  // Re-implement the `Bookshelf.Model` relation methods to include a check for the registered model.
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