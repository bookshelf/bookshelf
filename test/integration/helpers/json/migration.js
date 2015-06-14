var _ = require('lodash');
var Promise = global.testPromise;

var drops = [
  'units', 'commands'
];

module.exports = function(bookshelf) {

  var schema = bookshelf.knex.schema;

  return Promise.all(_.map(drops, function(val) {
    return schema.dropTableIfExists(val);
  }))
  .then(function() {

    return schema.createTable('units', function(table) {
      table.increments('id');
      table.string('name');
    })
    .createTable('commands', function(table) {
      table.increments('id');
      table.integer('unit_id').notNullable();
      table.string('type');
      table.json('info');
    })
  });

};
