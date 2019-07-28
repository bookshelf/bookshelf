One-to-many associations can be created with {@link Model#belongsTo belongsTo}, {@link Model#hasMany hasMany}, {@link Model#morphMany morphMany} / {@link Model#morphTo morphTo}, and some of the {@link Model#through through} relation types.

```js
const Book = bookshelf.model('Book', {
  tableName: 'books',
  pages() {
    return this.hasMany('Page')
  }
})

const Page = bookshelf.model('Page', {
  tableName: 'pages',
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
  }).createTable('pages', function(table) {
    table.increments('id').primary()
    table.string('content')
    table.integer('book_id').references('books.id')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('books')
    .dropTable('pages')
}
```
