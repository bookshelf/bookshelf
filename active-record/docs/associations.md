Active Record Associations
==========================

This guide covers the association features of Active Record.

After reading this guide, you will know:

* How to declare associations between Active Record models.
* How to understand the various types of Active Record associations.
* How to use the methods added to your models by creating associations.

--------------------------------------------------------------------------------

Why Associations?
-----------------

Why do we need associations between models? Because they make common operations simpler and easier in your code. For example, consider a simple application that includes a model for customers and a model for orders. Each customer can have many orders. Without associations, the model declarations would look like this:

```coffee
class Customer extends ActiveRecord
  tableName: 'customers'

class Order extends ActiveRecord
  tableName: 'orders'
```

NOTE: All examples assume that `ActiveRecord` has been required and initialized somewhere in the current scope.

Now, suppose we wanted to add a new order for an existing customer. We'd need to do something like this:

```coffee
@order = Order.create(order_date: new Date(), customer_id: @customer.id)
```

Or consider deleting a customer, and ensuring that all of its orders get deleted as well:

```coffee
Order.where(customer_id: customer.id).all().then (orders) ->
  orders.invokeThen('destroy')
.then ->
  customer.destroy()
```

With Active Record associations, we can streamline these - and other - operations by declaratively telling ActiveRecord that there is a connection between the two models. Here's the revised code for setting up customers and orders:

```coffee
class Customer extends ActiveRecord
  dependent:
    destroy: ['orders']
  orders: ->
    @hasMany Order

class Order extends ActiveRecord
  customer: ->
    @belongsTo Customer
```

With this change, creating a new order for a particular customer is easier:

```coffee
@order = @customer.orders().create(order_date: Time.now)
```

Deleting a customer and all of its orders is *much* easier:

```coffee
@customer.destroy()
```

To learn more about the different types of associations, read the next section of this guide. That's followed by some tips and tricks for working with associations, and then by a complete reference to the methods and options for associations.

The Types of Associations
-------------------------

An _association_ is a connection between two Active Record models. Associations are implemented using macro-style calls, so that you can declaratively add features to your models. For example, by declaring that one model `belongsTo` another, you instruct ActiveRecord to maintain Primary Key-Foreign Key information between instances of the two models, and you also get a number of utility methods added to your model. ActiveRecord supports eleven types of associations:

* `belongsTo`
* `hasOne`
* `hasMany`
* `belongsToMany`
* `belongsTo, through`
* `hasOne, through`
* `hasMany, through`
* `belongsToMany, through`
* `morphOne`
* `morphMany`
* `morphTo`

In the remainder of this guide, you'll learn how to declare and use the various forms of associations. But first, a quick introduction to the situations where each association type is appropriate.

### The `belongsTo` Association

A `belongsTo` association sets up a one-to-one connection with another model, such that each instance of the declaring model "belongs to" one instance of the other model. For example, if your application includes customers and orders, and each order can be assigned to exactly one customer, you'd declare the order model this way:

```coffee
class Order extends ActiveRecord
  customer: ->
    @belongsTo Customer
```

![belongsTo Association Diagram](images/belongsTo.png)

The corresponding migration might look like this:

```coffee
class CreateOrders extends ActiveRecord.Migration
  up: ->
    @createTable 'customers', (t) ->
      t.string 'name'
      t.timestamps()

    @createTable 'orders', (t) ->
      t.belongsTo :customer
      t.datetime :order_date
      t.timestamps()
```

### The `hasOne` Association

A `hasOne` association also sets up a one-to-one connection with another model, but with somewhat different semantics (and consequences). This association indicates that each instance of a model contains or possesses one instance of another model. For example, if each supplier in your application has only one account, you'd declare the supplier model like this:

```coffee
class Supplier extends ActiveRecord
  account: -> @hasOne Account
```

![hasOne Association Diagram](images/hasOne.png)

The corresponding migration might look like this:

```coffee
class CreateSuppliers extends ActiveRecord.Migration
  up: ->
    @createTable 'suppliers', (t) ->
      t.string 'name'
      t.timestamps()

    @createTable 'accounts' (t) ->
      t.belongsTo 'supplier'
      t.string 'account_number'
      t.timestamps()
```

### The `hasMany` Association

A `hasMany` association indicates a one-to-many connection with another model. You'll often find this association on the "other side" of a `belongsTo` association. This association indicates that each instance of the model has zero or more instances of another model. For example, in an application containing customers and orders, the customer model could be declared like this:

```coffee
class Customer extends ActiveRecord
  orders: ->
    @hasMany Order
```

![hasMany Association Diagram](images/hasMany.png)

The corresponding migration might look like this:

```coffee
class CreateCustomers extends ActiveRecord.Migration
  up: ->
    @createTable :customers, (t) ->
      t.string :name
      t.timestamps()

    @createTable :orders, (t) ->
      t.belongsTo :customer
      t.datetime :order_date
      t.timestamps()
```

### The `belongsToMany` Association

A `belongsToMany` association creates a direct many-to-many connection with another model, with no intervening model. For example, if your application includes assemblies and parts, with each assembly having many parts and each part appearing in many assemblies, you could declare the models this way:

```coffee
class Assembly extends ActiveRecord
  belongsToMany :parts

class Part extends ActiveRecord
  belongsToMany :assemblies
```

![belongsToMany Association Diagram](images/habtm.png)

The corresponding migration might look like this:

```coffee
class CreateAssembliesAndParts extends ActiveRecord.Migration
  up: ->
    @createTable :assemblies, (t) ->
      t.string :name
      t.timestamps()

    @createTable :parts, (t) ->
      t.string :part_number
      t.timestamps()

    @createTable :assemblies_parts, (t) ->
      t.belongsTo :assembly
      t.belongsTo :part
```


### The `hasOne, through` Association

A `hasOne, through` association sets up a one-to-one connection with another model. This association indicates that the declaring model can be matched with one instance of another model by proceeding _through_ a third model. For example, if each supplier has one account, and each account is associated with one account history, then the customer model could look like this:

```coffee
class Supplier extends ActiveRecord
  account: -> @hasOne Account
  accountHistory ->
    @hasOne(AccountHistory).through Account

class Account extends ActiveRecord
  supplier: ->
    @belongsTo Supplier
  accountHistory: ->
    @hasOne AccountHistory

class AccountHistory extends ActiveRecord
  account: ->
    @belongsTo Account
```

![hasOne, through Association Diagram](images/hasOne_through.png)

The corresponding migration might look like this:

```coffee
class CreateAccountHistories extends ActiveRecord.Migration
  up: ->
    @createTable :suppliers, (t) ->
      t.string :name
      t.timestamps()

    @createTable :accounts, (t) ->
      t.belongsTo :supplier
      t.string :account_number
      t.timestamps()

    @createTable :account_histories, (t) ->
      t.belongsTo :account
      t.integer :credit_rating
      t.timestamps()
```

### The `belongsToMany, through` Association

A `belongsToMany, through` association is often used to set up a many-to-many connection with another model. This association indicates that the declaring model can be matched with zero or more instances of another model by proceeding _through_ a third model. For example, consider a medical practice where patients make appointments to see physicians. The relevant association declarations could look like this:

```coffee
class Physician extends ActiveRecord
  appointments: -> @hasMany Appointment
  patients: ->
    @belongsToMany(Patient).through Appointment

class Appointment extends ActiveRecord
  physician: -> @belongsTo Physician
  patient: -> @belongsTo Patient

class Patient extends ActiveRecord
  appointments: -> @hasMany Appointment
  physicians: ->
    @belongsToMany(Physicians).through Appointment
```

![hasMany, through Association Diagram](images/hasMany_through.png)

The corresponding migration might look like this:

```coffee
class CreateAppointments extends ActiveRecord.Migration
  up: ->
    @createTable 'physicians', (t) ->
      t.string 'name'
      t.timestamps()

    @createTable 'patients', (t) ->
      t.string 'name'
      t.timestamps()

    @createTable 'appointments' (t) ->
      t.belongsTo 'physician'
      t.belongsTo 'patient'
      t.datetime 'appointment_date'
      t.timestamps()
```

The collection of join models can be managed via the API. For example, if you assign

```coffee
physician.patients = patients
```

new join models are created for newly associated objects, and if some are gone their rows are deleted.

WARNING: Automatic deletion of join models is direct, no destroy callbacks are triggered.

The `hasMany, through` association is also useful for setting up "shortcuts" through nested `hasMany` associations. For example, if a document has many sections, and a section has many paragraphs, you may sometimes want to get a simple collection of all paragraphs in the document. You could set that up this way:

```coffee
class Document extends ActiveRecord
  sections: ->
    @hasMany Section

  paragraphs: ->
    @hasMany(Paragraphs).through(Section)

class Section extends ActiveRecord
  document: ->
    @belongsTo Document

  paragraphs: ->
    @hasMany Paragraph

class Paragraph extends ActiveRecord
  section: ->
    @belongsTo Section
```

With `through: :sections` specified, Rails will now understand:

```coffee
document.paragraphs()
```

### Choosing Between `belongsTo` and `hasOne`

If you want to set up a one-to-one relationship between two models, you'll need to add `belongsTo` to one, and `hasOne` to the other. How do you know which is which?

The distinction is in where you place the foreign key (it goes on the table for the class declaring the `belongsTo` association), but you should give some thought to the actual meaning of the data as well. The `hasOne` relationship says that one of something is yours - that is, that something points back to you. For example, it makes more sense to say that a supplier owns an account than that an account owns a supplier. This suggests that the correct relationships are like this:

```coffee
class Supplier extends ActiveRecord
  hasOne :account

class Account extends ActiveRecord
  belongsTo :supplier
```

The corresponding migration might look like this:

```coffee
class CreateSuppliers extends ActiveRecord.Migration
  up: ->
    @createTable 'suppliers', (t) ->
      t.string  :name
      t.timestamps()

    @createTable :accounts, (t) ->
      t.integer :supplier_id
      t.string  :account_number
      t.timestamps()
```

NOTE: Using `t.integer :supplier_id` makes the foreign key naming obvious and explicit. In current versions of Rails, you can abstract away this implementation detail by using `t.references :supplier` instead.

### Choosing Between `hasMany, through` and `belongsToMany`

Rails offers two different ways to declare a many-to-many relationship between models. The simpler way is to use `belongsToMany`, which allows you to make the association directly:

```coffee
class Assembly extends ActiveRecord
  belongsToMany :parts

class Part extends ActiveRecord
  belongsToMany :assemblies
```

The second way to declare a many-to-many relationship is to use `hasMany, through`. This makes the association indirectly, through a join model:

```coffee
class Assembly extends ActiveRecord
  hasMany :manifests
  hasMany :parts, through: :manifests

class Manifest extends ActiveRecord
  belongsTo :assembly
  belongsTo :part

class Part extends ActiveRecord
  hasMany :manifests
  hasMany :assemblies, through: :manifests
```

The simplest rule of thumb is that you should set up a `hasMany, through` relationship if you need to work with the relationship model as an independent entity. If you don't need to do anything with the relationship model, it may be simpler to set up a `belongsToMany` relationship (though you'll need to remember to create the joining table in the database).

You should use `hasMany, through` if you need validations, callbacks, or extra attributes on the join model.

### Polymorphic Associations

A slightly more advanced twist on associations is the _polymorphic association_. With polymorphic associations, a model can belong to more than one other model, on a single association. For example, you might have a picture model that belongs to either an employee model or a product model. Here's how this could be declared:

```coffee
class Picture extends ActiveRecord
  belongsTo :imageable, polymorphic: true

class Employee extends ActiveRecord
  hasMany :pictures, as: :imageable

class Product extends ActiveRecord
  hasMany :pictures, as: :imageable
```

You can think of a polymorphic `belongsTo` declaration as setting up an interface that any other model can use. From an instance of the `Employee` model, you can retrieve a collection of pictures: `@employee.pictures`.

Similarly, you can retrieve `@product.pictures`.

If you have an instance of the `Picture` model, you can get to its parent via `@picture.imageable`. To make this work, you need to declare both a foreign key column and a type column in the model that declares the polymorphic interface:

```coffee
class CreatePictures extends ActiveRecord.Migration
  up: ->
    @createTable :pictures, (t) ->
      t.string  :name
      t.integer :imageable_id
      t.string  :imageable_type
      t.timestamps()
```

This migration can be simplified by using the `t.references` form:

```coffee
class CreatePictures extends ActiveRecord.Migration
  up: ->
    @createTable :pictures, (t) ->
      t.string :name
      t.references :imageable, polymorphic: true
      t.timestamps()
```

![Polymorphic Association Diagram](images/polymorphic.png)

### Self Joins

In designing a data model, you will sometimes find a model that should have a relation to itself. For example, you may want to store all employees in a single database model, but be able to trace relationships such as between manager and subordinates. This situation can be modeled with self-joining associations:

```coffee
class Employee extends ActiveRecord
  hasMany :subordinates, class_name: "Employee",
                          foreignKey: "manager_id"

  belongsTo :manager, class_name: "Employee"
```

With this setup, you can retrieve `@employee.subordinates` and `@employee.manager`.

Tips, Tricks, and Warnings
--------------------------

Here are a few things you should know to make efficient use of Active Record associations in your Rails applications:

* Controlling caching
* Avoiding name collisions
* Updating the schema
* Controlling association scope
* Bi-directional associations

### Controlling Caching

All of the association methods are built around caching, which keeps the result of the most recent query available for further operations. The cache is even shared across methods. For example:

```coffee
customer.orders                 # retrieves orders from the database
customer.orders.size            # uses the cached copy of orders
customer.orders.empty?          # uses the cached copy of orders
```

But what if you want to reload the cache, because data might have been changed by some other part of the application? Just pass `true` to the association call:

```coffee
customer.orders                 # retrieves orders from the database
customer.orders.size            # uses the cached copy of orders
customer.orders(true).empty?    # discards the cached copy of orders
                                # and goes back to the database
```

### Avoiding Name Collisions

You are not free to use just any name for your associations. Because creating an association adds a method with that name to the model, it is a bad idea to give an association a name that is already used for an instance method of `ActiveRecord::Base`. The association method would override the base method and break things. For instance, `attributes` or `connection` are bad names for associations.

### Updating the Schema

Associations are extremely useful, but they are not magic. You are responsible for maintaining your database schema to match your associations. In practice, this means two things, depending on what sort of associations you are creating. For `belongsTo` associations you need to create foreign keys, and for `belongsToMany` associations you need to create the appropriate join table.

#### Creating Foreign Keys for `belongsTo` Associations

When you declare a `belongsTo` association, you need to create foreign keys as appropriate. For example, consider this model:

```coffee
class Order extends ActiveRecord
  belongsTo :customer
```

This declaration needs to be backed up by the proper foreign key declaration on the orders table:

```coffee
class CreateOrders extends ActiveRecord.Migration
  up: ->
    @createTable :orders, (t) ->
      t.datetime :order_date
      t.string   :order_number
      t.integer  :customer_id
```

If you create an association some time after you build the underlying model, you need to remember to create an `add_column` migration to provide the necessary foreign key.

#### Creating Join Tables for `belongsToMany` Associations

If you create a `belongsToMany` association, you need to explicitly create the joining table. Unless the name of the join table is explicitly specified by using the `joinTable` option, Active Record creates the name by using the lexical order of the class names. So a join between customer and order models will give the default join table name of "customers_orders" because "c" outranks "o" in lexical ordering.

WARNING: The precedence between model names is calculated using the `<` operator for `String`. This means that if the strings are of different lengths, and the strings are equal when compared up to the shortest length, then the longer string is considered of higher lexical precedence than the shorter one. For example, one would expect the tables "paper\_boxes" and "papers" to generate a join table name of "papers\_paper\_boxes" because of the length of the name "paper\_boxes", but it in fact generates a join table name of "paper\_boxes\_papers" (because the underscore '\_' is lexicographically _less_ than 's' in common encodings).

Whatever the name, you must manually generate the join table with an appropriate migration. For example, consider these associations:

```coffee
class Assembly extends ActiveRecord
  parts: ->
    @belongsToMany Part

class Part extends ActiveRecord
  assemblies: ->
    @belongsToMany Assembly
```

These need to be backed up by a migration to create the `assemblies_parts` table. This table should be created without a primary key:

```coffee
class CreateAssembliesPartsJoinTable extends ActiveRecord.Migration
  up: ->
    @createTable 'assemblies_parts', id: false, (t) ->
      t.integer 'assembly_id'
      t.integer 'part_id'
```

We pass `id: false` to `create_table` because that table does not represent a model. That's required for the association to work properly. If you observe any strange behavior in a `belongsToMany` association like mangled models IDs, or exceptions about conflicting IDs, chances are you forgot that bit.

### Controlling Association Scope

By default, associations look for objects only within the current module's scope. This can be important when you declare Active Record models within a module. For example:

```coffee
module MyApplication
  module Business
    class Supplier extends ActiveRecord
       hasOne :account

        class Account extends ActiveRecord
       belongsTo :supplier
```

This will work fine, because both the `Supplier` and the `Account` class are defined within the same scope. But the following will _not_ work, because `Supplier` and `Account` are defined in different scopes:

```coffee
module MyApplication
  module Business
    class Supplier extends ActiveRecord
       hasOne :account
    end

    module Billing
    class Account extends ActiveRecord
       belongsTo :supplier
```

To associate a model with a model in a different namespace, you must specify the complete class name in your association declaration:

```coffee
module MyApplication
  module Business
    class Supplier extends ActiveRecord
       hasOne :account,
        class_name: "MyApplication::Billing::Account"
    end

    module Billing
    class Account extends ActiveRecord
       belongsTo :supplier,
        class_name: "MyApplication::Business::Supplier"
```

### Bi-directional Associations

It's normal for associations to work in two directions, requiring declaration on two different models:

```coffee
class Customer extends ActiveRecord
  hasMany :orders

class Order extends ActiveRecord
  belongsTo :customer
```

By default, Active Record doesn't know about the connection between these associations. This can lead to two copies of an object getting out of sync:

```coffee
c = Customer.first
o = c.orders.first
c.first_name == o.customer.first_name # => true
c.first_name = 'Manny'
c.first_name == o.customer.first_name # => false
```

This happens because c and o.customer are two different in-memory representations of the same data, and neither one is automatically refreshed from changes to the other. Active Record provides the `:inverse_of` option so that you can inform it of these relations:

```coffee
class Customer extends ActiveRecord
  hasMany :orders, inverse_of: :customer

class Order extends ActiveRecord
  belongsTo :customer, inverse_of: :orders
```

With these changes, Active Record will only load one copy of the customer object, preventing inconsistencies and making your application more efficient:

```coffee
c = Customer.first
o = c.orders.first
c.first_name == o.customer.first_name # => true
c.first_name = 'Manny'
c.first_name == o.customer.first_name # => true
```

There are a few limitations to `inverse_of` support:

* They do not work with `:through` associations.
* They do not work with `:polymorphic` associations.
* They do not work with `:as` associations.
* For `belongsTo` associations, `hasMany` inverse associations are ignored.

Every association will attempt to automatically find the inverse association
and set the `:inverse_of` option heuristically (based on the association name).
Most associations with standard names will be supported. However, associations
that contain the following options will not have their inverses set
automatically:

* :conditions
*, through
* :polymorphic
* :foreignKey

Detailed Association Reference
------------------------------

The following sections give the details of each type of association, including the methods that they add and the options that you can use when declaring an association.

### `belongsTo` Association Reference

The `belongsTo` association creates a one-to-one match with another model. In database terms, this association says that this class contains the foreign key. If the other class contains the foreign key, then you should use `hasOne` instead.

#### Methods Added by `belongsTo`

When you declare a `belongsTo` association, the declaring class automatically gains four methods related to the association:

* `association(force_reload = false)`
* `association=(associate)`
* `build_association(attributes = {})`
* `create_association(attributes = {})`
* `create_association!(attributes = {})`

In all of these methods, `association` is replaced with the symbol passed as the first argument to `belongsTo`. For example, given the declaration:

```coffee
class Order extends ActiveRecord
  belongsTo :customer
```

Each instance of the order model will have these methods:

```coffee
customer
customer=
build_customer
create_customer
create_customer!
```

NOTE: When initializing a new `hasOne` or `belongsTo` association you must use the `build_` prefix to build the association, rather than the `association.build` method that would be used for `hasMany` or `belongsToMany` associations. To create one, use the `create_` prefix.

##### `association(force_reload = false)`

The `association` method returns the associated object, if any. If no associated object is found, it returns `nil`.

```coffee
@customer = @order.customer
```

If the associated object has already been retrieved from the database for this object, the cached version will be returned. To override this behavior (and force a database read), pass `true` as the `force_reload` argument.

##### `association=(associate)`

The `association=` method assigns an associated object to this object. Behind the scenes, this means extracting the primary key from the associate object and setting this object's foreign key to the same value.

```coffee
@order.customer = @customer
```

##### `build_association(attributes = {})`

The `build_association` method returns a new object of the associated type. This object will be instantiated from the passed attributes, and the link through this object's foreign key will be set, but the associated object will _not_ yet be saved.

```coffee
@customer = @order.build_customer(customer_number: 123,
                                  customer_name: "John Doe")
```

##### `create_association(attributes = {})`

The `create_association` method returns a new object of the associated type. This object will be instantiated from the passed attributes, the link through this object's foreign key will be set, and, once it passes all of the validations specified on the associated model, the associated object _will_ be saved.

```coffee
@customer = @order.create_customer(customer_number: 123,
                                   customer_name: "John Doe")
```

##### `create_association!(attributes = {})`

Does the same as `create_association` above, but raises `ActiveRecord::RecordInvalid` if the record is invalid.


#### Options for `belongsTo`

While Rails uses intelligent defaults that will work well in most situations, there may be times when you want to customize the behavior of the `belongsTo` association reference. Such customizations can easily be accomplished by passing options and scope blocks when you create the association. For example, this association uses two such options:

```coffee
class Order extends ActiveRecord
  belongsTo :customer, dependent: :destroy,
    counter_cache: true
```

The `belongsTo` association supports these options:

* `autosave`
* `:counter_cache`
* `:dependent`
* `:foreignKey`
* `:inverse_of`
* `:polymorphic`
* `:touch`
* `:validate`

##### `autosave`

If you set the `autosave` option to `true`, Rails will save any loaded members and destroy members that are marked for destruction whenever you save the parent object.

##### `:counter_cache`

The `:counter_cache` option can be used to make finding the number of belonging objects more efficient. Consider these models:

```coffee
class Order extends ActiveRecord
  belongsTo :customer
end
class Customer extends ActiveRecord
  hasMany :orders
```

With these declarations, asking for the value of `@customer.orders.size` requires making a call to the database to perform a `COUNT(*)` query. To avoid this call, you can add a counter cache to the _belonging_ model:

```coffee
class Order extends ActiveRecord
  belongsTo :customer, counter_cache: true
end
class Customer extends ActiveRecord
  hasMany :orders
```

With this declaration, Rails will keep the cache value up to date, and then return that value in response to the `size` method.

Although the `:counter_cache` option is specified on the model that includes the `belongsTo` declaration, the actual column must be added to the _associated_ model. In the case above, you would need to add a column named `orders_count` to the `Customer` model. You can override the default column name if you need to:

```coffee
class Order extends ActiveRecord
  belongsTo :customer, counter_cache: :count_of_orders
end
class Customer extends ActiveRecord
  hasMany :orders
```

Counter cache columns are added to the containing model's list of read-only attributes through `attr_readonly`.

##### `:dependent`

If you set the `:dependent` option to `:destroy`, then deleting this object will call the `destroy` method on the associated object to delete that object. If you set the `:dependent` option to `:delete`, then deleting this object will delete the associated object _without_ calling its `destroy` method. If you set the `:dependent` option to `:restrict`, then attempting to delete this object will result in a `ActiveRecord::DeleteRestrictionError` if there are any associated objects.

WARNING: You should not specify this option on a `belongsTo` association that is connected with a `hasMany` association on the other class. Doing so can lead to orphaned records in your database.

##### `:foreignKey`

By convention, Rails assumes that the column used to hold the foreign key on this model is the name of the association with the suffix `_id` added. The `:foreignKey` option lets you set the name of the foreign key directly:

```coffee
class Order extends ActiveRecord
  belongsTo :customer, class_name: "Patron",
                        foreignKey: "patron_id"
```

TIP: In any case, Rails will not create foreign key columns for you. You need to explicitly define them as part of your migrations.

##### `:inverse_of`

The `:inverse_of` option specifies the name of the `hasMany` or `hasOne` association that is the inverse of this association. Does not work in combination with the `:polymorphic` options.

```coffee
class Customer extends ActiveRecord
  hasMany :orders, inverse_of: :customer

class Order extends ActiveRecord
  belongsTo :customer, inverse_of: :orders
```

##### `:polymorphic`

Passing `true` to the `:polymorphic` option indicates that this is a polymorphic association. Polymorphic associations were discussed in detail <a href="#polymorphic-associations">earlier in this guide</a>.

##### `:touch`

If you set the `:touch` option to `:true`, then the `updated_at` or `updated_on` timestamp on the associated object will be set to the current time whenever this object is saved or destroyed:

```coffee
class Order extends ActiveRecord
  belongsTo :customer, touch: true

class Customer extends ActiveRecord
  hasMany :orders
```

In this case, saving or destroying an order will update the timestamp on the associated customer. You can also specify a particular timestamp attribute to update:

```coffee
class Order extends ActiveRecord
  belongsTo :customer, touch: :orders_updated_at
```

##### `:validate`

If you set the `:validate` option to `true`, then associated objects will be validated whenever you save this object. By default, this is `false`: associated objects will not be validated when this object is saved.

#### Scopes for `belongsTo`

There may be times when you wish to customize the query used by `belongsTo`. Such customizations can be achieved via a scope block. For example:

```coffee
class Order extends ActiveRecord
  belongsTo :customer, -> { where active: true },
                        dependent: :destroy
```

You can use any of the standard [querying methods](querying.html) inside the scope block. The following ones are discussed below:

* `where`
* `includes`
* `readonly`
* `select`

##### `where`

The `where` method lets you specify the conditions that the associated object must meet.

```coffee
class Order extends ActiveRecord
  customer: ->
    @belongsTo(Customer).where(active: true)
```

##### `includes`

You can use the `includes` method to specify second-order associations that should be eager-loaded when this association is used. For example, consider these models:

```coffee
class LineItem extends ActiveRecord
  order: -> @belongsTo Order

class Order extends ActiveRecord
  customer: -> @belongsTo Customer
  lineItems: -> @hasMany LineItem

class Customer extends ActiveRecord
  orders: -> @hasMany Order
```

If you frequently retrieve customers directly from line items (`@line_item.order.customer`), then you can make your code somewhat more efficient by including customers in the association from line items to orders:

```coffee
class LineItem extends ActiveRecord
  order: ->
    @belongsTo(Order).includes('customer')
```

NOTE: There's no need to use `includes` for immediate associations - that is, if you have `Order belongsTo :customer`, then the customer is eager-loaded automatically when it's needed.

##### `readonly`

If you use `readonly`, then the associated object will be read-only when retrieved via the association.

##### `select`

The `select` method lets you override the SQL `SELECT` clause that is used to retrieve data about the associated object. By default, Rails retrieves all columns.

TIP: If you use the `select` method on a `belongsTo` association, you should also set the `:foreignKey` option to guarantee the correct results.

#### Do Any Associated Objects Exist?

You can see if any associated objects exist by using the `association.nil?` method:

```coffee
if @order.customer.nil?
  @msg = "No customer found for this order"
```

#### When are Objects Saved?

Assigning an object to a `belongsTo` association does _not_ automatically save the object. It does not save the associated object either.

### `hasOne` Association Reference

The `hasOne` association creates a one-to-one match with another model. In database terms, this association says that the other class contains the foreign key. If this class contains the foreign key, then you should use `belongsTo` instead.

#### Methods Added by `hasOne`

When you declare a `hasOne` association, the declaring class automatically gains four methods related to the association:

* `association(force_reload = false)`
* `association=(associate)`
* `build_association(attributes = {})`
* `create_association(attributes = {})`
* `create_association!(attributes = {})`

In all of these methods, `association` is replaced with the symbol passed as the first argument to `hasOne`. For example, given the declaration:

```coffee
class Supplier extends ActiveRecord
  hasOne :account
```

Each instance of the `Supplier` model will have these methods:

```coffee
account
account=
build_account
create_account
create_account!
```

NOTE: When initializing a new `hasOne` or `belongsTo` association you must use the `build_` prefix to build the association, rather than the `association.build` method that would be used for `hasMany` or `belongsToMany` associations. To create one, use the `create_` prefix.

##### `association(force_reload = false)`

The `association` method returns the associated object, if any. If no associated object is found, it returns `nil`.

```coffee
@account = @supplier.account
```

If the associated object has already been retrieved from the database for this object, the cached version will be returned. To override this behavior (and force a database read), pass `true` as the `force_reload` argument.

##### `association=(associate)`

The `association=` method assigns an associated object to this object. Behind the scenes, this means extracting the primary key from this object and setting the associate object's foreign key to the same value.

```coffee
@supplier.account = @account
```

##### `build_association(attributes = {})`

The `build_association` method returns a new object of the associated type. This object will be instantiated from the passed attributes, and the link through its foreign key will be set, but the associated object will _not_ yet be saved.

```coffee
@account = @supplier.build_account(terms: "Net 30")
```

##### `create_association(attributes = {})`

The `create_association` method returns a new object of the associated type. This object will be instantiated from the passed attributes, the link through its foreign key will be set, and, once it passes all of the validations specified on the associated model, the associated object _will_ be saved.

```coffee
@account = @supplier.create_account(terms: "Net 30")
```

##### `create_association!(attributes = {})`

Does the same as `create_association` above, but raises `ActiveRecord::RecordInvalid` if the record is invalid.

#### Options for `hasOne`

While Rails uses intelligent defaults that will work well in most situations, there may be times when you want to customize the behavior of the `hasOne` association reference. Such customizations can easily be accomplished by passing options when you create the association.

The `hasOne` association supports these options:

* `:as`
* `autosave`
* `:dependent`
* `:foreignKey`
* `:inverse_of`
* `:primary_key`
* `:source`
* `:source_type`
* `:through`
* `:validate`

##### `:as`

Setting the `:as` option indicates that this is a polymorphic association. Polymorphic associations were discussed in detail <a href="#polymorphic-associations">earlier in this guide</a>.

##### `autosave`

If you set the `autosave` option to `true`, Rails will save any loaded members and destroy members that are marked for destruction whenever you save the parent object.

##### `:dependent`

Controls what happens to the associated object when its owner is destroyed:

* `:destroy` causes the associated object to also be destroyed
* `:delete` causes the associated object to be deleted directly from the database (so callbacks will not execute)
* `:nullify` causes the foreign key to be set to `NULL`. Callbacks are not executed.
* `:restrict_with_exception` causes an exception to be raised if there is an associated record
* `:restrict_with_error` causes an error to be added to the owner if there is an associated object

It's necessary not to set or leave `:nullify` option for those associations
that have `NOT NULL` database constraints. If you don't set `dependent` to
destroy such associations you won't be able to change the associated object
because initial associated object foreign key will be set to unallowed `NULL`
value.

##### `:foreignKey`

By convention, Rails assumes that the column used to hold the foreign key on the other model is the name of this model with the suffix `_id` added. The `:foreignKey` option lets you set the name of the foreign key directly:

```coffee
class Supplier extends ActiveRecord
  hasOne :account, foreignKey: "supp_id"
```

TIP: In any case, Rails will not create foreign key columns for you. You need to explicitly define them as part of your migrations.

##### `:inverse_of`

The `:inverse_of` option specifies the name of the `belongsTo` association that is the inverse of this association. Does not work in combination with the `:through` or `:as` options.

```coffee
class Supplier extends ActiveRecord
  hasOne :account, inverse_of: :supplier

class Account extends ActiveRecord
  belongsTo :supplier, inverse_of: :account
```

##### `:primary_key`

By convention, Rails assumes that the column used to hold the primary key of this model is `id`. You can override this and explicitly specify the primary key with the `:primary_key` option.

##### `:source`

The `:source` option specifies the source association name for a `hasOne, through` association.

##### `:source_type`

The `:source_type` option specifies the source association type for a `hasOne, through` association that proceeds through a polymorphic association.

##### `:through`

The `:through` option specifies a join model through which to perform the query. `hasOne, through` associations were discussed in detail <a href="#the-has-one-through-association">earlier in this guide</a>.

##### `:validate`

If you set the `:validate` option to `true`, then associated objects will be validated whenever you save this object. By default, this is `false`: associated objects will not be validated when this object is saved.

#### Scopes for `hasOne`

There may be times when you wish to customize the query used by `hasOne`. Such customizations can be achieved via a scope block. For example:

```coffee
class Supplier extends ActiveRecord
  hasOne :account, -> { where active: true }
```

You can use any of the standard [querying methods](active_record_querying.html) inside the scope block. The following ones are discussed below:

* `where`
* `includes`
* `readonly`
* `select`

##### `where`

The `where` method lets you specify the conditions that the associated object must meet.

```coffee
class Supplier extends ActiveRecord
  hasOne :account, -> { where "confirmed = 1" }
```

##### `includes`

You can use the `includes` method to specify second-order associations that should be eager-loaded when this association is used. For example, consider these models:

```coffee
class Supplier extends ActiveRecord
  hasOne :account

class Account extends ActiveRecord
  belongsTo :supplier
  belongsTo :representative

class Representative extends ActiveRecord
  hasMany :accounts
```

If you frequently retrieve representatives directly from suppliers (`@supplier.account.representative`), then you can make your code somewhat more efficient by including representatives in the association from suppliers to accounts:

```coffee
class Supplier extends ActiveRecord
  hasOne :account, -> { includes :representative }

class Account extends ActiveRecord
  belongsTo :supplier
  belongsTo :representative

class Representative extends ActiveRecord
  hasMany :accounts
```

##### `readonly`

If you use the `readonly` method, then the associated object will be read-only when retrieved via the association.

##### `select`

The `select` method lets you override the SQL `SELECT` clause that is used to retrieve data about the associated object. By default, Rails retrieves all columns.

#### Do Any Associated Objects Exist?

You can see if any associated objects exist by using the `association.nil?` method:

```coffee
if @supplier.account.nil?
  @msg = "No account found for this supplier"
```

#### When are Objects Saved?

When you assign an object to a `hasOne` association, that object is automatically saved (in order to update its foreign key). In addition, any object being replaced is also automatically saved, because its foreign key will change too.

If either of these saves fails due to validation errors, then the assignment statement returns `false` and the assignment itself is cancelled.

If the parent object (the one declaring the `hasOne` association) is unsaved (that is, `new_record?` returns `true`) then the child objects are not saved. They will automatically when the parent object is saved.

If you want to assign an object to a `hasOne` association without saving the object, use the `association.build` method.

### `hasMany` Association Reference

The `hasMany` association creates a one-to-many relationship with another model. In database terms, this association says that the other class will have a foreign key that refers to instances of this class.

#### Methods Added by `hasMany`

When you declare a `hasMany` association, the declaring class automatically gains 13 methods related to the association:

* `collection(force_reload = false)`
* `collection<<(object, ...)`
* `collection.delete(object, ...)`
* `collection.destroy(object, ...)`
* `collection=objects`
* `collection_singular_ids`
* `collection_singular_ids=ids`
* `collection.clear`
* `collection.empty?`
* `collection.size`
* `collection.find(...)`
* `collection.where(...)`
* `collection.exists?(...)`
* `collection.build(attributes = {}, ...)`
* `collection.create(attributes = {})`
* `collection.create!(attributes = {})`

In all of these methods, `collection` is replaced with the symbol passed as the first argument to `hasMany`, and `collection_singular` is replaced with the singularized version of that symbol. For example, given the declaration:

```coffee
class Customer extends ActiveRecord
  hasMany :orders
```

Each instance of the customer model will have these methods:

```coffee
orders(force_reload = false)
orders<<(object, ...)
orders.delete(object, ...)
orders.destroy(object, ...)
orders=objects
order_ids
order_ids=ids
orders.clear
orders.empty?
orders.size
orders.find(...)
orders.where(...)
orders.exists?(...)
orders.build(attributes = {}, ...)
orders.create(attributes = {})
orders.create!(attributes = {})
```

##### `collection(force_reload = false)`

The `collection` method returns an array of all of the associated objects. If there are no associated objects, it returns an empty array.

```coffee
@orders = @customer.orders
```

##### `collection<<(object, ...)`

The `collection<<` method adds one or more objects to the collection by setting their foreign keys to the primary key of the calling model.

```coffee
@customer.orders << @order1
```

##### `collection.delete(object, ...)`

The `collection.delete` method removes one or more objects from the collection by setting their foreign keys to `NULL`.

```coffee
@customer.orders.delete(@order1)
```

WARNING: Additionally, objects will be destroyed if they're associated with `dependent: :destroy`, and deleted if they're associated with `dependent: :delete_all`.

##### `collection.destroy(object, ...)`

The `collection.destroy` method removes one or more objects from the collection by running `destroy` on each object.

```coffee
@customer.orders.destroy(@order1)
```

WARNING: Objects will _always_ be removed from the database, ignoring the `:dependent` option.

##### `collection=objects`

The `collection=` method makes the collection contain only the supplied objects, by adding and deleting as appropriate.

##### `collection_singular_ids`

The `collection_singular_ids` method returns an array of the ids of the objects in the collection.

```coffee
@order_ids = @customer.order_ids
```

##### `collection_singular_ids=ids`

The `collection_singular_ids=` method makes the collection contain only the objects identified by the supplied primary key values, by adding and deleting as appropriate.

##### `collection.clear`

The `collection.clear` method removes every object from the collection. This destroys the associated objects if they are associated with `dependent: :destroy`, deletes them directly from the database if `dependent: :delete_all`, and otherwise sets their foreign keys to `NULL`.

##### `collection.empty?`

The `collection.empty?` method returns `true` if the collection does not contain any associated objects.

```erb
<% if @customer.orders.empty? %>
  No Orders Found
<% end %>
```

##### `collection.size`

The `collection.size` method returns the number of objects in the collection.

```coffee
@order_count = @customer.orders.size
```

##### `collection.find(...)`

The `collection.find` method finds objects within the collection. It uses the same syntax and options as `ActiveRecord::Base.find`.

```coffee
@open_orders = @customer.orders.find(1)
```

##### `collection.where(...)`

The `collection.where` method finds objects within the collection based on the conditions supplied but the objects are loaded lazily meaning that the database is queried only when the object(s) are accessed.

```coffee
@open_orders = @customer.orders.where(open: true) # No query yet
@open_order = @open_orders.first # Now the database will be queried
```

##### `collection.exists?(...)`

The `collection.exists?` method checks whether an object meeting the supplied conditions exists in the collection. It uses the same syntax and options as `ActiveRecord::Base.exists?`.

##### `collection.build(attributes = {}, ...)`

The `collection.build` method returns one or more new objects of the associated type. These objects will be instantiated from the passed attributes, and the link through their foreign key will be created, but the associated objects will _not_ yet be saved.

```coffee
@order = @customer.orders.build(order_date: Time.now,
                                order_number: "A12345")
```

##### `collection.create(attributes = {})`

The `collection.create` method returns a new object of the associated type. This object will be instantiated from the passed attributes, the link through its foreign key will be created, and, once it passes all of the validations specified on the associated model, the associated object _will_ be saved.

```coffee
@order = @customer.orders.create(order_date: Time.now,
                                 order_number: "A12345")
```

##### `collection.create!(attributes = {})`

Does the same as `collection.create` above, but raises `ActiveRecord::RecordInvalid` if the record is invalid.

#### Options for `hasMany`

While Rails uses intelligent defaults that will work well in most situations, there may be times when you want to customize the behavior of the `hasMany` association reference. Such customizations can easily be accomplished by passing options when you create the association. For example, this association uses two such options:

```coffee
class Customer extends ActiveRecord
  hasMany :orders, dependent: :delete_all, validate: :false
```

The `hasMany` association supports these options:

* `:as`
* `autosave`
* `:dependent`
* `:foreignKey`
* `:inverse_of`
* `:primary_key`
* `:source`
* `:source_type`
* `:through`
* `:validate`

##### `:as`

Setting the `:as` option indicates that this is a polymorphic association, as discussed <a href="#polymorphic-associations">earlier in this guide</a>.

##### `autosave`

If you set the `autosave` option to `true`, Rails will save any loaded members and destroy members that are marked for destruction whenever you save the parent object.

##### `:dependent`

Controls what happens to the associated objects when their owner is destroyed:

* `:destroy` causes all the associated objects to also be destroyed
* `:delete_all` causes all the associated objects to be deleted directly from the database (so callbacks will not execute)
* `:nullify` causes the foreign keys to be set to `NULL`. Callbacks are not executed.
* `:restrict_with_exception` causes an exception to be raised if there are any associated records
* `:restrict_with_error` causes an error to be added to the owner if there are any associated objects

NOTE: This option is ignored when you use the `:through` option on the association.

##### `:foreignKey`

By convention, Rails assumes that the column used to hold the foreign key on the other model is the name of this model with the suffix `_id` added. The `:foreignKey` option lets you set the name of the foreign key directly:

```coffee
class Customer extends ActiveRecord
  hasMany :orders, foreignKey: "cust_id"
```

TIP: In any case, Rails will not create foreign key columns for you. You need to explicitly define them as part of your migrations.

##### `:inverse_of`

The `:inverse_of` option specifies the name of the `belongsTo` association that is the inverse of this association. Does not work in combination with the `:through` or `:as` options.

```coffee
class Customer extends ActiveRecord
  hasMany :orders, inverse_of: :customer

class Order extends ActiveRecord
  belongsTo :customer, inverse_of: :orders
```

##### `:primary_key`

By convention, Rails assumes that the column used to hold the primary key of the association is `id`. You can override this and explicitly specify the primary key with the `:primary_key` option.

Let's say that `users` table has `id` as the primary_key but it also has
`guid` column. And the requirement is that `todos` table should hold
`guid` column value and not `id` value. This can be achieved like this

```coffee
class User extends ActiveRecord
  hasMany :todos, primary_key: :guid
```

Now if we execute `@user.todos.create` then `@todo` record will have
`user_id` value as the `guid` value of `@user`.


##### `:source`

The `:source` option specifies the source association name for a `hasMany, through` association. You only need to use this option if the name of the source association cannot be automatically inferred from the association name.

##### `:source_type`

The `:source_type` option specifies the source association type for a `hasMany, through` association that proceeds through a polymorphic association.

##### `:through`

The `:through` option specifies a join model through which to perform the query. `hasMany, through` associations provide a way to implement many-to-many relationships, as discussed <a href="#the-has-many-through-association">earlier in this guide</a>.

##### `:validate`

If you set the `:validate` option to `false`, then associated objects will not be validated whenever you save this object. By default, this is `true`: associated objects will be validated when this object is saved.

#### Scopes for `hasMany`

There may be times when you wish to customize the query used by `hasMany`. Such customizations can be achieved via a scope block. For example:

```coffee
class Customer extends ActiveRecord
  hasMany :orders, -> { where processed: true }
```

You can use any of the standard [querying methods](active_record_querying.html) inside the scope block. The following ones are discussed below:

* `where`
* `extending`
* `group`
* `includes`
* `limit`
* `offset`
* `order`
* `readonly`
* `select`
* `uniq`

##### `where`

The `where` method lets you specify the conditions that the associated object must meet.

```coffee
class Customer extends ActiveRecord
  hasMany :confirmed_orders, -> { where "confirmed = 1" },
    class_name: "Order"
```

You can also set conditions via a hash:

```coffee
class Customer extends ActiveRecord
  hasMany :confirmed_orders, -> { where confirmed: true },
                              class_name: "Order"
```

If you use a hash-style `where` option, then record creation via this association will be automatically scoped using the hash. In this case, using `@customer.confirmed_orders.create` or `@customer.confirmed_orders.build` will create orders where the confirmed column has the value `true`.

##### `extending`

The `extending` method specifies a named module to extend the association proxy. Association extensions are discussed in detail <a href="#association-extensions">later in this guide</a>.

##### `group`

The `group` method supplies an attribute name to group the result set by, using a `GROUP BY` clause in the finder SQL.

```coffee
class Customer extends ActiveRecord
  hasMany :line_items, -> { group 'orders.id' },
                        through: :orders
```

##### `includes`

You can use the `includes` method to specify second-order associations that should be eager-loaded when this association is used. For example, consider these models:

```coffee
class Customer extends ActiveRecord
  hasMany :orders

class Order extends ActiveRecord
  belongsTo :customer
  hasMany :line_items

class LineItem extends ActiveRecord
  belongsTo :order
```

If you frequently retrieve line items directly from customers (`@customer.orders.line_items`), then you can make your code somewhat more efficient by including line items in the association from customers to orders:

```coffee
class Customer extends ActiveRecord
  hasMany :orders, -> { includes :line_items }

class Order extends ActiveRecord
  belongsTo :customer
  hasMany :line_items

class LineItem extends ActiveRecord
  belongsTo :order
```

##### `limit`

The `limit` method lets you restrict the total number of objects that will be fetched through an association.

```coffee
class Customer extends ActiveRecord
  hasMany :recent_orders,
    -> { order('order_date desc').limit(100) },
    class_name: "Order",
```

##### `offset`

The `offset` method lets you specify the starting offset for fetching objects via an association. For example, `-> { offset(11) }` will skip the first 11 records.

##### `order`

The `order` method dictates the order in which associated objects will be received (in the syntax used by an SQL `ORDER BY` clause).

```coffee
class Customer extends ActiveRecord
  hasMany :orders, -> { order "date_confirmed DESC" }
```

##### `readonly`

If you use the `readonly` method, then the associated objects will be read-only when retrieved via the association.

##### `select`

The `select` method lets you override the SQL `SELECT` clause that is used to retrieve data about the associated objects. By default, Rails retrieves all columns.

WARNING: If you specify your own `select`, be sure to include the primary key and foreign key columns of the associated model. If you do not, Rails will throw an error.

##### `distinct`

Use the `distinct` method to keep the collection free of duplicates. This is
mostly useful together with the `:through` option.

```coffee
class Person extends ActiveRecord
  hasMany :readings
  hasMany :posts, through: :readings

person = Person.create(name: 'John')
post   = Post.create(name: 'a1')
person.posts << post
person.posts << post
person.posts.inspect # => [#<Post id: 5, name: "a1">, #<Post id: 5, name: "a1">]
Reading.all.inspect  # => [#<Reading id: 12, person_id: 5, post_id: 5>, #<Reading id: 13, person_id: 5, post_id: 5>]
```

In the above case there are two readings and `person.posts` brings out both of
them even though these records are pointing to the same post.

Now let's set `distinct`:

```coffee
class Person
  hasMany :readings
  hasMany :posts, -> { distinct }, through: :readings

person = Person.create(name: 'Honda')
post   = Post.create(name: 'a1')
person.posts << post
person.posts << post
person.posts.inspect # => [#<Post id: 7, name: "a1">]
Reading.all.inspect  # => [#<Reading id: 16, person_id: 7, post_id: 7>, #<Reading id: 17, person_id: 7, post_id: 7>]
```

In the above case there are still two readings. However `person.posts` shows
only one post because the collection loads only unique records.

If you want to make sure that, upon insertion, all of the records in the
persisted association are distinct (so that you can be sure that when you
inspect the association that you will never find duplicate records), you should
add a unique index on the table itself. For example, if you have a table named
`person_posts` and you want to make sure all the posts are unique, you could
add the following in a migration:

```coffee
add_index :person_posts, :post, unique: true
```

Note that checking for uniqueness using something like `include?` is subject
to race conditions. Do not attempt to use `include?` to enforce distinctness
in an association. For instance, using the post example from above, the
following code would be racy because multiple users could be attempting this
at the same time:

```coffee
person.posts << post unless person.posts.include?(post)
```

#### When are Objects Saved?

When you assign an object to a `hasMany` association, that object is automatically saved (in order to update its foreign key). If you assign multiple objects in one statement, then they are all saved.

If any of these saves fails due to validation errors, then the assignment statement returns `false` and the assignment itself is cancelled.

If the parent object (the one declaring the `hasMany` association) is unsaved (that is, `new_record?` returns `true`) then the child objects are not saved when they are added. All unsaved members of the association will automatically be saved when the parent is saved.

If you want to assign an object to a `hasMany` association without saving the object, use the `collection.build` method.

### `belongsToMany` Association Reference

The `belongsToMany` association creates a many-to-many relationship with another model. In database terms, this associates two classes via an intermediate join table that includes foreign keys referring to each of the classes.

#### Methods Added by `belongsToMany`

When you declare a `belongsToMany` association, the declaring class automatically gains 13 methods related to the association:

* `collection(force_reload = false)`
* `collection<<(object, ...)`
* `collection.delete(object, ...)`
* `collection.destroy(object, ...)`
* `collection=objects`
* `collection_singular_ids`
* `collection_singular_ids=ids`
* `collection.clear`
* `collection.empty?`
* `collection.size`
* `collection.find(...)`
* `collection.where(...)`
* `collection.exists?(...)`
* `collection.build(attributes = {})`
* `collection.create(attributes = {})`
* `collection.create!(attributes = {})`

In all of these methods, `collection` is replaced with the symbol passed as the first argument to `belongsToMany`, and `collection_singular` is replaced with the singularized version of that symbol. For example, given the declaration:

```coffee
class Part extends ActiveRecord
  belongsToMany :assemblies
```

Each instance of the part model will have these methods:

```coffee
assemblies(force_reload = false)
assemblies<<(object, ...)
assemblies.delete(object, ...)
assemblies.destroy(object, ...)
assemblies=objects
assembly_ids
assembly_ids=ids
assemblies.clear
assemblies.empty?
assemblies.size
assemblies.find(...)
assemblies.where(...)
assemblies.exists?(...)
assemblies.build(attributes = {}, ...)
assemblies.create(attributes = {})
assemblies.create!(attributes = {})
```

##### Additional Column Methods

If the join table for a `belongsToMany` association has additional columns beyond the two foreign keys, these columns will be added as attributes to records retrieved via that association. Records returned with additional attributes will always be read-only, because Rails cannot save changes to those attributes.

WARNING: The use of extra attributes on the join table in a `belongsToMany` association is deprecated. If you require this sort of complex behavior on the table that joins two models in a many-to-many relationship, you should use a `hasMany, through` association instead of `belongsToMany`.


##### `collection(force_reload = false)`

The `collection` method returns an array of all of the associated objects. If there are no associated objects, it returns an empty array.

```coffee
@assemblies = @part.assemblies
```

##### `collection<<(object, ...)`

The `collection<<` method adds one or more objects to the collection by creating records in the join table.

```coffee
@part.assemblies << @assembly1
```

NOTE: This method is aliased as `collection.concat` and `collection.push`.

##### `collection.delete(object, ...)`

The `collection.delete` method removes one or more objects from the collection by deleting records in the join table. This does not destroy the objects.

```coffee
@part.assemblies.delete(@assembly1)
```

WARNING: This does not trigger callbacks on the join records.

##### `collection.destroy(object, ...)`

The `collection.destroy` method removes one or more objects from the collection by running `destroy` on each record in the join table, including running callbacks. This does not destroy the objects.

```coffee
@part.assemblies.destroy(@assembly1)
```

##### `collection=objects`

The `collection=` method makes the collection contain only the supplied objects, by adding and deleting as appropriate.

##### `collection_singular_ids`

The `collection_singular_ids` method returns an array of the ids of the objects in the collection.

```coffee
@assembly_ids = @part.assembly_ids
```

##### `collection_singular_ids=ids`

The `collection_singular_ids=` method makes the collection contain only the objects identified by the supplied primary key values, by adding and deleting as appropriate.

##### `collection.clear`

The `collection.clear` method removes every object from the collection by deleting the rows from the joining table. This does not destroy the associated objects.

##### `collection.empty?`

The `collection.empty?` method returns `true` if the collection does not contain any associated objects.

```coffee
<% if @part.assemblies.empty? %>
  This part is not used in any assemblies
<% end %>
```

##### `collection.size`

The `collection.size` method returns the number of objects in the collection.

```coffee
@assembly_count = @part.assemblies.size
```

##### `collection.find(...)`

The `collection.find` method finds objects within the collection. It uses the same syntax and options as `ActiveRecord::Base.find`. It also adds the additional condition that the object must be in the collection.

```coffee
@assembly = @part.assemblies.find(1)
```

##### `collection.where(...)`

The `collection.where` method finds objects within the collection based on the conditions supplied but the objects are loaded lazily meaning that the database is queried only when the object(s) are accessed. It also adds the additional condition that the object must be in the collection.

```coffee
@new_assemblies = @part.assemblies.where("created_at > ?", 2.days.ago)
```

##### `collection.exists?(...)`

The `collection.exists?` method checks whether an object meeting the supplied conditions exists in the collection. It uses the same syntax and options as `ActiveRecord::Base.exists?`.

##### `collection.build(attributes = {})`

The `collection.build` method returns a new object of the associated type. This object will be instantiated from the passed attributes, and the link through the join table will be created, but the associated object will _not_ yet be saved.

```coffee
@assembly = @part.assemblies.build({assembly_name: "Transmission housing"})
```

##### `collection.create(attributes = {})`

The `collection.create` method returns a new object of the associated type. This object will be instantiated from the passed attributes, the link through the join table will be created, and, once it passes all of the validations specified on the associated model, the associated object _will_ be saved.

```coffee
@assembly = @part.assemblies.create({assembly_name: "Transmission housing"})
```

##### `collection.create!(attributes = {})`

Does the same as `collection.create`, but raises `ActiveRecord::RecordInvalid` if the record is invalid.

#### Options for `belongsToMany`

While Rails uses intelligent defaults that will work well in most situations, there may be times when you want to customize the behavior of the `belongsToMany` association reference. Such customizations can easily be accomplished by passing options when you create the association. For example, this association uses two such options:

```coffee
class Parts extends ActiveRecord
  belongsToMany :assemblies, autosave: true,
                                       readonly: true
```

The `belongsToMany` association supports these options:

* `otherKey`
* `autosave`
* `:class_name`
* `:foreignKey`
* `joinTable`
* `:validate`
* `:readonly`

##### `otherKey`

By convention, Rails assumes that the column in the join table used to hold the foreign key pointing to the other model is the name of that model with the suffix `_id` added. The `otherKey` option lets you set the name of the foreign key directly:

TIP: The `:foreignKey` and `otherKey` options are useful when setting up a many-to-many self-join. For example:

```coffee
class User extends ActiveRecord
  friends: ->
    @belongsToMany User, {
      foreignKey: "this_user_id",
      otherKey: "other_user_id"
    }
```

##### `autosave`

If you set the `autosave` option to `true`, Rails will save any loaded members and destroy members that are marked for destruction whenever you save the parent object.

##### `:class_name`

If the name of the other model cannot be derived from the association name, you can use the `:class_name` option to supply the model name. For example, if a part has many assemblies, but the actual name of the model containing assemblies is `Gadget`, you'd set things up this way:

```coffee
class Parts extends ActiveRecord
  belongsToMany :assemblies, class_name: "Gadget"
```

##### `:foreignKey`

By convention, we assume that the column in the join table used to hold the foreign key pointing to this model is the name of this model with the suffix `_id` added. The `foreignKey` option lets you set the name of the foreign key directly:

```coffee
class User extends ActiveRecord

  friends: ->
    @belongsToMany User, {
      foreignKey: 'this_user_id',
      associationForeignKey: 'other_user_id'
    }
```

##### `joinTable`

If the default name of the join table, based on lexical ordering, is not what you want, you can use the `joinTable` option to override the default.

##### `:validate`

If you set the `:validate` option to `false`, then associated objects will not be validated whenever you save this object. By default, this is `true`: associated objects will be validated when this object is saved.

#### Scopes for `belongsToMany`

There may be times when you wish to customize the query used by `belongsToMany`. Such customizations can be achieved via a scope block. For example:

```coffee
class Parts extends ActiveRecord
  belongsToMany :assemblies, -> { where active: true }
```

You can use any of the standard [querying methods](active_record_querying.html) inside the scope block. The following ones are discussed below:

* `where`
* `extending`
* `group`
* `includes`
* `limit`
* `offset`
* `order`
* `readonly`
* `select`
* `uniq`

##### `where`

The `where` method lets you specify the conditions that the associated object must meet.

```coffee
class Parts extends ActiveRecord
  belongsToMany :assemblies,
    -> { where "factory = 'Seattle'" }
```

You can also set conditions via a hash:

```coffee
class Parts extends ActiveRecord
  belongsToMany :assemblies,
    -> { where factory: 'Seattle' }
```

If you use a hash-style `where`, then record creation via this association will be automatically scoped using the hash. In this case, using `@parts.assemblies.create` or `@parts.assemblies.build` will create orders where the `factory` column has the value "Seattle".

##### `extending`

The `extending` method specifies a named module to extend the association proxy. Association extensions are discussed in detail <a href="#association-extensions">later in this guide</a>.

##### `group`

The `group` method supplies an attribute name to group the result set by, using a `GROUP BY` clause in the finder SQL.

```coffee
class Parts extends ActiveRecord
  belongsToMany :assemblies, -> { group "factory" }
```

##### `includes`

You can use the `includes` method to specify second-order associations that should be eager-loaded when this association is used.

##### `limit`

The `limit` method lets you restrict the total number of objects that will be fetched through an association.

```coffee
class Parts extends ActiveRecord
  belongsToMany :assemblies,
    -> { order("created_at DESC").limit(50) }
```

##### `offset`

The `offset` method lets you specify the starting offset for fetching objects via an association. For example, if you set `offset(11)`, it will skip the first 11 records.

##### `order`

The `order` method dictates the order in which associated objects will be received (in the syntax used by an SQL `ORDER BY` clause).

```coffee
class Parts extends ActiveRecord
  belongsToMany :assemblies,
    -> { order "assembly_name ASC" }
```

##### `readonly`

If you use the `readonly` method, then the associated objects will be read-only when retrieved via the association.

##### `select`

The `select` method lets you override the SQL `SELECT` clause that is used to retrieve data about the associated objects. By default, Rails retrieves all columns.

##### `uniq`

Use the `uniq` method to remove duplicates from the collection.

#### When are Objects Saved?

When you assign an object to a `belongsToMany` association, that object is automatically saved (in order to update the join table). If you assign multiple objects in one statement, then they are all saved.

If any of these saves fails due to validation errors, then the assignment statement returns `false` and the assignment itself is cancelled.

If the parent object (the one declaring the `belongsToMany` association) is unsaved (that is, `new_record?` returns `true`) then the child objects are not saved when they are added. All unsaved members of the association will automatically be saved when the parent is saved.

If you want to assign an object to a `belongsToMany` association without saving the object, use the `collection.build` method.

### Association Callbacks

Normal callbacks hook into the life cycle of Active Record objects, allowing you to work with those objects at various points. For example, you can use a `:before_save` callback to cause something to happen just before an object is saved.

Association callbacks are similar to normal callbacks, but they are triggered by events in the life cycle of a collection. There are four available association callbacks:

* `before_add`
* `after_add`
* `before_remove`
* `after_remove`

You define association callbacks by adding options to the association declaration. For example:

```coffee
class Customer extends ActiveRecord
  hasMany :orders, before_add: :check_credit_limit

  def check_credit_limit(order)
    ...
  end
```

Rails passes the object being added or removed to the callback.

You can stack callbacks on a single event by passing them as an array:

```coffee
class Customer extends ActiveRecord
  hasMany :orders,
    before_add: [:check_credit_limit, :calculate_shipping_charges]

  def check_credit_limit(order)
    ...

    def calculate_shipping_charges(order)
    ...
  end
```

If a `before_add` callback throws an exception, the object does not get added to the collection. Similarly, if a `before_remove` callback throws an exception, the object does not get removed from the collection.

### Association Extensions

You're not limited to the functionality that Rails automatically builds into association proxy objects. You can also extend these objects through anonymous modules, adding new finders, creators, or other methods. For example:

```coffee
class Customer extends ActiveRecord
  hasMany :orders do
    def find_by_order_prefix(order_number)
      find_by(region_id: order_number[0..2])
```

If you have an extension that should be shared by many associations, you can use a named extension module. For example:

```coffee
module FindRecentExtension
  def find_recent
    where("created_at > ?", 5.days.ago)
  end

class Customer extends ActiveRecord
  hasMany :orders, -> { extending FindRecentExtension }

class Supplier extends ActiveRecord
  hasMany :deliveries, -> { extending FindRecentExtension }
```

Extensions can refer to the internals of the association proxy using these three attributes of the `proxy_association` accessor:

* `proxy_association.owner` returns the object that the association is a part of.
* `proxy_association.reflection` returns the reflection object that describes the association.
* `proxy_association.target` returns the associated object for `belongsTo` or `hasOne`, or the collection of associated objects for `hasMany` or `belongsToMany`.