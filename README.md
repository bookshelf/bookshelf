# [bookshelf.js](http://bookshelfjs.org) [![Build Status](https://travis-ci.org/tgriesser/bookshelf.png?branch=master)](https://travis-ci.org/tgriesser/bookshelf)

Bookshelf is a Node.js ORM with support for PostgreSQL, MySQL / MariaDB, and SQLite3.

It is built atop the <a href="http://knexjs.org">Knex Query Builder</a>,
and is strongly influenced by the Model and Collection foundations of Backbone.js.

It features [transaction support](http://bookshelfjs.org/#Bookshelf-transaction), one-to-one, one-to-many, many-to-many, and polymorphic relations.

For Docs, License, Tests, FAQ, and other information, see: http://bookshelfjs.org.

To suggest a feature, report a bug, or general discussion: http://github.com/tgriesser/bookshelf/issues/

## Examples

We have several examples [on the website](http://bookshelfjs.org). Here is the first one to get you started:

```js
var knex = require('knex')({client: 'mysql', connection: process.env.MYSQL_DATABASE_CONNECTION });
var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
  tableName: 'users',
  messages: function() {
    return this.hasMany(Posts);
  }
});

var Posts = bookshelf.Model.extend({
  tableName: 'messages',
  tags: function() {
    return this.belongsToMany(Tag);
  }
});

var Tag = bookshelf.Model.extend({
  tableName: 'tags'
})

User.where('id', 1).fetch({withRelated: ['posts.tags']}).then(function(user) {

  console.log(user.related('posts').toJSON());

}).catch(function(err) {

  console.error(err);

});
```

## Development

For development tasks such as testing, you need to clone the repository and install dependencies.

```
$ git clone git@github.com:tgriesser/bookshelf.git
$ cd bookshelf
$ npm install
```

### Testing

The testing suite requires you to create a [mysql](https://www.mysql.com/) and [postgresql](http://www.postgresql.org/) database named `bookshelf_test`

Once you have done that, you can run the tests
```
$ npm test
```
