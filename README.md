# bookshelf.js

[![NPM Version](https://img.shields.io/npm/v/bookshelf.svg?style=flat)](https://www.npmjs.com/package/bookshelf)
[![Build Status](https://api.travis-ci.org/bookshelf/bookshelf.svg?branch=master)](https://travis-ci.org/bookshelf/bookshelf)
[![Dependency Status](https://david-dm.org/bookshelf/bookshelf/status.svg)](https://david-dm.org/bookshelf/bookshelf)
[![devDependency Status](https://david-dm.org/bookshelf/bookshelf/dev-status.svg)](https://david-dm.org/bookshelf/bookshelf?type=dev)

Bookshelf is a JavaScript ORM for Node.js, built on the [Knex](http://knexjs.org) SQL query builder. It features both Promise-based and traditional callback interfaces, transaction support, eager/nested-eager relation loading, polymorphic associations, and support for one-to-one, one-to-many, and many-to-many relations.

It is designed to work with PostgreSQL, MySQL, and SQLite3.

[Website and documentation](http://bookshelfjs.org). The project is [hosted on GitHub](http://github.com/bookshelf/bookshelf/), and has a comprehensive [test suite](https://travis-ci.org/bookshelf/bookshelf).

## Introduction

Bookshelf aims to provide a simple library for common tasks when querying databases in JavaScript, and forming relations between these objects, taking a lot of ideas from the [Data Mapper Pattern](http://en.wikipedia.org/wiki/Data_mapper_pattern).

With a concise, literate codebase, Bookshelf is simple to read, understand, and extend. It doesn't force you to use any specific validation scheme, and provides flexible, efficient relation/nested-relation loading and first-class transaction support.

It's a lean object-relational mapper, allowing you to drop down to the raw Knex interface whenever you need a custom query that doesn't quite fit with the stock conventions.

## Installation

You'll need to install a copy of [Knex](http://knexjs.org/), and either `mysql`, `pg`, or `sqlite3` from npm.

```js
$ npm install knex
$ npm install bookshelf

# Then add one of the following:
$ npm install pg
$ npm install mysql
$ npm install sqlite3
```

The Bookshelf library is initialized by passing an initialized [Knex](http://knexjs.org/) client instance. The [Knex documentation](http://knexjs.org/) provides a number of examples for different databases.

```js
// Setting up the database connection
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test',
    charset  : 'utf8'
  }
})
const bookshelf = require('bookshelf')(knex)

// Defining models
const User = bookshelf.model('User', {
  tableName: 'users'
})
```

This initialization should likely only ever happen once in your application. As it creates a connection pool for the current database, you should use the `bookshelf` instance returned throughout your library. You'll need to store this instance created by the initialize somewhere in the application so you can reference it. A common pattern to follow is to initialize the client in a module so you can easily reference it later:

```js
// In a file named, e.g. bookshelf.js
const knex = require('knex')(dbConfig)
module.exports = require('bookshelf')(knex)

// elsewhere, to use the bookshelf client:
const bookshelf = require('./bookshelf')

const Post = bookshelf.model('Post', {
  // ...
})
```

## Examples

Here is an example to get you started:

```js
const knex = require('knex')({
  client: 'mysql',
  connection: process.env.MYSQL_DATABASE_CONNECTION
})
const bookshelf = require('bookshelf')(knex)

const User = bookshelf.model('User', {
  tableName: 'users',
  posts() {
    return this.hasMany(Posts)
  }
})

const Post = bookshelf.model('Post', {
  tableName: 'posts',
  tags() {
    return this.belongsToMany(Tag)
  }
})

const Tag = bookshelf.model('Tag', {
  tableName: 'tags'
})

new User({id: 1}).fetch({withRelated: ['posts.tags']}).then((user) => {
  console.log(user.related('posts').toJSON())
}).catch((error) => {
  console.error(error)
})
```

## Official Plugins

* [Virtuals](https://github.com/bookshelf/virtuals-plugin): Define virtual properties on your model to compute new values.
* [Case Converter](https://github.com/bookshelf/case-converter-plugin): Handles the conversion between the database's snake_cased and a model's camelCased properties automatically.
* [Processor](https://github.com/bookshelf/processor-plugin): Allows defining custom processor functions that handle transformation of values whenever they are `.set()` on a model.

## Community plugins

* [bookshelf-cascade-delete](https://github.com/seegno/bookshelf-cascade-delete) - Cascade delete related models on destroy.
* [bookshelf-json-columns](https://github.com/seegno/bookshelf-json-columns) - Parse and stringify JSON columns on save and fetch instead of manually define hooks for each model (PostgreSQL and SQLite).
* [bookshelf-mask](https://github.com/seegno/bookshelf-mask) - Similar to the functionality of the {@link Model#visible} attribute but supporting multiple scopes, masking models and collections using the [json-mask](https://github.com/nemtsov/json-mask) API.
* [bookshelf-schema](https://github.com/bogus34/bookshelf-schema) - A plugin for handling fields, relations, scopes and more.
* [bookshelf-signals](https://github.com/bogus34/bookshelf-signals) - A plugin that translates Bookshelf events to a central hub.
* [bookshelf-paranoia](https://github.com/estate/bookshelf-paranoia) - Protect your database from data loss by soft deleting your rows.
* [bookshelf-uuid](https://github.com/estate/bookshelf-uuid) - Automatically generates UUIDs for your models.
* [bookshelf-modelbase](https://github.com/bsiddiqui/bookshelf-modelbase) - An alternative to extend `Model`, adding timestamps, attribute validation and some native CRUD methods.
* [bookshelf-advanced-serialization](https://github.com/sequiturs/bookshelf-advanced-serialization) - A more powerful visibility plugin, supporting serializing models and collections according to access permissions, application context, and after ensuring relations have been loaded.
* [bookshelf-plugin-mode](https://github.com/popodidi/bookshelf-plugin-mode) - Plugin inspired by the functionality of the {@link Model#visible} attribute, allowing to specify different modes with corresponding visible/hidden fields of model.
* [bookshelf-secure-password](https://github.com/venables/bookshelf-secure-password) - A plugin for easily securing passwords using bcrypt.
* [bookshelf-default-select](https://github.com/DJAndries/bookshelf-default-select) - Enables default column selection for models. Inspired by the functionality of the {@link Model#visible} attribute, but operates on the database level.
* [bookshelf-ez-fetch](https://github.com/DJAndries/bookshelf-ez-fetch) - Convenient fetching methods which allow for compact filtering, relation selection and error handling.
* [bookshelf-manager](https://github.com/ericclemmons/bookshelf-manager) - Model & Collection manager to make it easy to create & save deep, nested JSON structures from API requests.

## Support

Have questions about the library? Come join us in the [#bookshelf freenode IRC channel](http://webchat.freenode.net/?channels=bookshelf) for support on [knex.js](http://knexjs.org/) and bookshelf.js, or post an issue on [Stack Overflow](http://stackoverflow.com/questions/tagged/bookshelf.js).

## Contributing

If you want to contribute to Bookshelf you'll usually want to report an issue or submit a
pull-request. For this purpose the [online repository](https://github.com/bookshelf/bookshelf/) is
available on GitHub.

For further help setting up your local development environment or learning how you can contribute to
Bookshelf you should read the [Contributing document](https://github.com/bookshelf/bookshelf/blob/master/.github/CONTRIBUTING.md)
available on GitHub.

## F.A.Q.

### Can I use standard node.js style callbacks?

Yes, you can call `.asCallback(function(err, resp) {` on any database operation method and use the standard `(err, result)` style callback interface if you prefer.

### My relations don't seem to be loading, what's up?

Make sure to check that the type is correct for the initial parameters passed to the initial model being fetched. For example `new Model({id: '1'}).load([relations...])` will not return the same as `new Model({id: 1}).load([relations...])` - notice that the id is a string in one case and a number in the other. This can be a common mistake if retrieving the id from a url parameter.

This is only an issue if you're eager loading data with load without first fetching the original model. `new Model({id: '1'}).fetch({withRelated: [relations...]})` should work just fine.

### My process won't exit after my script is finished, why?

The issue here is that Knex, the database abstraction layer used by Bookshelf, uses connection pooling and thus keeps the database connection open. If you want your process to exit after your script has finished, you will have to call `.destroy(cb)` on the `knex` property of your `Bookshelf` instance or on the `Knex` instance passed during initialization. More information about connection pooling can be found over at the [Knex docs](http://knexjs.org/#Installation-pooling).

### How do I debug?

If you pass `debug: true` in the options object to your `knex` initialize call, you can see all of the query calls being made. You can also pass that same option to all methods that access the database, like `model.fetch()` or `model.destroy()`. Examples:

```js
// Turning on debug mode for all queries
const knex = require('knex')({
  debug: true,
  client: 'mysql',
  connection: process.env.MYSQL_DATABASE_CONNECTION
})
const bookshelf = require('bookshelf')(knex)

// Debugging a single query
new User({id: 1}).fetch({debug: true, withRelated: ['posts.tags']}).then(user => {
  // ...
})
```

Sometimes you need to dive a bit further into the various calls and see what all is going on behind the scenes. You can use [node-inspector](https://github.com/dannycoates/node-inspector), which allows you to debug code with `debugger` statements like you would in the browser.

Bookshelf uses its own copy of the `bluebird` Promise library. You can read up [here](http://bluebirdjs.com/docs/api/promise.config.html) for more on debugging Promises.

Adding the following block at the start of your application code will catch any errors not otherwise caught in the normal Promise chain handlers, which is very helpful in debugging:

```js
process.stderr.on('data', (data) => {
  console.log(data)
})
```

### How do I run the test suite?

See the [CONTRIBUTING](https://github.com/bookshelf/bookshelf/blob/master/.github/CONTRIBUTING.md#running-the-tests)
document on GitHub.

### Can I use Bookshelf outside of Node.js?

While it primarily targets Node.js, all dependencies are browser compatible, and it could be adapted to work with other javascript environments supporting a sqlite3 database, by providing a custom [Knex adapter](http://knexjs.org/#Adapters). No such adapter exists though.

### Which open-source projects are using Bookshelf?

We found the following projects using Bookshelf, but there can be more:

* [Ghost](https://ghost.org/) (A blogging platform) uses bookshelf. [[Link](https://github.com/TryGhost/Ghost/tree/master/core/server/models)]
* [Soapee](http://soapee.com/) (Soap Making Community and Resources) uses bookshelf. [[Link](https://github.com/nazar/soapee-api/tree/master/src/models)]
* [NodeZA](http://nodeza.co.za/) (Node.js social platform for developers in South Africa) uses bookshelf. [[Link](https://github.com/qawemlilo/nodeza/tree/master/models)]
* [Sunday Cook](https://github.com/sunday-cooks/sunday-cook) (A social cooking event platform) uses bookshelf. [[Link](https://github.com/sunday-cooks/sunday-cook/tree/master/server/bookshelf)]
* [FlyptoX](http://www.flyptox.com/) (Open-source Node.js cryptocurrency exchange) uses bookshelf. [[Link](https://github.com/FlipSideHR/FlyptoX/tree/master/server/models)]
* And of course, everything on [here](https://www.npmjs.com/browse/depended/bookshelf) use bookshelf too.
