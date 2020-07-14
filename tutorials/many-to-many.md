Many-to-many associations can be created with {@link Model#belongsToMany belongsToMany}, and {@link Model#through through} relation types.

```js
const Book = bookshelf.model('Book', {
  tableName: 'books',
  authors() {
    return this.belongsToMany('Author')
  }
})

const Author = bookshelf.model('Author', {
  tableName: 'authors',
  books() {
    return this.belongsToMany('Book')
  }
})
```
A Knex migration for the above relationship could be created with:

```js
exports.up = function(knex) {
  return knex.schema.createTable('books', function(table) {
    table.increments('id').primary()
    table.string('name')
  }).createTable('authors', function(table) {
    table.increments('id').primary()
    table.string('name')
  }).createTable('authors_books', function(table) {
    table.integer('author_id').unsigned().references('authors.id')
    table.integer('book_id').unsigned().references('books.id')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('authors_books')
    .dropTable('authors')
    .dropTable('books')
}
```
See {@tutorial associations}.
