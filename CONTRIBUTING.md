## How to contribute to Bookshelf.js

* Before sending a pull request for a feature or bug fix, be sure to have
[tests](https://github.com/tgriesser/bookshelf/tree/master/test). 

* Use the same coding style as the rest of the
[codebase](https://github.com/tgriesser/bookshelf/blob/master/bookshelf.js).

* Files in the `/browser` folder are built automatically. You don't need to edit them.

* All pull requests should be made to the `master` branch.

### Running the Tests

The test suite requires you to create a [MySQL](https://www.mysql.com/) and [Postgres](http://www.postgresql.org/) database named `bookshelf_test`.

Once you have done that, you can run the tests:

```sh
$ npm test
```