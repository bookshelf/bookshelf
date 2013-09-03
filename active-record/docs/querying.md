Bookshelf Active Record Query Interface
=============================

This guide covers different ways to retrieve data from the database using Bookshelf Active Record.

After reading this guide, you will know:

* How to find records using a variety of methods and conditions.
* How to specify the order, retrieved attributes, grouping, and other properties of the found records.
* How to use eager loading to reduce the number of database queries needed for data retrieval.
* How to use dynamic finders methods.
* How to check for the existence of particular records.
* How to perform various calculations on Active Record models.
* How to run EXPLAIN on relations.

--------------------------------------------------------------------------------

If you're used to using raw SQL to find database records, then you will generally find that there are better ways to carry out the same operations. Active Record insulates you from the need to use SQL in most cases.

Code examples throughout this guide will refer to one or more of the following models:

TIP: All of the following models use `id` as the primary key, unless specified otherwise.

```coffee
class Client extends ActiveRecord
  address: ->
    @hasOne Address
  orders: ->
    @hasMany Orders
  roles: ->
    @belongsToMany Roles
```

```coffee
class Address extends ActiveRecord
  client: ->
    @belongsTo Client
```

```coffee
class Order extends ActiveRecord
  client: ->
    @belongsTo Client
    # counter_cache: true ?
```

```coffee
class Role extends ActiveRecord
  clients: ->
    @belongsToMany Client
```

Active Record will perform queries on the database for you and is compatible with most database systems (MySQL, PostgreSQL and SQLite to name a few). Regardless of which database system you're using, the Active Record method format will always be the same.

Retrieving Objects from the Database
------------------------------------

To retrieve objects from the database, Active Record provides several finder methods. Each finder method allows you to pass arguments into it to perform certain queries on your database without writing raw SQL.

The methods are:

* `createWith`
* `distinct`
* `extending`
* `group`
* `having`
* `includes`
* `joins`
* `limit`
* `lock`
* `none`
* `offset`
* `order`
* `preload`
* `readonly`
* `references`
* `reorder`
* `reverse_order`
* `select`
* `uniq`
* `where`

All of the above methods return an instance of `ActiveRecord.Relation`.

The primary operation of `Model.find(options)` can be summarized as:

* Convert the supplied options to an equivalent SQL query.
* Fire the SQL query and retrieve the corresponding results from the database.
* Instantiate the equivalent Ruby object of the appropriate model for every resulting row.
* Run `after_find` callbacks, if any.

### Retrieving a Single Object

Active Record provides several different ways of retrieving a single object.

#### Using a Primary Key

Using `Model.find(primary_key)`, you can retrieve the object corresponding to the specified _primary key_ that matches any supplied options. For example:

```coffee
# Find the client with primary key (id) 10.
Client.find(10).then(console.log)
# {id: 10, first_name: "Ryan"}
```

The SQL equivalent of the above is:

```sql
SELECT * FROM clients WHERE (clients.id = 10) LIMIT 1
```

`Model.find(primary_key)` will raise an `ActiveRecord.RecordNotFound` exception if no matching record is found.

#### `take`

`Model.take` retrieves a record without any implicit ordering. For example:

```coffee
client = Client.take().then(console.log)
# => {id: 1, first_name: "Lifo"}
```

The SQL equivalent of the above is:

```sql
SELECT * FROM clients LIMIT 1
```

`Model.take` returns `null` if no record is found and no exception will be raised
unless {require: true} is passed in the options hash.

TIP: The retrieved record may vary depending on the database engine.

#### `first`

`Model.first` finds the first record ordered by the primary key. For example:

```coffee
client = Client.first().then(console.log)
# => {id: 1, first_name: "Lifo"}
```

The SQL equivalent of the above is:

```sql
SELECT * FROM clients ORDER BY clients.id ASC LIMIT 1
```

`Model.first` returns `null` if no matching record is found and no exception will be raised
unless {require: true} is passed in the options hash.

#### `last`

`Model.last` finds the last record ordered by the primary key. For example:

```coffee
Client.last().then(console.log)
# => {id: 221, first_name: "Russel"}
```

The SQL equivalent of the above is:

```sql
SELECT * FROM clients ORDER BY clients.id DESC LIMIT 1
```

`Model.last` returns `null` if no matching record is found and no exception will be raised
unless {require: true} is passed in the options hash.

#### `findBy`

`Model.findBy` finds the first record matching some conditions. For example:

```coffee
Client.findBy(first_name: 'Lifo').then(console.log)
# => {id: 1, first_name: "Lifo"}

Client.findBy(first_name: 'Jon').then(console.log)
# => nil
```

It is equivalent to writing:

```coffee
Client.where(first_name: 'Lifo').take()
```

### Retrieving Multiple Objects

#### Using Multiple Primary Keys

`Model.find(array_of_primary_key)` accepts an array of _primary keys_, returning an array containing all of the matching records for the supplied _primary keys_. For example:

```coffee
# Find the clients with primary keys 1 and 10.
client = Client.find([1, 10])
# => [{id: 1, first_name: "Lifo", {id: 10, first_name: "Ryan"}]
```

The SQL equivalent of the above is:

```sql
SELECT * FROM clients WHERE (clients.id IN (1,10))
```

WARNING: `Model.find(array_of_primary_key)` will raise an `ActiveRecord.RecordNotFound` exception unless a matching record is found for **all** of the supplied primary keys.

#### take

`Model.take(limit)` retrieves the first number of records specified by `limit` without any explicit ordering:

```coffee
Client.take(2).then(console.log)
# => [{id: 1, first_name: "Lifo"}, {id: 2, first_name: "Raf"}]
```

The SQL equivalent of the above is:

```sql
SELECT * FROM clients LIMIT 2
```

#### first

`Model.first(limit)` finds the first number of records specified by `limit` ordered by primary key:

```coffee
Client.first(2).then(console.log)
# => [{id: 1, first_name: "Lifo"}]
      {id: 2, first_name: "Raf"}]
```

The SQL equivalent of the above is:

```sql
SELECT * FROM clients ORDER BY id ASC LIMIT 2
```

#### last

`Model.last(limit)` finds the number of records specified by `limit` ordered by primary key in descending order:

```coffee
Client.last(2).then(console.log)
# => [{id: 10, first_name: "Ryan"}], {id: 9, first_name: "John"}]]
```

The SQL equivalent of the above is:

```sql
SELECT * FROM clients ORDER BY id DESC LIMIT 2
```

### Retrieving Multiple Objects in Batches

We often need to iterate over a large set of records, as when we send a newsletter to a large set of users, or when we export data.

This may appear straightforward:

```coffee
# This is very inefficient when the users table has thousands of rows.
User.all().map (user) ->
  NewsLetter.weekly_deliver(user)
```

But this approach becomes increasingly impractical as the table size increases, since `User.all.each` instructs Active Record to fetch _the entire table_ in a single pass, build a model object per row, and then keep the entire array of model objects in memory. Indeed, if we have a large number of records, the entire collection may exceed the amount of memory available.

Rails provides two methods that address this problem by dividing records into memory-friendly batches for processing. The first method, `findEach`, retrieves a batch of records and then yields _each_ record to the block individually as a model. The second method, `findInBatches`, retrieves a batch of records and then yields _the entire batch_ to the block as an array of models.

TIP: The `findEach` and `findInBatches` methods are intended for use in the batch processing of a large number of records that wouldn't fit in memory all at once. If you just need to loop over a thousand records the regular find methods are the preferred option.

#### `findEach`

The `findEach` method retrieves a batch of records and then yields _each_ record to the block individually as a model. In the following example, `findEach` will retrieve 1000 records (the current default for both `findEach` and `findInBatches`) and then yield each record individually to the block as a model. This process is repeated until all of the records have been processed:

```coffee
User.findEach (user) ->
  NewsLetter.weeklyDeliver(user)
```

##### Options for `findEach`

The `findEach` method accepts most of the options allowed by the regular `find` method, except for `:order` and `:limit`, which are reserved for internal use by `findEach`.

Two additional options, `:batch_size` and `:start`, are available as well.

**`:batch_size`**

The `:batch_size` option allows you to specify the number of records to be retrieved in each batch, before being passed individually to the block. For example, to retrieve records in batches of 5000:

```coffee
User.findEach(batch_size: 5000).then (user) ->
  NewsLetter.weeklyDeliver(user)
```

**`:start`**

By default, records are fetched in ascending order of the primary key, which must be an integer. The `:start` option allows you to configure the first ID of the sequence whenever the lowest ID is not the one you need. This would be useful, for example, if you wanted to resume an interrupted batch process, provided you saved the last processed ID as a checkpoint.

For example, to send newsletters only to users with the primary key starting from 2000, and to retrieve them in batches of 5000:

```coffee
User.findEach(start: 2000, batch_size: 5000).then (user) ->
  NewsLetter.weeklyDeliver(user)
```

Another example would be if you wanted multiple workers handling the same processing queue. You could have each worker handle 10000 records by setting the appropriate `:start` option on each worker.

#### `findInBatches`

The `findInBatches` method is similar to `findEach`, since both retrieve batches of records. The difference is that `findInBatches` yields _batches_ to the block as an array of models, instead of individually. The following example will yield to the supplied block an array of up to 1000 invoices at a time, with the final block containing any remaining invoices:

```coffee
# Give addInvoices an array of 1000 invoices at a time
Invoice.findInBatches (invoices) ->
  obj.addInvoices invoices
, withRelated: 'invoiceLines'

```

NOTE: The `:include` option allows you to name associations that should be loaded alongside with the models.

##### Options for `findInBatches`

The `findInBatches` method accepts the same `:batch_size` and `:start` options as `findEach`, as well as most of the options allowed by the regular `find` method, except for `:order` and `:limit`, which are reserved for internal use by `findInBatches`.

Conditions
----------

The `where` method allows you to specify conditions to limit the records returned, representing the `WHERE`-part of the SQL statement. Conditions can either be specified as a string, array, or hash.

### Pure String Conditions

If you'd like to add conditions to your find, you could just specify them in there, just like `Client.where("orders_count = '2'")`. This will find all clients where the `orders_count` field's value is 2.

WARNING: Building your own conditions as pure strings can leave you vulnerable to SQL injection exploits. For example, `Client.where("first_name LIKE '%#{params[:first_name]}%'")` is not safe. See the next section for the preferred way to handle conditions using an array.

### Array Conditions

Now what if that number could vary, say as an argument from somewhere? The find would then take the form:

```coffee
Client.whereRaw("orders_count = ?", [req.params.orders])
```

Active Record will go through the first element in the conditions value and any additional elements will replace the question marks `(?)` in the first element.

If you want to specify multiple conditions:

```coffee
Client.where("orders_count = ? AND locked = ?", [req.params.orders, false])
```

In this example, the first question mark will be replaced with the value in `req.params.orders` and the second will be replaced with the SQL representation of `false`, which depends on the adapter.

This code is highly preferable:

```coffee
Client.where("orders_count = ?", req.params.orders)
```

to this code:

```coffee
Client.where("orders_count = #{req.params.orders}")
```

because of argument safety. Putting the variable directly into the conditions string will pass the variable to the database **as-is**. This means that it will be an unescaped variable directly from a user who may have malicious intent. If you do this, you put your entire database at risk because once a user finds out he or she can exploit your database they can do just about anything to it. Never ever put your arguments directly inside the conditions string.

TIP: For more information on the dangers of SQL injection, see the [Ruby on Rails Security Guide](security.html#sql-injection).

#### Equality Conditions

```coffee
Client.where(locked: true)
```

The field name can also be a string:

```coffee
Client.where('locked', true)
```

In the case of a belongs_to relationship, an association key can be used to specify the model if an Active Record object is used as the value. This method works with polymorphic relationships as well.

```coffee
Post.where(author: author)
Author.joins(:posts).where(posts: {author: author})
```

#### Range Conditions

```coffee
Client.whereBetween(created_at: [Time.now.midnight - 1.day, Time.now.midnight])
```

This will find all clients created yesterday by using a `BETWEEN` SQL statement:

```sql
SELECT * FROM clients WHERE (clients.created_at BETWEEN '2008-12-21 00:00:00' AND '2008-12-22 00:00:00')
```

This demonstrates a shorter syntax for the examples in [Array Conditions](#array-conditions)

#### Subset Conditions

If you want to find records using the `IN` expression you can pass an array to the conditions hash:

```coffee
Client.whereIn('orders_count', [1,3,5])
```

This code will generate SQL like this:

```sql
SELECT * FROM clients WHERE (clients.orders_count IN (1,3,5))
```

### NOT Conditions

`NOT` SQL queries can be built by `whereNot`.

```coffee
Post.whereNot(author: author)
```

In other words, this query can be generated by calling `where` with no argument, then immediately chain with `not` passing `where` conditions.

Ordering
--------

To retrieve records from the database in a specific order, you can use the `order` method.

For example, if you're getting a set of records and want to order them in ascending order by the `created_at` field in your table:

```coffee
Client.order(:created_at)
# OR
Client.order("created_at")
```

You could specify `ASC` or `DESC` as well:

```coffee
Client.order(created_at: :desc)
# OR
Client.order(created_at: :asc)
# OR
Client.order("created_at DESC")
# OR
Client.order("created_at ASC")
```

Or ordering by multiple fields:

```coffee
Client.order(orders_count: :asc, created_at: :desc)
# OR
Client.order(:orders_count, created_at: :desc)
# OR
Client.order("orders_count ASC, created_at DESC")
# OR
Client.order("orders_count ASC", "created_at DESC")
```

If you want to call `order` multiple times e.g. in different context, new order will append previous one

```coffee
Client.order("orders_count ASC").order("created_at DESC")
# SELECT * FROM clients ORDER BY orders_count ASC, created_at DESC
```

Selecting Specific Fields
-------------------------

By default, `Model.find` selects all the fields from the result set using `select *`.

To select only a subset of fields from the result set, you can specify the subset via the `select` method.

For example, to select only `viewable_by` and `locked` columns:

```coffee
Client.select("viewable_by, locked")
```

The SQL query used by this find call will be somewhat like:

```sql
SELECT viewable_by, locked FROM clients
```

Be careful because this also means you're initializing a model object with only the fields that you've selected. If you attempt to access a field that is not in the initialized record you'll receive:

```bash
ActiveModel.MissingAttributeError: missing attribute: <attribute>
```

Where `<attribute>` is the attribute you asked for. The `id` method will not raise the `ActiveRecord.MissingAttributeError`, so just be careful when working with associations because they need the `id` method to function properly.

If you would like to only grab a single record per unique value in a certain field, you can use `distinct`:

```coffee
Client.select(:name).distinct
```

This would generate SQL like:

```sql
SELECT DISTINCT name FROM clients
```

You can also remove the uniqueness constraint:

```coffee
query = Client.select(:name).distinct
# => Returns unique names

query.distinct(false)
# => Returns all names, even if there are duplicates
```

Limit and Offset
----------------

To apply `LIMIT` to the SQL fired by the `Model.find`, you can specify the `LIMIT` using `limit` and `offset` methods on the relation.

You can use `limit` to specify the number of records to be retrieved, and use `offset` to specify the number of records to skip before starting to return the records. For example

```coffee
Client.limit(5)
```

will return a maximum of 5 clients and because it specifies no offset it will return the first 5 in the table. The SQL it executes looks like this:

```sql
SELECT * FROM clients LIMIT 5
```

Adding `offset` to that

```coffee
Client.limit(5).offset(30)
```

will return instead a maximum of 5 clients beginning with the 31st. The SQL looks like:

```sql
SELECT * FROM clients LIMIT 5 OFFSET 30
```

Group
-----

To apply a `GROUP BY` clause to the SQL fired by the finder, you can specify the `group` method on the find.

For example, if you want to find a collection of the dates orders were created on:

```coffee
Order.select("date(created_at) as ordered_date, sum(price) as total_price").group("date(created_at)")
```

And this will give you a single `Order` object for each date where there are orders in the database.

The SQL that would be executed would be something like this:

```sql
SELECT date(created_at) as ordered_date, sum(price) as total_price
FROM orders
GROUP BY date(created_at)
```

Having
------

SQL uses the `HAVING` clause to specify conditions on the `GROUP BY` fields. You can add the `HAVING` clause to the SQL fired by the `Model.find` by adding the `:having` option to the find.

For example:

```coffee
Order.select("date(created_at) as ordered_date, sum(price) as total_price").
  group("date(created_at)").having("sum(price) > ?", 100)
```

The SQL that would be executed would be something like this:

```sql
SELECT date(created_at) as ordered_date, sum(price) as total_price
FROM orders
GROUP BY date(created_at)
HAVING sum(price) > 100
```

This will return single order objects for each day, but only those that are ordered more than $100 in a day.

Overriding Conditions
---------------------

### `except`

You can specify certain conditions to be excepted by using the `except` method. For example:

```coffee
Post.where('id > 10').limit(20).order('id asc').except(:order)
```

The SQL that would be executed:

```sql
SELECT * FROM posts WHERE id > 10 LIMIT 20

# Original query without `except`
SELECT * FROM posts WHERE id > 10 ORDER BY id asc LIMIT 20

```

### `unscope`

The `except` method does not work when the relation is merged. For example:

```coffee
Post.comments.except(:order)
```

will still have an order if the order comes from a default scope on Comment. In order to remove all ordering, even from relations which are merged in, use unscope as follows:

```coffee
Post.order('id DESC').limit(20).unscope(:order) = Post.limit(20)
Post.order('id DESC').limit(20).unscope(:order, :limit) = Post.all
```

You can additionally unscope specific where clauses. For example:

```coffee
Post.where(id: 10).limit(1).unscope({ where: :id }, :limit).order('id DESC') = Post.order('id DESC')
```

### `only`

You can also override conditions using the `only` method. For example:

```coffee
Post.where('id > 10').limit(20).order('id desc').only(:order, :where)
```

The SQL that would be executed:

```sql
SELECT * FROM posts WHERE id > 10 ORDER BY id DESC

# Original query without `only`
SELECT "posts".* FROM "posts" WHERE (id > 10) ORDER BY id desc LIMIT 20

```

### `reorder`

The `reorder` method overrides the default scope order. For example:

```coffee
class Post extends ActiveRecord
  ..
  ..
  has_many :comments, -> { order('posted_at DESC') }
end

Post.find(10).comments.reorder('name')
```

The SQL that would be executed:

```sql
SELECT * FROM posts WHERE id = 10 ORDER BY name
```

In case the `reorder` clause is not used, the SQL executed would be:

```sql
SELECT * FROM posts WHERE id = 10 ORDER BY posted_at DESC
```

### `reverse_order`

The `reverse_order` method reverses the ordering clause if specified.

```coffee
Client.where("orders_count > 10").order(:name).reverse_order
```

The SQL that would be executed:

```sql
SELECT * FROM clients WHERE orders_count > 10 ORDER BY name DESC
```

If no ordering clause is specified in the query, the `reverse_order` orders by the primary key in reverse order.

```coffee
Client.where("orders_count > 10").reverse_order
```

The SQL that would be executed:

```sql
SELECT * FROM clients WHERE orders_count > 10 ORDER BY clients.id DESC
```

This method accepts **no** arguments.

Null Relation
-------------

The `none` method returns a chainable relation with no records. Any subsequent conditions chained to the returned relation will continue generating empty relations. This is useful in scenarios where you need a chainable response to a method or a scope that could return zero results.

```coffee
Post.none # returns an empty Relation and fires no queries.
```

```coffee
# The visible_posts method below is expected to return a Relation.
@posts = current_user.visible_posts.where(name: params[:name])

def visible_posts
  case role
  when 'Country Manager'
    Post.where(country: country)
  when 'Reviewer'
    Post.published
  when 'Bad User'
    Post.none # => returning [] or nil breaks the caller code in this case
  end
```

Readonly Objects
----------------

Active Record provides `readonly` method on a relation to explicitly disallow modification of any of the returned objects. Any attempt to alter a readonly record will not succeed, raising an `ActiveRecord.ReadOnlyRecord` exception.

```coffee
client = Client.readonly.first
client.visits += 1
client.save
```

As `client` is explicitly set to be a readonly object, the above code will raise an `ActiveRecord.ReadOnlyRecord` exception when calling `client.save` with an updated value of _visits_.

Locking Records for Update
--------------------------

Locking is helpful for preventing race conditions when updating records in the database and ensuring atomic updates.

Active Record provides two locking mechanisms:

* Optimistic Locking
* Pessimistic Locking

### Optimistic Locking

Optimistic locking allows multiple users to access the same record for edits, and assumes a minimum of conflicts with the data. It does this by checking whether another process has made changes to a record since it was opened. An `ActiveRecord.StaleObjectError` exception is thrown if that has occurred and the update is ignored.

**Optimistic locking column**

In order to use optimistic locking, the table needs to have a column called `lock_version` of type integer. Each time the record is updated, Active Record increments the `lock_version` column. If an update request is made with a lower value in the `lock_version` field than is currently in the `lock_version` column in the database, the update request will fail with an `ActiveRecord.StaleObjectError`. Example:

```coffee
c1 = Client.find(1)
c2 = Client.find(1)

c1.first_name = "Michael"
c1.save

c2.name = "should fail"
c2.save # Raises an ActiveRecord.StaleObjectError
```

You're then responsible for dealing with the conflict by rescuing the exception and either rolling back, merging, or otherwise apply the business logic needed to resolve the conflict.

This behavior can be turned off by setting `ActiveRecord.Base.lock_optimistically = false`.

To override the name of the `lock_version` column, `ActiveRecord.Base` provides a class attribute called `locking_column`:

```coffee
class Client extends ActiveRecord
  self.locking_column = :lock_client_column
```

### Pessimistic Locking

Pessimistic locking uses a locking mechanism provided by the underlying database. Using `lock` when building a relation obtains an exclusive lock on the selected rows. Relations using `lock` are usually wrapped inside a transaction for preventing deadlock conditions.

For example:

```coffee
Item.transaction do
  i = Item.lock.first
  i.name = 'Jones'
  i.save
```

The above session produces the following SQL for a MySQL backend:

```sql
SQL (0.2ms)   BEGIN
Item Load (0.3ms)   SELECT * FROM `items` LIMIT 1 FOR UPDATE
Item Update (0.4ms)   UPDATE `items` SET `updated_at` = '2009-02-07 18:05:56', `name` = 'Jones' WHERE `id` = 1
SQL (0.8ms)   COMMIT
```

You can also pass raw SQL to the `lock` method for allowing different types of locks. For example, MySQL has an expression called `LOCK IN SHARE MODE` where you can lock a record but still allow other queries to read it. To specify this expression just pass it in as the lock option:

```coffee
Item.transaction do
  i = Item.lock("LOCK IN SHARE MODE").find(1)
  i.increment!(:views)
```

If you already have an instance of your model, you can start a transaction and acquire the lock in one go using the following code:

```coffee
item = Item.first
item.with_lock do
  # This block is called within a transaction,
  # item is already locked.
  item.increment!(:views)
```

Joining Tables
--------------

Active Record provides a finder method called `joins` for specifying `JOIN` clauses on the resulting SQL. There are multiple ways to use the `joins` method.

### Using a String SQL Fragment

You can just supply the raw SQL specifying the `JOIN` clause to `joins`:

```coffee
Client.joins('LEFT OUTER JOIN addresses ON addresses.client_id = clients.id')
```

This will result in the following SQL:

```sql
SELECT clients.* FROM clients LEFT OUTER JOIN addresses ON addresses.client_id = clients.id
```

### Using Array/Hash of Named Associations

WARNING: This method only works with `INNER JOIN`.

Active Record lets you use the names of the [associations](association_basics.html) defined on the model as a shortcut for specifying `JOIN` clause for those associations when using the `joins` method.

For example, consider the following `Category`, `Post`, `Comments` and `Guest` models:

```coffee
class Category extends ActiveRecord
  posts: ->
    @hasMany Post

class Post extends ActiveRecord
  category: ->
    @belongsTo Category
  comments: ->
    @hasMany Comment
  tags: ->
    @hasMany Tag

class Comment extends ActiveRecord
  post: ->
    @belongsTo Post
  guest: ->
    @hasOne Guest

class Guest extends ActiveRecord
  comment: ->
    @belongsTo Comment

class Tag extends ActiveRecord
  post: ->
    @belongsTo Post
```

Now all of the following will produce the expected join queries using `INNER JOIN`:

#### Joining a Single Association

```coffee
Category.joins(:posts)
```

This produces:

```sql
SELECT categories.* FROM categories
  INNER JOIN posts ON posts.category_id = categories.id
```

Or, in English: "return a Category object for all categories with posts". Note that you will see duplicate categories if more than one post has the same category. If you want unique categories, you can use `Category.joins(:posts).uniq`.

#### Joining Multiple Associations

```coffee
Post.joins(:category, :comments)
```

This produces:

```sql
SELECT posts.* FROM posts
  INNER JOIN categories ON posts.category_id = categories.id
  INNER JOIN comments ON comments.post_id = posts.id
```

Or, in English: "return all posts that have a category and at least one comment". Note again that posts with multiple comments will show up multiple times.

#### Joining Nested Associations (Single Level)

```coffee
Post.joins(comments: :guest)
```

This produces:

```sql
SELECT posts.* FROM posts
  INNER JOIN comments ON comments.post_id = posts.id
  INNER JOIN guests ON guests.comment_id = comments.id
```

Or, in English: "return all posts that have a comment made by a guest."

#### Joining Nested Associations (Multiple Level)

```coffee
Category.joins(posts: [{comments: :guest}, :tags])
```

This produces:

```sql
SELECT categories.* FROM categories
  INNER JOIN posts ON posts.category_id = categories.id
  INNER JOIN comments ON comments.post_id = posts.id
  INNER JOIN guests ON guests.comment_id = comments.id
  INNER JOIN tags ON tags.post_id = posts.id
```

### Specifying Conditions on the Joined Tables

You can specify conditions on the joined tables using the regular [Array](#array-conditions) and [String](#pure-string-conditions) conditions. [Hash conditions](#hash-conditions) provides a special syntax for specifying conditions for the joined tables:

```coffee
time_range = (Time.now.midnight - 1.day)..Time.now.midnight
Client.joins(:orders).where('orders.created_at' => time_range)
```

An alternative and cleaner syntax is to nest the hash conditions:

```coffee
time_range = (Time.now.midnight - 1.day)..Time.now.midnight
Client.joins(:orders).where(orders: {created_at: time_range})
```

This will find all clients who have orders that were created yesterday, again using a `BETWEEN` SQL expression.

Eager Loading Associations
--------------------------

Eager loading is the mechanism for loading the associated records of the objects returned by `Model.find` using as few queries as possible.

**N + 1 queries problem**

Consider the following code, which finds 10 clients and prints their postcodes:

```coffee
clients = Client.limit(10)

clients.each do |client|
  puts client.address.postcode
```

This code looks fine at the first sight. But the problem lies within the total number of queries executed. The above code executes 1 (to find 10 clients) + 10 (one per each client to load the address) = **11** queries in total.

**Solution to N + 1 queries problem**

Active Record lets you specify in advance all the associations that are going to be loaded. This is possible by specifying the `includes` method of the `Model.find` call. With `includes`, Active Record ensures that all of the specified associations are loaded using the minimum possible number of queries.

Revisiting the above case, we could rewrite `Client.limit(10)` to use eager load addresses:

```coffee
clients = Client.includes(:address).limit(10)

clients.each do |client|
  puts client.address.postcode
```

The above code will execute just **2** queries, as opposed to **11** queries in the previous case:

```sql
SELECT * FROM clients LIMIT 10
SELECT addresses.* FROM addresses
  WHERE (addresses.client_id IN (1,2,3,4,5,6,7,8,9,10))
```

### Eager Loading Multiple Associations

Active Record lets you eager load any number of associations with a single `Model.find` call by using an array, hash, or a nested hash of array/hash with the `includes` method.

#### Array of Multiple Associations

```coffee
Post.includes(:category, :comments)
```

This loads all the posts and the associated category and comments for each post.

#### Nested Associations Hash

```coffee
Category.includes(posts: [{comments: :guest}, :tags]).find(1)
```

This will find the category with id 1 and eager load all of the associated posts, the associated posts' tags and comments, and every comment's guest association.

### Specifying Conditions on Eager Loaded Associations

Even though Active Record lets you specify conditions on the eager loaded associations just like `joins`, the recommended way is to use [joins](#joining-tables) instead.

However if you must do this, you may use `where` as you would normally.

```coffee
Post.includes(:comments).where("comments.visible" => true)
```

This would generate a query which contains a `LEFT OUTER JOIN` whereas the `joins` method would generate one using the `INNER JOIN` function instead.

```coffee
  SELECT "posts"."id" AS t0_r0, ... "comments"."updated_at" AS t1_r5 FROM "posts" LEFT OUTER JOIN "comments" ON "comments"."post_id" = "posts"."id" WHERE (comments.visible = 1)
```

If there was no `where` condition, this would generate the normal set of two queries.

If, in the case of this `includes` query, there were no comments for any posts, all the posts would still be loaded. By using `joins` (an INNER JOIN), the join conditions **must** match, otherwise no records will be returned.

Scopes
------

Scoping allows you to specify commonly-used queries which can be referenced as method calls on the association objects or models. With these scopes, you can use every method previously covered such as `where`, `joins` and `includes`. All scope methods will return an `ActiveRecord.Relation` object which will allow for further methods (such as other scopes) to be called on it.

To define a simple scope, we use the `scope` method inside the class, passing the query that we'd like to run when this scope is called:

```coffee
class Post extends ActiveRecord
  ActiveRecord.scope(this, {
    published: -> @where(published: true)
  })

```

This is exactly the same as defining a class method, and which you use is a matter of personal preference:

```coffee
class Post extends ActiveRecord
  published: ->
    @where(published: true)
```

Scopes are also chainable within scopes:

```coffee
class Post extends ActiveRecord
  tableName: 'posts'

ActiveRecord.scope Post,
  published: -> @where(published: true)
  publishedAndCommented: -> @published().where('comments_count > 0')
```

To call this `published` scope we can call it on either the class:

```coffee
Post.published().then() published # => [published posts]
```

Or on an association consisting of `Post` objects:

```coffee
Category.first().then (category) ->
  category.posts().published()
.then(console.log)
# > [published posts belonging to this category]
```

### Passing in arguments

Your scope can take arguments:

```coffee
class Post extends ActiveRecord
  ActiveRecord.scope Post,
    createdBefore: -> (time) @where("created_at < ?", time)
```

This may then be called using this:

```coffee
Post.createdBefore(Time.zone.now)
```

However, this is just duplicating the functionality that would be provided to you by a class method.

```coffee
class Post extends ActiveRecord
  createdBefore: (time) ->
    @where("created_at < ?", time)
```

Using a class method is the preferred way to accept arguments for scopes. These methods will still be accessible on the association objects:

```coffee
category.posts().createdBefore(time)
```

### Merging of scopes

Just like `where` clauses scopes are merged using `AND` conditions.

```coffee
class User extends ActiveRecord
  scope :active, -> { where state: 'active' }
  scope :inactive, -> { where state: 'inactive' }
end

User.active.inactive
# => SELECT "users".* FROM "users" WHERE "users"."state" = 'active' AND "users"."state" = 'inactive'
```

We can mix and match `scope` and `where` conditions and the final sql
will have all conditions joined with `AND` .

```coffee
User.active.where(state: 'finished')
# => SELECT "users".* FROM "users" WHERE "users"."state" = 'active' AND "users"."state" = 'finished'
```

If we do want the `last where clause` to win then `Relation#merge` can
be used .

```coffee
User.active.merge(User.inactive)
# => SELECT "users".* FROM "users" WHERE "users"."state" = 'inactive'
```

One important caveat is that `defaultScope` will be overridden by
`scope` and `where` conditions.

```coffee
class User extends ActiveRecord
  ActiveRecord.scope User,
    active: -> @where state: 'active'
    inactive: -> @where state: 'inactive'

  defaultScope: -> @where state: 'pending'

User.all()
# => SELECT "users".* FROM "users" WHERE "users"."state" = 'pending'

User.active()
# => SELECT "users".* FROM "users" WHERE "users"."state" = 'active'

User.where(state: 'inactive')
# => SELECT "users".* FROM "users" WHERE "users"."state" = 'inactive'
```

As you can see above the `defaultScope` is being overridden by both
`scope` and `where` conditions.

### Applying a default scope

If we wish for a scope to be applied across all queries to the model we can use the
`defaultScope` method within the model itself.

```coffee
class Client extends ActiveRecord
  defaultScope: -> @whereRaw("removed_at IS NULL")
```

When queries are executed on this model, the SQL query will now look something like
this:

```sql
SELECT * FROM clients WHERE removed_at IS NULL
```


### Removing All Scoping

If we wish to remove scoping for any reason we can use the `unscoped` method. This is
especially useful if a `defaultScope` is specified in the model and should not be
applied for this particular query.

```coffee
Client.unscoped().all()
```

This method removes all scoping and will do a normal query on the table.

Note that chaining `unscoped` with a `scope` does not work. In these cases, it is
recommended that you use the block form of `unscoped`:

```coffee
Client.unscoped {
  Client.createdBefore(Time.zone.now)
}
```

Find or Build a New Object
--------------------------

It's common that you need to find a record or create it if it doesn't exist. You can do that with the `findOrCreateBy` method.

### `findOrCreateBy`

The `findOrCreateBy` method checks whether a record with the attributes exists. If it doesn't, then `create` is called. Let's see an example.

Suppose you want to find a client named 'Andy', and if there's none, create one. You can do so by running:

```coffee
Client.findOrCreateBy(first_name: 'Andy')
# => {id: 1, first_name: "Andy", orders_count: 0, locked: true, created_at: "2011-08-30 06:09:27", updated_at: "2011-08-30 06:09:27"}
```

The SQL generated by this method looks like this:

```sql
SELECT * FROM clients WHERE (clients.first_name = 'Andy') LIMIT 1
BEGIN
INSERT INTO clients (created_at, first_name, locked, orders_count, updated_at) VALUES ('2011-08-30 05:22:57', 'Andy', 1, NULL, '2011-08-30 05:22:57')
COMMIT
```

`findOrCreateBy` returns either the record that already exists or the new record. In our case, we didn't already have a client named Andy so the record is created and returned.

The new record might not be saved to the database; that depends on whether validations passed or not (just like `create`).

Suppose we want to set the 'locked' attribute to true if we're
creating a new record, but we don't want to include it in the query. So
we want to find the client named "Andy", or if that client doesn't
exist, create a client named "Andy" which is not locked.

We can achieve this in two ways. The first is to use `createWith`:

```coffee
Client.createWith(locked: false).findOrCreateBy(first_name: 'Andy')
```

### `findOrCreateBy!`

You can also use `findOrCreateBy!` to raise an exception if the new record is invalid. Validations are not covered on this guide, but let's assume for a moment that you temporarily add

```coffee
validates :orders_count, presence: true
```

to your `Client` model. If you try to create a new `Client` without passing an `orders_count`, the record will be invalid and an exception will be raised:

```coffee
Client.findOrCreateBy!(first_name: 'Andy')
# => ActiveRecord.RecordInvalid: Validation failed: Orders count can't be blank
```

### `findOrInitializeBy`

The `findOrInitializeBy` method will work just like
`findOrCreateBy` but it will call `new` instead of `create`. This
means that a new model instance will be created in memory but won't be
saved to the database. Continuing with the `findOrCreateBy` example, we
now want the client named 'Nick':

```coffee
nick = Client.findOrInitializeBy(first_name: 'Nick')
# => {Client id: nil, first_name: "Nick", orders_count: 0, locked: true, created_at: "2011-08-30 06:09:27", updated_at: "2011-08-30 06:09:27"}

nick.persisted?
# => false

nick.new_record?
# => true
```

Because the object is not yet stored in the database, the SQL generated looks like this:

```sql
SELECT * FROM clients WHERE (clients.first_name = 'Nick') LIMIT 1
```

When you want to save it to the database, just call `save`:

```coffee
nick.save
# => true
```

Finding by SQL
--------------

If you'd like to use your own SQL to find records in a table you can use `findBy_sql`. The `findBy_sql` method will return an array of objects even if the underlying query returns just a single record. For example you could run this query:

```coffee
Client.findBy_sql("SELECT * FROM clients
  INNER JOIN orders ON clients.id = orders.client_id
  ORDER clients.created_at desc")
```

`findBy_sql` provides you with a simple way of making custom calls to the database and retrieving instantiated objects.

### `select_all`

`findBy_sql` has a close relative called `connection#select_all`. `select_all` will retrieve objects from the database using custom SQL just like `findBy_sql` but will not instantiate them. Instead, you will get an array of hashes where each hash indicates a record.

```coffee
Client.connection.select_all("SELECT * FROM clients WHERE id = '1'")
```

### `pluck`

`pluck` can be used to query a single or multiple columns from the underlying table of a model. It accepts a list of column names as argument and returns an array of values of the specified columns with the corresponding data type.

```coffee
Client.where(active: true).pluck('id')
# SELECT id FROM clients WHERE active = 1
# => [1, 2, 3]

Client.distinct().pluck('role')
# SELECT DISTINCT role FROM clients
# => ['admin', 'member', 'guest']

Client.pluck('id', 'name')
# SELECT clients.id, clients.name FROM clients
# => [[1, 'David'], [2, 'Jeremy'], [3, 'Jose']]
```

`pluck` makes it possible to replace code like

```coffee
Client.query('select', 'id').mapThen (c) -> c.id
# or
Client.query('select', 'id', 'name').mapThen (c) -> [c.id, c.name]
```

with

```coffee
Client.pluck(:id)
# or
Client.pluck(:id, :name)
```

### `ids`

`ids` can be used to pluck all the IDs for the relation using the table's primary key.

```coffee
Person.ids
# SELECT id FROM people
```

```coffee
class Person extends ActiveRecord
  self.primary_key = "person_id"
end

Person.ids
# SELECT person_id FROM people
```

Existence of Objects
--------------------

If you simply want to check for the existence of the object there's a method called `exists?`. This method will query the database using the same query as `find`, but instead of returning an object or collection of objects it will return either `true` or `false`.

```coffee
Client.exists(1).then(console.log)
```

The `exists?` method also takes multiple ids, but the catch is that it will return true if any one of those records exists.

```coffee
Client.exists?(1,2,3)
# or
Client.exists?([1,2,3])
```

It's even possible to use `exists?` without any arguments on a model or a relation.

```coffee
Client.where(first_name: 'Ryan').exists?
```

The above returns `true` if there is at least one client with the `first_name` 'Ryan' and `false` otherwise.

```coffee
Client.exists?
```

The above returns `false` if the `clients` table is empty and `true` otherwise.

You can also use `any?` and `many?` to check for existence on a model or relation.

```coffee
# via a model
Post.any?
Post.many?

# via a named scope
Post.recent.any?
Post.recent.many?

# via a relation
Post.where(published: true).any?
Post.where(published: true).many?

# via an association
Post.first.categories.any?
Post.first.categories.many?
```

Calculations
------------

This section uses count as an example method in this preamble, but the options described apply to all sub-sections.

All calculation methods work directly on a model:

```coffee
Client.count()
# SELECT count(*) AS count_all FROM clients
```

Or on a relation:

```coffee
Client.where(first_name: 'Ryan').count()
# SELECT count(*) AS count_all FROM clients WHERE (first_name = 'Ryan')
```

You can also use various finder methods on a relation for performing complex calculations:

```coffee
Client.includes("orders").where(first_name: 'Ryan', orders: {status: 'received'})
```

Which will execute:

```sql
SELECT count(DISTINCT clients.id) AS count_all FROM clients
  LEFT OUTER JOIN orders ON orders.client_id = client.id WHERE
  (clients.first_name = 'Ryan' AND orders.status = 'received')
```

### Count

If you want to see how many records are in your model's table you could call `Client.count` and that will return the number. If you want to be more specific and find all the clients with their age present in the database you can use `Client.count(:age)`.

For options, please see the parent section, [Calculations](#calculations).

### Average

If you want to see the average of a certain number in one of your tables you can call the `average` method on the class that relates to the table. This method call will look something like this:

```coffee
Client.average("orders_count")
```

This will return a number (possibly a floating point number such as 3.14159265) representing the average value in the field.

For options, please see the parent section, [Calculations](#calculations).

### Minimum

If you want to find the minimum value of a field in your table you can call the `minimum` method on the class that relates to the table. This method call will look something like this:

```coffee
Client.minimum("age")
```

For options, please see the parent section, [Calculations](#calculations).

### Maximum

If you want to find the maximum value of a field in your table you can call the `maximum` method on the class that relates to the table. This method call will look something like this:

```coffee
Client.maximum("age")
```

For options, please see the parent section, [Calculations](#calculations).

### Sum

If you want to find the sum of a field for all records in your table you can call the `sum` method on the class that relates to the table. This method call will look something like this:

```coffee
Client.sum("orders_count")
```

For options, please see the parent section, [Calculations](#calculations).

Running EXPLAIN
---------------

You can run EXPLAIN on the queries triggered by relations. For example,

```coffee
User.where(id: 1).joins(:posts).explain
```

may yield

```
EXPLAIN for: SELECT `users`.* FROM `users` INNER JOIN `posts` ON `posts`.`user_id` = `users`.`id` WHERE `users`.`id` = 1
+----+-------------+-------+-------+---------------+---------+---------+-------+------+-------------+
| id | select_type | table | type  | possible_keys | key     | key_len | ref   | rows | Extra       |
+----+-------------+-------+-------+---------------+---------+---------+-------+------+-------------+
|  1 | SIMPLE      | users | const | PRIMARY       | PRIMARY | 4       | const |    1 |             |
|  1 | SIMPLE      | posts | ALL   | NULL          | NULL    | NULL    | NULL  |    1 | Using where |
+----+-------------+-------+-------+---------------+---------+---------+-------+------+-------------+
2 rows in set (0.00 sec)
```

under MySQL.

Active Record performs a pretty printing that emulates the one of the database
shells. So, the same query running with the PostgreSQL adapter would yield instead

```
EXPLAIN for: SELECT "users".* FROM "users" INNER JOIN "posts" ON "posts"."user_id" = "users"."id" WHERE "users"."id" = 1
                                  QUERY PLAN
------------------------------------------------------------------------------
 Nested Loop Left Join  (cost=0.00..37.24 rows=8 width=0)
   Join Filter: (posts.user_id = users.id)
   ->  Index Scan using users_pkey on users  (cost=0.00..8.27 rows=1 width=4)
         Index Cond: (id = 1)
   ->  Seq Scan on posts  (cost=0.00..28.88 rows=8 width=4)
         Filter: (posts.user_id = 1)
(6 rows)
```

Eager loading may trigger more than one query under the hood, and some queries
may need the results of previous ones. Because of that, `explain` actually
executes the query, and then asks for the query plans. For example,

```coffee
User.where(id: 1).includes(:posts).explain
```

yields

```
EXPLAIN for: SELECT `users`.* FROM `users`  WHERE `users`.`id` = 1
+----+-------------+-------+-------+---------------+---------+---------+-------+------+-------+
| id | select_type | table | type  | possible_keys | key     | key_len | ref   | rows | Extra |
+----+-------------+-------+-------+---------------+---------+---------+-------+------+-------+
|  1 | SIMPLE      | users | const | PRIMARY       | PRIMARY | 4       | const |    1 |       |
+----+-------------+-------+-------+---------------+---------+---------+-------+------+-------+
1 row in set (0.00 sec)

EXPLAIN for: SELECT `posts`.* FROM `posts`  WHERE `posts`.`user_id` IN (1)
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+
| id | select_type | table | type | possible_keys | key  | key_len | ref  | rows | Extra       |
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+
|  1 | SIMPLE      | posts | ALL  | NULL          | NULL | NULL    | NULL |    1 | Using where |
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+
1 row in set (0.00 sec)
```

under MySQL.

### Interpreting EXPLAIN

Interpretation of the output of EXPLAIN is beyond the scope of this guide. The
following pointers may be helpful:

* SQLite3: [EXPLAIN QUERY PLAN](http://www.sqlite.org/eqp.html)

* MySQL: [EXPLAIN Output Format](http://dev.mysql.com/doc/refman/5.6/en/explain-output.html)

* PostgreSQL: [Using EXPLAIN](http://www.postgresql.org/docs/current/static/using-explain.html)
