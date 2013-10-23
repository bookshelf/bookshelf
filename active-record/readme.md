## Bookshelf Active Record

An extension of the database capabilities of [Bookshelf.js](http://bookshelfjs.org),
the Bookshelf Active Record provides a similar query interface to that of Rails' ActiveRecord.

```js
// Create a main instance of ActiveRecord at the beginning of your application
// lifecycle... after you initialize with `config` once, you may just require the
// module
var activeRecord = require('bookshelf/active-record').initialize(config);
```

This is still very much a work in progress.

#### [Active Record Basics](docs/basics.md)
This guide will get you started with models, persistence to database and the Active Record pattern and library.

#### [Active Record Validations](docs/validation.md)
This guide covers how you can use Active Record validations

#### [Active Record Callbacks](docs/callbacks.md)
This guide covers how you can use Active Record callbacks.

#### [Active Record Associations](docs/associations.md)
This guide covers all the associations provided by Active Record.

#### [Active Record Query Interface](docs/interface.md)
This guide covers the database query interface provided by Active Record.

#### [Database Migrations](docs/migration.md)
This guide covers how you can use Active Record migrations to alter your database in a structured and organized manner.
