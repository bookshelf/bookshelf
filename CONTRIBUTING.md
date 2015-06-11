## How to contribute to Bookshelf.js

* Before sending a pull request for a feature or bug fix, be sure to have
[tests](https://github.com/tgriesser/bookshelf/tree/master/test).

* Use the same coding style as the rest of the
[codebase](https://github.com/tgriesser/bookshelf/blob/master/bookshelf.js).

* Files in the `/browser` folder are built automatically. You don't need to edit them.

* All pull requests should be made to the `master` branch.

### Development Environment Setup

You'll need to have `git` installed obviously. Begin by forking the [main
 repository](https://github.com/tgriesser/bookshelf) and then getting the code from your forked copy:

```sh
$ git clone git@github.com:yourusername/bookshelf.git
```

Afterwards go to the bookshelf directory that was just created and install the dependencies:

```sh
$ npm install
```

At this point the only thing missing are the databases that will be used for running some of the tests of the automated
test suite.

For [MySQL](https://www.mysql.com/) you will need to make sure it is possible to connect as the user `root` without the
need for a password.

In the case of [PostgreSQL](http://www.postgresql.org/) the requirement is to be able to connect as the `postgres` user
on localhost also without the need for a password. This can be achieved by editing or adding the following line in the
`pg_hba.conf` file:

```
host    all             all             127.0.0.1/32            trust
```

The `trust` tells the locally running PostgreSQL server to ignore user passwords and always grant access on clients
connecting locally. Do not use this setting in a production environment.

After having ensured the test suite can access both database servers just create a new database on each that will be
used exclusively by Bookshelf.js:

```SQL
CREATE DATABASE bookshelf_test;
```

### Running the Tests

The test suite requires that both MySQL and PostgreSQL servers have a database named `bookshelf_test`. See the section
above for further instructions.

Once you have done that, you can run the tests:

```sh
$ npm test
```

Always make sure all the tests are passing before sending a pull request.
