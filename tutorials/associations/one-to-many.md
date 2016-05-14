One-to-many associations can be created with {@link Model#belongsTo belongsTo}, {@link Model#hasMany hasMany}, {@link Model#morphMany morphMany} / {@link Model#morphTo morphTo}, and some of the {@link Model#through through} relation types.

    var Book = bookshelf.Model.extend({
      tableName: 'books',
      pages: function() {
        return this.hasMany(Page);
      }
    });

    var Page = bookshelf.Model.extend({
      tableName: 'pages',
      book: function() {
        return this.belongsTo(Book);
      }
    });

A Knex migration for the above relationship could be created with:

    exports.up = function(knex, Promise) {
      return knex.schema.createTable('books', function(table) {
        table.increments('id').primary();
        table.string('name');
      }).createTable('pages', function(table) {
        table.increments('id').primary();
        table.string('content');
        table.integer('book_id').references('books.id')
      });
    };

    exports.down = function(knex, Promise) {
      return knex.schema.dropTable('books')
        .dropTable('pages');
    };
