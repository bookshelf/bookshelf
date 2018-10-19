'use strict';

// Registry Plugin -
// Create a central registry of model/collection constructors to
// help with the circular reference problem, and for convenience in relations.
// -----

const _ = require('lodash');

function preventOverwrite(store, name) {
  if (store[name]) throw new Error(name + ' is already defined in the registry');
}

function ModelNotResolvedError() {
  ModelNotResolvedError.prototype = Object.create(Error.prototype, {
    constructor: {
      value: ModelNotResolvedError,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  Object.setPrototypeOf(ModelNotResolvedError, Error);

  function ModelNotResolvedError() {
    return Object.getPrototypeOf(ModelNotResolvedError).apply(this, arguments);
  }

  return ModelNotResolvedError;
}

module.exports = function(bookshelf) {
  // Check the collection or module caches for a Model or Collection constructor,
  // returning if the input is not an object. Check for a collection first,
  // since these are potentially used with *-to-many relation. Otherwise, check for a
  // registered model, throwing an error if none are found.
  function resolveModel(input) {
    if (typeof input === 'string') {
      return (
        bookshelf.collection(input) ||
        bookshelf.model(input) ||
        (function() {
          throw new ModelNotResolvedError('The model ' + input + ' could not be resolved from the registry plugin.');
        })()
      );
    }
    return input;
  }

  const Collection = bookshelf.Collection;
  const collectionThrough = Collection.prototype.through;
  const Model = bookshelf.Model;
  const modelThrough = Model.prototype.through;
  const morphTo = Model.prototype.morphTo;
  const _relation = Model.prototype._relation;

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
  bookshelf.resolve = function(name) {};

  // Re-implement the `bookshelf.Model` _relation method to include a check for
  // the registered model.
  Model.prototype._relation = function() {
    // The second argument is always a model, so resolve it and call the original method.
    return _relation.apply(this, _.update(arguments, 1, resolveModel));
  };

  // `morphTo` takes the relation name first, and then a variadic set of models so we
  // can't include it with the rest of the relational methods.
  Model.prototype.morphTo = function(relationName) {
    var candidates;
    var columnNames;

    if (Array.isArray(arguments[1]) || arguments[1] == null) {
      columnNames = arguments[1]; // may be `null` or `undefined`
      candidates = _.drop(arguments, 2);
    } else {
      columnNames = null;
      candidates = _.drop(arguments, 1);
    }

    // try to use the columnNames as target instead
    if (Array.isArray(columnNames)) {
      try {
        columnNames[0] = resolveModel(columnNames[0]);
      } catch (err) {
        // if it did not work, they were real columnNames
        if (err instanceof ModelNotResolvedError) throw err;
      }
    }

    var models = _.map(candidates, function(target) {
      if (Array.isArray(target)) {
        const model = target[0];
        const morphValue = target[1];
        return [resolveModel(model), morphValue];
      } else {
        return resolveModel(target);
      }
    });

    return morphTo.apply(this, [relationName, columnNames].concat(models));
  };

  // The `through` method doesn't use `_relation` beneath, so we have to
  // re-implement it specifically
  Model.prototype.through = function() {
    // The first argument is the model
    return modelThrough.apply(this, _.update(arguments, 0, resolveModel));
  };

  // The `through` method exists on the Collection as well, for
  // `hasMany` / `belongsToMany` through relations.
  Collection.prototype.through = function() {
    // The first argument is the model
    return collectionThrough.apply(this, _.update(arguments, 0, resolveModel));
  };
};
