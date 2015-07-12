# [bookshelf.js](http://bookshelfjs.org) [![Build Status](https://travis-ci.org/tgriesser/bookshelf.svg?branch=master)](https://travis-ci.org/tgriesser/bookshelf)

Bookshelf is a JavaScript ORM for Node.js, built on the [Knex](http://knexjs.org) SQL query builder. Featuring both promise based and traditional callback interfaces, it follows the Model & Collection patterns seen in [Backbone.js](http://backbonejs.com), providing transaction support, eager/nested-eager relation loading, polymorphic associations, and support for one-to-one, one-to-many, and many-to-many relations.

It is designed to work well with PostgreSQL, MySQL, and SQLite3.

The project is [hosted on GitHub](http://github.com/tgriesser/bookshelf/), and has a comprehensive [test suite](https://travis-ci.org/tgriesser/bookshelf).

## Introduction

Bookshelf aims to provide a simple library for common tasks when querying databases in JavaScript, and forming relations between these objects, taking a lot of ideas from the the [Data Mapper Pattern](http://en.wikipedia.org/wiki/Data_mapper_pattern). With a concise, literate codebase, Bookshelf is simple to read, understand, and extend. It doesn't force you to use any specific validation scheme, provides flexible and efficient relation/nested-relation loading, and first class transaction support. It's a lean Object Relational Mapper, allowing you to drop down to the raw knex interface whenever you need a custom query that doesn't quite fit with the stock conventions.

Bookshelf follows the excellent foundation provided by Backbone.js Models and Collections, using similar patterns, naming conventions, and philosophies to build a lightweight, easy to navigate ORM. If you know how to use Backbone, you probably already know how to use Bookshelf.

## Installation

You'll need to install a copy of [knex.js](http://knexjs.org/), and either mysql, pg, or sqlite3 from npm.

```js
$ npm install knex --save
$ npm install bookshelf --save

# Then add one of the following:
$ npm install pg
$ npm install mysql
$ npm install mariasql
$ npm install sqlite3
```

The Bookshelf library is initialized by passing an initialized [Knex](http://knexjs.org/) client instance. The [knex documentation](http://knexjs.org/) provides a number of examples for different databases.

```js
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test',
    charset  : 'utf8'
  }
});

var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
  tableName: 'users'
});
```

This initialization should likely only ever happen once in your application, as it creates a connection pool for the current database, you should use the `bookshelf` instance returned throughout your library. You'll need to store this instance created by the initialize somewhere in the application you can reference it. A common pattern to follow is to initialize the client in a module so you can easily reference it later:

```js
// In a file named something like bookshelf.js
var knex = require('knex')(dbConfig);
module.exports require('bookshelf')(knex);

// elsewhere, to use the bookshelf client:
var bookshelf = require('./bookshelf');

var Post = bookshelf.Model.extend({
  // ...
});
```

## Examples

Here is an example to get you started:

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
