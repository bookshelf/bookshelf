Many-to-many associations can be created with {@link Model#belongsToMany belongsToMany}, and {@link Model#through through} relation types.

    var Book = bookshelf.Model.extend({
      tableName: 'books',
      authors: function() {
        return this.belongsToMany(Author);
      }
    });

    var Author = bookshelf.Model.extend({
      tableName: 'authors',
      books: function() {
        return this.belongsToMany(Book);
      }
    });

A Knex migration for the above relationship could be created with:

    exports.up = function(knex, Promise) {
      return knex.schema.createTable('books', function(table) {
        table.increments('id').primary();
        table.string('name');
      }).createTable('authors', function(table) {
        table.increments('id').primary();
        table.string('name');
      }).createTable('authors_books', function(table) {
        table.integer('author_id').references('authors.id');
        table.integer('book_id').references('books.id');
      });
    };

    exports.down = function(knex, Promise) {
      return knex.schema.dropTable('books')
        .dropTable('authors')
        .dropTable('authors_books');
    };
