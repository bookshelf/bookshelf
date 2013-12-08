// Base Sync
// ---------------

// An example "sync" object which is extended
// by dialect-specific sync implementations,
// making Bookshelf effectively a data store
// agnostic "Data Mapper".
var Backbone = require('backbone');

var Promise  = require('./promise');
var Helpers  = require('./helpers');

// Used as the base of the prototype chain,
// a convenient object for any `instanceof`
// checks you may need.
var BaseSync = module.exports = function() {};

BaseSync.prototype = {

  // Return a single model object.
  first: Promise.method(Helpers.missingMethod('Sync.first')),

  // Select one or more models, returning an array
  // of data objects.
  select: Promise.method(Helpers.missingMethod('Sync.select')),

  // Insert a single row, returning an object
  // (typically containing an "insert id").
  insert: Promise.method(Helpers.missingMethod('Sync.insert')),

  // Update an object in the data store.
  update: Promise.method(Helpers.missingMethod('Sync.update')),

  // Delete a record from the data store.
  del: Promise.method(Helpers.missingMethod('Sync.del'))

};

BaseSync.extend = require('simple-extend');