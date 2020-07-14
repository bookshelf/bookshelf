One-to-one associations can be created with {@link Model#belongsTo belongsTo}, {@link Model#hasOne hasOne}, and {@link Model#morphOne morphOne} relation types.

```js
const Book = bookshelf.model('Book', {
  tableName: 'books',
  summary() {
    return this.hasOne('Summary')
  }
})

const Summary = bookshelf.model('Summary', {
  tableName: 'summaries',
  book() {
    return this.belongsTo('Book')
  }
})
```
A Knex migration for the above relationship could be created with:

```js
exports.up = function(knex) {
  return knex.schema.createTable('books', function(table) {
    table.increments('id').primary()
    table.string('name')
  }).createTable('summaries', function(table) {
    table.increments('id').primary()
    table.string('details')
    table.integer('book_id').unique().references('books.id')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('books')
    .dropTable('summaries')
}
```
