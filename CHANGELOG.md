## Change Log

**1.2.0** <small>_Jun 07, 2020_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/1.1.1...1.2.0)

#### Features

- Add option to control auto refresh after save: [#2070](https://github.com/bookshelf/bookshelf/pull/2070)

#### Tests

- Adds some more integration tests to `Collection#fetch`: [#2079](https://github.com/bookshelf/bookshelf/pull/2079)

#### Dependencies

- Support Knex version 0.21.0 and up: [#2072](https://github.com/bookshelf/bookshelf/pull/2072)
- Update some dependencies of dependencies to fix security warnings: [#2078](https://github.com/bookshelf/bookshelf/pull/2078)

**1.1.1** <small>_Mar 28, 2020_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/1.1.0...1.1.1)

#### Bug fixes

- Fix attributes that are changed during event hook not being persisted: [#2062](https://github.com/bookshelf/bookshelf/pull/2062)
- Fix incorrect query object being sent to event handlers with `morphTo`: [#2059](https://github.com/bookshelf/bookshelf/pull/2059)
- Fix non-object attributes being passed to `model.parse()` in some cases: [#2056](https://github.com/bookshelf/bookshelf/pull/2056)

#### Documentation

- Fix typo in doclet: [#2057](https://github.com/bookshelf/bookshelf/pull/2057)

**0.15.2** <small>_Mar 28, 2020_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.15.1...0.15.2)

#### Bug fixes

- Fix attributes that are changed during event hook not being persisted: [#2063](https://github.com/bookshelf/bookshelf/pull/2063)

**1.1.0** <small>_Jan 31, 2020_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/1.0.1...1.1.0)

#### Features

- Add option to disable the count information in `fetchPage`: [#2045](https://github.com/bookshelf/bookshelf/pull/2045)

#### Tests

- Small refactor to some tests: [#2050](https://github.com/bookshelf/bookshelf/pull/2050)

#### Dependencies

- Update some dependencies to their latest versions: [#2053](https://github.com/bookshelf/bookshelf/pull/2053)
- Update Knex to version 0.20.8: [#2049](https://github.com/bookshelf/bookshelf/pull/2049)

**1.0.1** <small>_Oct 06, 2019_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/1.0.0...1.0.1)

#### Bug fixes

- Fix JSON.stringify causing TypeError in some cases: [#2029](https://github.com/bookshelf/bookshelf/pull/2029)

#### Documentation

- Add documentation for Model#id: [#2031](https://github.com/bookshelf/bookshelf/pull/2031)
- Fix number of arguments in Model#save doclet: [#2030](https://github.com/bookshelf/bookshelf/pull/2030)

#### Dependencies

- Update js-yaml to version 3.13.1: [#2023](https://github.com/bookshelf/bookshelf/pull/2023)
- Update handlebars to version 4.2.1: [#2022](https://github.com/bookshelf/bookshelf/pull/2022)
- Update uuid to version 3.3.3: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update sqlite3 to version 4.1.0: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update sinon to 7.4.2: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update prettier to 1.18.2: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update mocha to version 6.2.0: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update lint-staged to version 9.2.5: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update jsdoc to version 3.6.3: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update husky to version 3.0.5: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update eslint-plugin-prettier to version 3.1.1: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update eslint-config-prettier to version 6.3.0: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update eslint to version 6.4.0: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update chai to 4.2.0: [#2021](https://github.com/bookshelf/bookshelf/pull/2021)
- Update eslint-utils from 1.3.1 to 1.4.2: [#2020](https://github.com/bookshelf/bookshelf/pull/2020)

**1.0.0** <small>_Sep 13, 2019_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.15.1...1.0.0)

#### Breaking changes

- This version requires Node.js 8+ **if** using a Knex version greater than 0.18.4, otherwise Node.js 6 is still supported: [#1991](https://github.com/bookshelf/bookshelf/pull/1991)
- Make `require: true` the default for Model#fetch: [#2006](https://github.com/bookshelf/bookshelf/pull/2006)
- Remove some Model and Collection lodash based methods: [#2005](https://github.com/bookshelf/bookshelf/pull/2005)
- Change Collection#where so it behaves like Model#where: [#2001](https://github.com/bookshelf/bookshelf/pull/2001)
- Move all plugins to their own repositories: [#2000](https://github.com/bookshelf/bookshelf/pull/2000)
- Promote some useful plugins to core: [#1992](https://github.com/bookshelf/bookshelf/pull/1992), [#1993](https://github.com/bookshelf/bookshelf/pull/1993), [#1996](https://github.com/bookshelf/bookshelf/pull/1996)

#### Enhancements

- Refresh model attributes after a save operation: [#2012](https://github.com/bookshelf/bookshelf/pull/2012)

#### Bug fixes

- Fix missing columns after save: [#2012](https://github.com/bookshelf/bookshelf/pull/2012)
- Fix Case Converter plugin overriding any previously defined parse methods: [#2000](https://github.com/bookshelf/bookshelf/pull/2000), [case-converter-plugin@1.0.0](https://github.com/bookshelf/case-converter-plugin/releases/tag/v1.0.0)
- Fix registry saving models inadvertently across different bookshelf instances: [#1996](https://github.com/bookshelf/bookshelf/pull/1996)

#### Documentation

- Add example of how to use custom collections: [#2015](https://github.com/bookshelf/bookshelf/pull/2015)
- Improve documentation related to debug mode: [#2014](https://github.com/bookshelf/bookshelf/pull/2014)
- Add note that count methods return String with Postgres: [#2013](https://github.com/bookshelf/bookshelf/pull/2013)
- Fix typo in Readme: [#1998](https://github.com/bookshelf/bookshelf/pull/1998)
- Better Plugin Docs: [#1992](https://github.com/bookshelf/bookshelf/pull/1992), [#1993](https://github.com/bookshelf/bookshelf/pull/1993), [#1996](https://github.com/bookshelf/bookshelf/pull/1996), [#2000](https://github.com/bookshelf/bookshelf/pull/2000)

#### Dependencies

- Update lint-staged to version 9.1.0: [#1994](https://github.com/bookshelf/bookshelf/pull/1994)
- Update bluebird to 3.5.5: [#1991](https://github.com/bookshelf/bookshelf/pull/1991)
- Update lodash to 4.17.14: [#1991](https://github.com/bookshelf/bookshelf/pull/1991)
- Update mocha to version 6.1.4: [#1991](https://github.com/bookshelf/bookshelf/pull/1991)
- Update mysql to version 2.17.1: [#1991](https://github.com/bookshelf/bookshelf/pull/1991)
- Update pg to version 7.11.0: [#1991](https://github.com/bookshelf/bookshelf/pull/1991)
- Update sinon to version 7.3.2: [#1991](https://github.com/bookshelf/bookshelf/pull/1991)
- Update sinon-chai to version 3.3.0: [#1991](https://github.com/bookshelf/bookshelf/pull/1991)
- Update sqlite3 to version 4.0.9: [#1991](https://github.com/bookshelf/bookshelf/pull/1991)
- Update uuid to version 3.3.2: [#1991](https://github.com/bookshelf/bookshelf/pull/1991)
- Update eslint-config-prettier to 6.0.0: [#1957](https://github.com/bookshelf/bookshelf/pull/1987)
- Update eslint to version 6.0.0: [#1986](https://github.com/bookshelf/bookshelf/pull/1986)

**0.15.1** <small>_Jun 13, 2019_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.15.0...0.15.1)

- Update husky to version 2.4.1: [#1984](https://github.com/bookshelf/bookshelf/pull/1984)
- Bump supported knex version to 0.17: [#1982](https://github.com/bookshelf/bookshelf/pull/1982)

**0.15.0** <small>_Jun 13, 2019_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.14.2...0.15.0)

#### Breaking changes

- This version requires Node.js 6+
- Remove code that has been deprecated for a long time: [#1956](https://github.com/bookshelf/bookshelf/pull/1956)

#### Bug fixes

- `once` removes all events after it has been triggered: [#1972](https://github.com/bookshelf/bookshelf/pull/1972)
- Pagination details are wrong when selecting distinct values of a column: [#1950](https://github.com/bookshelf/bookshelf/pull/1950)
- Fix missing attributes in some events: [#1934](https://github.com/bookshelf/bookshelf/pull/1934)

#### Test Suite

- Fix Docker-compose.yml default postgres user: [#1972](https://github.com/bookshelf/bookshelf/pull/1972)
- Fix JSON tests on PostgreSQL 10+: [#1955](https://github.com/bookshelf/bookshelf/pull/1955)

#### Documentation

- Update and fix a lot of doclets: [#1951](https://github.com/bookshelf/bookshelf/pull/1951)
- Update README.md: [#1940](https://github.com/bookshelf/bookshelf/pull/1940)

#### Dependencies

- Update mocha to version 6.1.1: [#1968](https://github.com/bookshelf/bookshelf/pull/1968)
- Update eslint-config-prettier to 4.1.0: [#1957](https://github.com/bookshelf/bookshelf/pull/1957)
- Update sinon to version 7.2.4: [#1947](https://github.com/bookshelf/bookshelf/pull/1947)
- Update eslint to version 5.1.0: [#1930](https://github.com/bookshelf/bookshelf/pull/1930)

**0.14.2** <small>_Dec 17, 2018_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.14.1...0.14.2)

#### Bug fixes

- Fix crash when using `groupBy` with table qualifier in pagination plugin: [#1928](https://github.com/bookshelf/bookshelf/pull/1928)
- Fix `undefined` transaction object with Knex 0.15+: [#1926](https://github.com/bookshelf/bookshelf/pull/1926)

#### Refactoring

- Refactor logic behind `.timestamp()`'s decision for when to update the `updated_at` column: [#1892](https://github.com/bookshelf/bookshelf/pull/1892)

**0.14.1** <small>_Dec 09, 2018_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.14.0...0.14.1)

#### Enhancements

- Allow passing custom options to the pagination plugin's internal count method. This is useful for better interoperability with other plugins: [#1914](https://github.com/bookshelf/bookshelf/pull/1914)

#### Bug fixes

- Fix `withRelated` fetch option not always grouping properly when using binary primary keys: [#1918](https://github.com/bookshelf/bookshelf/pull/1918)

#### Documentation

- Add a basic Events guide and fix some issues with the events doclets: [#1917](https://github.com/bookshelf/bookshelf/pull/1917)

**0.14.0** <small>_Dec 09, 2018_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.13.3...0.14.0)

#### Breaking changes

- The `previous()` and `previousAttributes()` methods were changed so that whenever a model is saved or destroyed the previous attributes are no longer reset to the current attributes. Since the old behavior wasn't very useful it's likely this won't cause issues for many people. There's a [migration guide](https://github.com/bookshelf/bookshelf/wiki/Migrating-from-0.13.3-to-0.14.0#previous-and-previousattributes) in case you are affected by this change. [#1848](https://github.com/bookshelf/bookshelf/pull/1848)
- Fix incorrect results in collection when models have duplicate ids. Checkout the [migration guide](https://github.com/bookshelf/bookshelf/wiki/Migrating-from-0.13.3-to-0.14.0#passing-merge-false-remove-false-to-collectionset-and-default-behavior-with-duplicates) in case you are affected by this. [#1846](https://github.com/bookshelf/bookshelf/pull/1846)
- Empty `hasOne` relation will now return `null` instead of `{}` when serialized: [#1839](https://github.com/bookshelf/bookshelf/pull/1839). There's a [migration guide](https://github.com/bookshelf/bookshelf/wiki/Migrating-from-0.13.3-to-0.14.0#return-value-for-empty-hasone-relation) in the rare event this causes you problems.
- Add more helpful error messages on bad or insufficient `morphTo` data: [#1824](https://github.com/bookshelf/bookshelf/pull/1824). There's a [migration guide](https://github.com/bookshelf/bookshelf/wiki/Migrating-from-0.13.3-to-0.14.0#new-error-messages-on-bad-or-insufficient-morphto-data) in case you are affected by this.
- Changed the existing functionality so that saving a model that hasn't changed will not update its `updated_at` attribute: [#1798](https://github.com/bookshelf/bookshelf/pull/1798). Checkout the [migration guide](https://github.com/bookshelf/bookshelf/wiki/Migrating-from-0.13.3-to-0.14.0#saving-a-model-that-hasnt-changed-wont-update-updated_at) in case you are affected by this.

#### Enhancements

- Make collections iterable using `for ... of` loops: [#1830](https://github.com/bookshelf/bookshelf/pull/1830)
- Add row-level locking options: [#1810](https://github.com/bookshelf/bookshelf/pull/1810)

#### Bug fixes

- Return clones of nested objects in `previousAttributes()`: [#1876](https://github.com/bookshelf/bookshelf/pull/1876)
- Fix incorrect `rowCount` value when using `groupBy` with `fetchPage()`: [#1852](https://github.com/bookshelf/bookshelf/pull/1852)
- Fix eager loading of relations when using `parse`/`format`: [#1838](https://github.com/bookshelf/bookshelf/pull/1838)
- Fix inability to install bookshelf from git commit: [#1835](https://github.com/bookshelf/bookshelf/pull/1835)
- Fix `timestamp()` setting a key named `"null"` in some cases: [#1820](https://github.com/bookshelf/bookshelf/pull/1820)
- Fix performance of including relationships: [#1800](https://github.com/bookshelf/bookshelf/pull/1800)

#### Test Suite

- Add test to check for adding `withRelated` inside events: [#1853](https://github.com/bookshelf/bookshelf/pull/1853)
- Add Node.js 10 to the Travis config: [#1829](https://github.com/bookshelf/bookshelf/pull/1829)
- Fix incorrect output ordering in tests in some cases: [#1825](https://github.com/bookshelf/bookshelf/pull/1825)

#### Documentation

- Change the JSDoc theme to add a Guides section (this was already released): [#1909](https://github.com/bookshelf/bookshelf/pull/1909)
- Fix `hasOne`'s doc: [#1890](https://github.com/bookshelf/bookshelf/pull/1890)
- Fix many-to-many tutorial code: [#1888](https://github.com/bookshelf/bookshelf/pull/1888)
- Add code syntax highlighting for tutorials: [#1850](https://github.com/bookshelf/bookshelf/pull/1850)
- Fix a few issues with the collection documentation: [#1836](https://github.com/bookshelf/bookshelf/pull/1836)
- Fix `Model.load()` relations param: [#1834](https://github.com/bookshelf/bookshelf/pull/1834)
- Fix incorrect docs for collection:fetching event: [#1831](https://github.com/bookshelf/bookshelf/pull/1831)
- Add note on needing the Pagination plugin to use `fetchPage()`: [#1803](https://github.com/bookshelf/bookshelf/pull/1803)
- Fix incorrect data types and undocumented Model property: [#1797](https://github.com/bookshelf/bookshelf/pull/1797)

#### Dependencies

- Replace turbocolor with colorette: [#1904](https://github.com/bookshelf/bookshelf/pull/1904)
- Use prettier to format all `js` and `json` files: [#1883](https://github.com/bookshelf/bookshelf/pull/1883)
- Replace chalk with turbocolor: [#1878](https://github.com/bookshelf/bookshelf/pull/1878)
- Update some insecure dependencies: [#1841](https://github.com/bookshelf/bookshelf/pull/1841)
- Replace Babel with Node 4 compatible JavaScript: [#1835](https://github.com/bookshelf/bookshelf/pull/1835)
- Update sinon to the latest version: [#1833](https://github.com/bookshelf/bookshelf/pull/1833)

**0.13.3** <small>_Mar 26, 2018_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.13.2...0.13.3)

#### Potentially breaking changes
- Saving a model that hasn't changed will not update its `updated_at` attribute. This was included in a patch release because the chances of any applications depending on this behavior are very small: [#1798](https://github.com/bookshelf/bookshelf/pull/1798)

#### Bug fixes
- Clean up automatic timestamps feature: [#1798](https://github.com/bookshelf/bookshelf/pull/1798)

#### Documentation
- Expand documentation of the automatic timestamps feature: [#1798](https://github.com/bookshelf/bookshelf/pull/1798)

**0.13.2** <small>_Mar 23, 2018_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.13.0...0.13.2)

#### Bug fixes
- Fix timestamps set with Invalid Date in some cases: [#1796](https://github.com/bookshelf/bookshelf/pull/1796)

#### Documentation
- Fix incorrect data types and undocumented Model#defaults property: [#1797](https://github.com/bookshelf/bookshelf/pull/1797)

**0.13.0** <small>_Mar 18, 2018_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.12.1...0.13.0)

#### Breaking changes

- Make `require: true` the default when deleting models: [#1779](https://github.com/bookshelf/bookshelf/pull/1779)
- Remove the second argument to the model's destroyed event handler: [#1777](https://github.com/bookshelf/bookshelf/pull/1777)
- Events are now triggered sequentially even when the handlers execute asynchronous code: [#1768](https://github.com/bookshelf/bookshelf/pull/1768)
- Drop support for Node versions older than 4: [#1696](https://github.com/bookshelf/bookshelf/pull/1696)
- Reorder `saving` and `creating` events to reflect the documentation: [#1142](https://github.com/bookshelf/bookshelf/pull/1142)

#### Enhancements

- Only request `returning` attribute if client supports `returning`: [#1770](https://github.com/bookshelf/bookshelf/pull/1770)
- Throw error if user doesn't pass a valid Knex instance on initialize: [#1756](https://github.com/bookshelf/bookshelf/pull/1756)
- Add parameterized virtual properties to virtuals plugin: [#1755](https://github.com/bookshelf/bookshelf/pull/1755)
- Add individual attribute processor plugin to core: [#1741](https://github.com/bookshelf/bookshelf/pull/1741)
- Format `idAttribute` on save and delete: [#1680](https://github.com/bookshelf/bookshelf/pull/1680)
- Add `withSchema` option to all database operations: [#1638](https://github.com/bookshelf/bookshelf/pull/1638)
- Add a case converter plugin to core: [#1093](https://github.com/bookshelf/bookshelf/pull/1093)

#### Bug fixes
- Fix inconsistent timestamp values between save and fetch: [#1784](https://github.com/bookshelf/bookshelf/pull/1784)
- Set `model.id` if attributes being `.set()` contain a parsed version of `idAttribute`: [#1760](https://github.com/bookshelf/bookshelf/pull/1760)
- Fix pagination plugin's `fetchPage()` ignoring or hanging with transactions: [#1625](https://github.com/bookshelf/bookshelf/pull/1625)
- Fix `fetchPage()` from pagination plugin not working for relation collections: [#1561](https://github.com/bookshelf/bookshelf/pull/1561)
- Don't try to update `idAttribute` if it hasn't changed: [#1260](https://github.com/bookshelf/bookshelf/pull/1260)

#### Test suite

- Increase timeout of the large arrays test: [#1778](https://github.com/bookshelf/bookshelf/pull/1778)
- Add test to verify that `parentId` is not undefined when using `fetchAll` with relations: [#1769](https://github.com/bookshelf/bookshelf/pull/1769)
- Fixes and general improvements to the test suite: [#1753](https://github.com/bookshelf/bookshelf/pull/1753)
- Remove OracleDB tests: [#1744](https://github.com/bookshelf/bookshelf/pull/1744)
- Fix invalid test related to dirty attributes: [#1312](https://github.com/bookshelf/bookshelf/pull/1312)

#### Documentation
- Improve docs about running tests: [#1761](https://github.com/bookshelf/bookshelf/pull/1761)
- Fix typo on parse-and-format tutorial: [#1748](https://github.com/bookshelf/bookshelf/pull/1748)
- Add Bookshelf Manager to list of community plugins: [#1747](https://github.com/bookshelf/bookshelf/pull/1747)

#### Dependencies

- Update some dependencies: [#1787](https://github.com/bookshelf/bookshelf/pull/1787), [#1782](https://github.com/bookshelf/bookshelf/pull/1782), [#1780](https://github.com/bookshelf/bookshelf/pull/1780), [#1767](https://github.com/bookshelf/bookshelf/pull/1767) [#1746](https://github.com/bookshelf/bookshelf/pull/1746), [#1730](https://github.com/bookshelf/bookshelf/pull/1730)

**0.12.1** <small>_Jan 8, 2018_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.12.0...0.12.1)

#### Documentation
- Fix incorrect value of second argument to model event handlers: [#1723](https://github.com/bookshelf/bookshelf/pull/1723)
- Fix incorrect return value from `.detach()`: [#1720](https://github.com/bookshelf/bookshelf/pull/1720)
- Fix incorrect return value from `model.has()`: [#1712](https://github.com/bookshelf/bookshelf/pull/1712)
- Fix `fetching:collection` and `fetched:collection` not being generated or visible on the navigation bar: [#1114](https://github.com/bookshelf/bookshelf/pull/1114)
- Update contributing document and issue templates: [#1736](https://github.com/bookshelf/bookshelf/pull/1736)
- Add more information and links to Parse and Format docs: [#1727](https://github.com/bookshelf/bookshelf/pull/1727)
- Add bookshelf-ez-fetch to Community Plugins: [#1708](https://github.com/bookshelf/bookshelf/pull/1708)
- Add bookshelf-default-select to Community Plugins: [#1706](https://github.com/bookshelf/bookshelf/pull/1706)
- Add information and examples about calling `super()` on model's `initialize()`: [#1529](https://github.com/bookshelf/bookshelf/pull/1529)
- Add npm version badge to readme: [f4dd792](https://github.com/bookshelf/bookshelf/commit/f4dd79267ad8267a7073dd5c9f0661f6591ae96f)

#### Bug fixes
- Fix inability to attach belongsToMany relation to models fetched with `fetchAll()`: [#1716](https://github.com/bookshelf/bookshelf/pull/1716)
- Fix foreign key = 0 not fetching related object: [#1639](https://github.com/bookshelf/bookshelf/pull/1639)
- Fix unparsed `previousAttributes` for related models: [#1457](https://github.com/bookshelf/bookshelf/pull/1457)

#### Dependencies
- Update some dependencies: [#1734](https://github.com/bookshelf/bookshelf/pull/1734), [#1733](https://github.com/bookshelf/bookshelf/pull/1733), [#1732](https://github.com/bookshelf/bookshelf/pull/1732), [#1728](https://github.com/bookshelf/bookshelf/pull/1728), [#1726](https://github.com/bookshelf/bookshelf/pull/1726)

**0.12.0** <small>_Nov 27, 2017_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.11.1...0.12.0)

- Skip visibility-plugin `hidden` and `visible` attributes [#1699](https://github.com/bookshelf/bookshelf/pull/1699).
  - Used w/ `<model>.toJSON({ visibility: false })`
- Updated knex peer dependency version to 0.14.x [#1694](https://github.com/bookshelf/bookshelf/pull/1694).
- Documentation typo fixes [#1693](https://github.com/bookshelf/bookshelf/pull/1693).
- Now caching `node_modules` to speed up travis-ci builds [#1695](https://github.com/bookshelf/bookshelf/pull/1695).
- Use Docker containers for test runs [#1674](https://github.com/bookshelf/bookshelf/pull/1674).
- Make `postpublish` work regardless of git remote config [#1697](https://github.com/bookshelf/bookshelf/pull/1697).

**0.11.1** <small>_Nov 15, 2017_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.11.0...0.11.1)

- Fixed regression #1691: File missing on `postinstall`
  - npm `postinstall` script can be run as a part of npm `prepublish` script.

**0.11.0** <small>_Nov 15, 2017_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.10.4...0.11.0)

- Moved `.babelrc` -> `src/.babelrc` [#1470](https://github.com/bookshelf/bookshelf/pull/1470)
- Timestamp on save now utilizes a date option for timestamp updates on insert and update. [#1592](https://github.com/bookshelf/bookshelf/pull/1592)
  -  Used in options on save like so: ```m.save({item: 'test'}, { date: dateInThePast })```
- Added `morphValues` for `morphTo` relation. [#1326](https://github.com/bookshelf/bookshelf/pull/1326)
- Added ability to also set timestamps as model attributes in save.
- Removed non-production files from packaging / added them to .npmignore [#1679](https://github.com/bookshelf/bookshelf/pull/1679)
- Development Facing:
  - Oracle tests only run when oracle is installed.
  - Refactoring on the registry plugin.
  - Updated a lot of documents related to repo organization.

**0.10.4** - <small>_Jul 17, 2017_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.10.3...0.10.4)

- Allow knex 0.13.x.
- Use uuid instead of node-uuid.
- Test Bookshelf with Node v7.
- Updated Author info in `package.json`.
- Remove lodash from build script.
- Add OracleDB integration tests.
- Add opportunity to override `visible` and `hidden` behavior for toJSON function.
- Do not load `belongsTo` if `foreignKey` is `null`.
- Optimise `timestamp` function: respect updated_at/created_at being part of the query.
- Fix `fetchPage` on Collection (pagination plugin).
- Fixing virtuals when `omitNew=true`.
- Lot's of typo fixes and documentation updates.

**0.10.3** - <small>_Jan 21, 2017_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.10.2...0.10.3)

- Drop Node support for 0.10 and 0.12.
- Trigger creating event for attached models.
- Add support for uninstantiated models relations.
- Add `foreignKeyTarget` to relation methods.

**0.10.2** - <small>_Sept 22, 2016_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.10.1...0.10.2)

- Fixes memory leak introduced in 0.10.0 caused by binding `this.listeners` in `triggerThen`.
- Fixes Bluebird warning when a Promise was internally rejected with a non-error.

**0.10.1** - <small>_Sept 14, 2016_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.10.0...0.10.1)

- Allows using knex 0.12 as a peerDependency.
- knex instance used by bookshelf may be swapped out.

**0.10.0** — <small>_Jun 29, 2016_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.9.5...0.10.0)

#### Breaking Changes
- Removal/renaming of certain lodash functions from Model and Collection that were removed in lodash 4:
  - Collection Methods
    - removed `CollectionBase#collect` => use `CollectionBase#map` instead
    - removed `CollectionBase#foldl` => use `CollectionBase#reduce` instead
    - removed `CollectionBase#inject` => use `CollectionBase#reduce` instead
    - removed `CollectionBase#foldr` => use `CollectionBase#reduceRight` instead
    - removed `CollectionBase#detect` => use `CollectionBase#find` instead
    - removed `CollectionBase#select` => use `CollectionBase#filter` instead
    - removed `CollectionBase#all` => use `CollectionBase#every` instead
    - removed `CollectionBase#any` => use `CollectionBase#some` instead
    - removed `CollectionBase#include` => use `CollectionBase#includes` instead
    - removed `CollectionBase#contains` => use `CollectionBase#includes` instead
    - removed `CollectionBase#rest` => use `CollectionBase#tail instead`
    - renamed `CollectionBase#invoke` => `CollectionBase#invokeMap`
    - split `CollectionBase#max` into `CollectionBase#maxBy` - see the [lodash docs](https://lodash.com/docs/#max) for more explanation
    - split `CollectionBase#min` into `CollectionBase#minBy` - see the [lodash docs](https://lodash.com/docs/#min) for more explanation
  - Model Methods
    - renamed `ModelBase#pairs` => `ModelBase#toPairs`

#### Other changes
- Update to Lodash 4. #1287
- Registry plugin: Better support for custom relations. #1294

**0.9.5** — <small>_May 15, 2016_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.9.4...0.9.5)

- Add pagination plugin. #1183
- Fire {@link Model#event:fetched} on eagerly loaded relations. #1206
- Correct cloning of {@link Model#belongsToMany} decorated relations. #1222
- Update Knex to 0.11.x. #1227
- Update minimum lodash version. #1230

**0.9.4** — <small>_April 3, 2016_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.9.3...0.9.4)

- Include `babel-runtime` as a dependency. #1188

**0.9.3** — <small>_April 3, 2016_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.9.2...0.9.3)

- Bugfix: Restore support for `camelCase` and `colon:separated` event names. #1184

**0.9.2** — <small>_February 17, 2016_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.9.1...0.9.2)

- Permit up to Knex 0.11.0 via `peerDependencies`.
- `Model.forge` works for ES6 classes. #924
- Fix `Collection#count` for `hasMany` relations. #1115

**0.9.1** — <small>_November 4, 2015_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.9.0...0.9.1)

- {@link Events#off} can now unregister multiple methods at once. #983
- Permit Knex 0.10.0 via `peerDependencies`. #998

**0.9.0** — <small>_November 1, 2015_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.8.2...0.9.0)

- Repo no longer includes built source or generated documentation. Release script updated to include these only in the tagged release commit. #950.
- {@link Model#previous} returned `undefined` instead of `null` for non-existent attributes.
- Update tests and documentation to confirm that `null` (rather than `undefined`) is returned from {@link Model#fetch} and {@link Collection#fetchOne}.
- Fix error in virtuals plugin - #936
- Correct error updating parsed/formatted {@link Model#idAttribute} after successful `insert` operation. #955
- Many documentation fixes.

**0.8.2** — <small>_August 20, 2015_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.8.1...0.8.2)

- ES6/7: Move code base to `/src` — code is now compiled into `/lib` via [Babel](https://babeljs.io/).
- Add `collection.count`, `model.count` and `Model.count`.
- Add `model.refresh`. #796
- Prevent `fetch` and `refresh` from trying to add JSON attributes to a `where` clause. #550 #778
- Virtuals plugin now supports `{patch: true}` argument to `model.save`. #542
- Restored `model.clone` and `collection.clone`, which were not previously working. #744
- Allow `bookshelf.Collection` to be modified and extended by plugins (so that relations and `fetchAll` operations will return the extended instance). #681 #688
- Fix `model.timestamps` behavior which deviated from documentation. Also ensure that `createdAt` is set when `{method: "insert"}` is passed explicitly. #787
- Calling `create` on a `through` relationship no longer tries to make a pivot object. Previously this would attempt to create an object with invalid foreign keys. #768
- Parse foreign keys set during `create` in a relation. #770

**0.8.1** — <small>_May 12, 2015_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.8.0...0.8.1)

- Fix for regression in `initialize` not being called in Collection constructor, #737.
- Fix for regression, removing `omitPivot` in 0.8 #721
- Added `serialize`, a method which contains toJSON logic for easier customization.

**0.8.0** — <small>_May 1, 2015_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.7.9...0.8.0)

- Dropped Backbone dependency.
- More specific errors throughout, #522
- Support `{require: true}` for model.destroy #617
- Add lifecycle events on pivot models for `belongsToMany`, `.through` #578
- Allows for select/column calls in the query builder closure, #633.
- Added per-constructor error classes #694 (note: this will not work in CoffeeScript).

#### Breaking Changes

- Removed the `__super__` internal property on the constructor, this shouldn't have been something you were relying on anyway.

**0.7.9** — <small>_Oct 28, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.7.8...0.7.9)

- Fix for regression in columns / eager fetch query constraints, (#510).

**0.7.8** — <small>_Oct 28, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.7.7...0.7.8)

- Timestamp `created_at` is now saved with any insert.
- Fix for regression created by #429.
- New events, `attaching`, `attached`, `detaching`, `detached` #452.
- Ability to specify custom column names in morphTo, #454
- Fix for stack overflow with model list as arguments, #482
- Modified location of eager fetch query constraints internally.

**0.7.7** — <small>_July 23, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.7.6...0.7.7)

- Fix for formatting on polymorphic keys, (#429).
- Added a resolve method for specifying a custom resolver function for the registry plugin.

**0.7.6** — <small>_June 29, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.7.5...0.7.6)

- Add `omitPivot` flag on toJSON options for omitting the `_pivot_` keys in `through` and `belongsToMany` relations (#404).

**0.7.5** — <small>_June 23, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.7.4...0.7.5)

- Fix missing `NotFoundError` & `EmptyError` on Model & Collection, respectively (#389, #399).

**0.7.4** — <small>_June 18, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.7.3...0.7.4)

- Added `bookshelf.model(name, protoProps, [staticProps])` syntax for registry plugin.

**0.7.3** — <small>_June 17, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.7.2...0.7.3)

- Fix for collection dropping models early in set, #376.

**0.7.2** — <small>_June 12, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.7.1...0.7.2)

- Pass a cloned copy of the model's attributes to `format` rather than the original, related to #315.

**0.7.1** — <small>_June 10, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.7.0...0.7.1)

- Ensure the knex version >= 0.6.10, where a major regression affecting column names was fixed.

**0.7.0** — <small>_June 9, 2014_</small>

- Added {@link Model#fetchAll}, for fetching a collection of models from a model.
- Added {@link Model#where}, as a shortcut for the most commonly used {@linkplain Model#query query method}.
- Initializing via a plain options object is deprecated, you must now pass in an initialized knex instance.
- Adding typed errors (#221).
- Upgrade to support knex 0.6.x

**0.6.12** — <small>_June 5, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.11...0.6.12)

- Fix for eager loaded `belongsTo` relation bug with custom parse/format (#377).

**0.6.11** — <small>_June 4, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.10...0.6.11)

- Temporarily add knex to `peerDependencies` until 0.7 is released to support knex 0.6 and there exists a better internal method of doing a semver check.
- Fix for `belongsTo` relation bug (#353).

**0.6.10** — <small>_April 3, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.9...0.6.10)

- Bumping dependencies, including upgrading to Bluebird 1.2, trigger-then 0.3, fixing an erroneous "unhandledRejection" (#310).
- `fetchOne` properly resets the query on the collection, (#300).

**0.6.9** — <small>_April 3, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.8...0.6.9)

- Only prefix model fields with the "tableName" after format has been called, (#308).

**0.6.8** — <small>_March 6, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.7...0.6.8)

- Virtuals plugin may now accept a hash of attributes to set.
- Properly fix issue addressed in 0.6.7.

**0.6.7** — <small>_March 2, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.6...0.6.7)

- Bugfix for edge case for eager loaded relations and `relatedData` settings.

**0.6.6** — <small>_March 1, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.5...0.6.6)

- Bugfix for registry plugin, resolving correct models for "through" relations. (#260)

**0.6.5** — <small>_February 28, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.4...0.6.5)

- Added {@link Collection#reduceThen} as a passthrough to Bluebird's "reduce" method with models.
- Options are now passed to "plugin" method. (#254)
- Bugfix for registry plugin. (#259)

**0.6.4** — <small>_February 11, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.3...0.6.4)

- Adds static method {@link Model.collection Model.collection()} as a shortcut for creating a collection with the current model.

**0.6.3** — <small>_February 9, 2014_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.2...0.6.3)

- Added an` Relation#updatePivot` method for updating tables on a "belongsToMany" relation. (#134, #230)
- Allow mutating the options for passing constraints to eager loaded relations. (#151)
- All keys of an object passed into sync are properly prefixed before sync. (#177)
- Clearer error messages for debugging. (#204, #197)
- Fixed error message for updates that don't affect rows. (#228)
- Group by the correct key on "belongsTo.through" relations. (#214)
- Ability to only use `created_at` or `updated_at` as timestamp properties. (#158)
- Numerous documentation corrections, clarifications, enhancements.
- Bumped Bluebird dependency to ~1.0.0.

**Plugins:**

- Added the `registry` plugin for registering models as strings, helping with the circular dependency problem.
- Added the `virtuals` plugin for getting/setting virtual (computed) properties on the model.
- Added the `visibility` plugin for specifying a whitelist/blacklist of keys when a model is serialized with toJSON.

**0.6.2** — <small>_December 18, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.1...0.6.2)

- Debug may now be passed as an option in any sync method, to log queries, including relations.
- Save now triggers an error in updates with no affected rows. (#119)
- The `model.id` attribute is only set on insert if it's empty. (#130)
- Ensure eager loaded relations can use attach/detach. (#120)

**0.6.1** — <small>_November 26, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.6.0...0.6.1)

- Fixes bug with promise code and saving event firing, where promises are not properly resolved with ".all" during saving events.

**0.6.0** — <small>_November 25, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.5.8...0.6.0)

- Updating dependency to knex.js 0.5.x.
- Switched from when.js to [bluebird](https://github.com/petkaantonov/bluebird) for promise implementation, with shim for backward compatibility.
- Switched from underscore to lodash, for semver reliability.

**0.5.8** — <small>_November 24, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.5.7...0.5.8)

- Parse models after all relations have been eager loaded, for appropriate column name matching (thanks [@benesch](https://github.com/benesch)) (#97)
- Specify table for `withRelated` fetches to prevent column naming conflicts (#96).
- Fix for polymorphic relation loading (#95).
- Other documentation tweaks and other internal code cleanup.

**0.5.7** — <small>_October 11, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.5.6...0.5.7)

- The "fetching" event is now fired on eager loaded relation fetches.

**0.5.6** — <small>_October 10, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.5.5...0.5.6)

- The `options.query` now contains the appropriate `knex` instance during the "fetching" event handler.

**0.5.5** — <small>_October 1, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.5.4...0.5.5)

- An eager loaded [morphTo](#Model-morphTo) relation may now have child relations nested beneath it that are properly eager loaded, depending on the parent.

**0.5.4** — <small>_October 1, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.5.3...0.5.4)

- Fix issue where the `relatedData` context was not appropriately maintained for subsequent {@link Collection#create} calls after an eager load (#77).
- Documentation improvements, encouraging the use of {@link Model#related} rather than calling a relation method directly, to keep association with the parent model's {@link Model#relations relations} hash.

**0.5.3** — <small>_September 26, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.5.2...0.5.3)

- The `columns` explicitly specified in a fetch are no-longer passed along when eager loading relations, fixes (#70).

**0.5.2** — <small>_September 22, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.5.1...0.5.2)

- Fixed incorrect eager loading in `belongsTo` relations (#65).

**0.5.1** — <small>_September 21, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.5.0...0.5.1)

- Fixed incorrect eager loading in `hasOne` relations (#63).

**0.5.0** — <small>_September 20, 2013_</small> — [Diff](https://github.com/bookshelf/bookshelf/compare/0.3.1...0.5.0)

#### Major Breaking Changes

- Global state is no longer stored in the library, an instance is returned from `Bookshelf.initialize`, so you will need to call this once and then reference this `Bookshelf` client elsewhere in your application.
- Lowercasing of `bookshelf.initialize`, `bookshelf.knex`, `bookshelf.transaction`.
- During the lifecycle events, such as "fetching", "saving", or "destroying", the model no-longer contains the active query builder instance at the time it is saved. If you need to modify the query builder chain inside of an event handler, you may now use `options.query` inside the event handlers.

#### Other changes

- Added `tableName` for all queries, so joins use the correct id (#61).
- The `attach` & `detach` now remove models from the associated collection, as appropriate (#59).
- A `withPivot` no longer accepts an object to specify the keys for the returned pivot items, if you wish to specify how these pivot objects are defined on the object, a custom [toJSON](#Model-toJSON) is your best bet.
- Added {@link Collection#invokeThen} and {@link Collection#mapThen} as convenience helpers for `Promise.all(collection.invoke(method, args*))` and `Promise.all(collection.map(method, iterator, [context]))`, respectively.
- Added a `Bookshelf.plugin` method, for a standard way to extend Bookshelf instances.
- A re-written modular architecture, to move the library toward becoming a database agnostic "data mapper" foundation, with the ablitiy to form relations between different data stores and types, not just SQL (although SQL is the primary focus for now). Also, support for AMD, for eventual use outside of Node.js runtime (with webSQL and likewise).

**0.3.1** — <small>_August 29, 2013_</small> - [Diff](https://github.com/bookshelf/bookshelf/compare/0.3.0...0.3.1)

- [Docs](http://htmlpreview.github.com/?https://raw.github.com/bookshelf/bookshelf/0.3.0/index.html)
- Fixed regression in `belongsToMany` custom column name order.

**0.3.0** — <small>_August 28, 2013_</small>

- Support for a {@link Model#through} clause on various model relations.
- Creating a model from a related collection maintains the appropriate relation data (#35).
- Support for a `{patch: true}` flag on save, to only update specific saved attributes.
- Added a `fetchOne` method, for pulling out a single model from a collection, mostly useful for related collection instances.
- Updated to Knex "0.2.x" syntax for insert / returning.
- Ability to specify a `morphValue` on {@link Model#morphOne} or {@link Model#morphMany} relations.
- Internal refactor of relations for more consistent behavior.

**0.2.8** — <small>_August 26, 2013_</small>

- Some minor fixes to make the `Sync` methods more consistent in their behavior when called directly, (#53).

**0.2.7** — <small>_August 21, 2013_</small>

- Timestamp for `created_at` is not set during an "update" query, and the update where clause does not include the `idAttribute` if it isn't present (#51).

**0.2.6** — <small>_August 21, 2013_</small>

- Fixes bug with query function feature added in `0.2.5`, mentioned in (#51).

**0.2.5** — <small>_August 19, 2013_</small>

- The {@link Model#query} method may now accept a function, for even more dynamic query building (#45).
- Fix for relations not allowing `0` as a valid foreign key value (#49).

**0.2.4** — <small>_July 30, 2013_</small>

- More consistent query resetting, fixing query issues on post-query event handlers.
- The `toJSON` is only called on a related model if the method exists, allowing for objects or arrays to be manually specified on the `relations` hash and serialized properly on the parent's `toJSON`.

**0.2.3** — <small>_July 7, 2013_</small>

- Fixing bug where `triggerThen` wasn't actually being used for several of the events as noted in 0.2.1 release.

**0.2.2** — <small>_July 2, 2013_</small>

- The Model's `related` method is now a no-op if the model doesn't have the related method.
- Any `withPivot` columns on many-to-many relations are now prefixed with `_pivot` rather than `pivot` unless named otherwise, for consistency.
- The `_reset` is not called until after all triggered events so that `hasChanged` can be used on the current model state in the "created", "updated", "saved", and "destroyed" events.
- Eager queries may be specified as an object with a function, to constrain the eager queries:


    user.fetch({withRelated: ['accounts', {
    'accounts.settings': function(qb) { qb.where('status', 'enabled'); }
    }, 'other_data']}).then(...

**0.2.1** — <small>_June 26, 2013_</small>

- Using `triggerThen` instead of `trigger` for "created", "updated", "saved", "destroyed", and "fetched" events - if any async operations are needed _after_ the model is created but before resolving the original promise.

**0.2.0** — <small>_June 24, 2013_</small>

- Resolve Model's `fetch` promise with `null` rather than `undefined`.
- An object of `query` constraints (e.g. `{where: {...}, orWhere: {...}}`may be passed to the query method (#30).
- Fix for empty eager relation responses not providing an empty model or collection instance on the `model.relations` object.

**0.1.9** — <small>_June 19, 2013_</small>

- Resolve Model's `fetch` promise with `undefined` if no model was returned.
- An array of "created at" and "updated at" values may be used for `hasTimestamps`.
- Format is called on the `Model#fetch` method.
- Added an `exec` plugin to provide a node callback style interface for any of the promise methods.

**0.1.8** — <small>_June 18, 2013_</small>

- Added support for polymorphic associations, with `morphOne`, `morphMany`, and `morphTo` model methods.

**0.1.7** — <small>_June 15, 2013_</small>

- Bugfix where `detach` may be used with no parameters to detach all related items (#19).

**0.1.6** — <small>_June 15, 2013_</small>

- Fixing bug allowing custom `idAttribute` values to be used in eager loaded many-to-many relations (#18).

**0.1.5** — <small>_June 11, 2013_</small>

- Ensuring each of the `_previousAttribute` and `changed` values are properly reset on related models after sync actions.

**0.1.4** — <small>_June 10, 2013_</small>

- Fixing issue with `idAttribute` not being assigned after database inserts.
- Removing various aliases {@link Events} methods for clarity.

**0.1.3** — <small>_June 10, 2013_</small>

- Added {@link Model#hasChanged}, {@link Model#previous}, and {@link Model#previousAttributes} methods, for getting the previous value of the model since the last sync.
- Using `Object.create(null)` for various internal model objects dealing with user values.
- Calling {@link Model#related} on a model will now create an empty related object if one is not present on the `relations` object.
- Removed the `{patch: true}` option on save, instead only applying defaults if the object `isNew`, or if `{defaults: true}` is passed.
- Fix for `model.clone`'s relation responses.

**0.1.2** — <small>_May 17, 2013_</small>

- Added `triggerThen` and `emitThen` for promise based events, used internally in the "creating", "updating", "saving", and "destroying" events.
- Docs updates, fixing `{patch: true}` on `update` to have intended functionality.
- A model's `toJSON` is now correctly called on any related properties.

**0.1.1** — <small>_May 16, 2013_</small>

- Fixed bug with eager loaded `belongsTo` relations (#14).

**0.1.0** — <small>_May 13, 2013_</small>

- Initial Bookshelf release.
