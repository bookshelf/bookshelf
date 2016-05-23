One-to-one associations can be created with {@link Model#belongsTo belongsTo}, {@link Model#hasOne hasOne}, and {@link Model#morphOne morphOne} relation types.

    var Book = bookshelf.Model.extend({
      tableName: 'books',
      summary: function() {
        return this.hasOne(Summary);
      }
    });

    var Summary = bookshelf.Model.extend({
      tableName: 'summaries',
      book: function() {
        return this.belongsTo(Book);
      }
    });

A Knex migration for the above relationship could be created with:

    exports.up = function(knex, Promise) {
      return knex.schema.createTable('books', function(table) {
        table.increments('id').primary();
        table.string('name');
      }).createTable('summaries', function(table) {
        table.increments('id').primary();
        table.string('details');
        table.integer('book_id').unique().references('books.id');
      });
    };

    exports.down = function(knex, Promise) {
      return knex.schema.dropTable('books')
        .dropTable('summaries');
    };
