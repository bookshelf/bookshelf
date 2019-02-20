Models are the backbone of Bookshelf. They encapsulate most of the functionality that you'll need to work with your
data.

## Creating your own Models

To create your models you {@link Model.extend extend} them from {@link Model bookshelf.Model} and add any methods and
relations that are needed. The first argument to `extend()` should be an object with the instance methods and properties
you want to set on your model, and the second argument is only used if you want to add static methods and properties.

The following example sets up a new model that could be used to manage customer sessions on a website.

```js
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt'))
const Account = require('./account')

// Defining our Customer model
var Customer = bookshelf.Model.extend({
  // Instance properties and methods are defined here
  tableName: 'customers',

  account() {
    // This establishes a relation with the Account model
    return this.belongsTo(Account)
  }
}, {
  // Static class properties and methods
  login: Promise.method((email, password) => {
    return new this({email})
      .fetch({require: true})
      .tap((customer) => {
        return bcrypt.compareAsync(password, customer.get('password'))
          .then((valid) => {
            if (!valid) throw new Error('Invalid password')
          })
      })
  })
})
```

This model could then be used in a controller to login the customer like this:

```js
Customer.login(email, password).then((customer) => {
  res.json(customer)
}).catch(Customer.NotFoundError, () => {
  res.json(400, {error: email + ' not found'})
}).catch((error) => {
  console.error(error)
})
```

Note that this would return the entire `customer` object including the password. This is usually not desirable, so in
actual production applications you should use the
[visibility plugin](https://github.com/bookshelf/bookshelf/wiki/Plugin:-Visibility) to hide certain attributes when
serializing the model.

### Validation

There is no built-in way to validate your models before saving them to the database. However you can use any third-party
validation library and it should be relatively easy to integrate. Here's an example using
[checkit](https://github.com/tgriesser/checkit):

```js
const checkit = require('checkit')

const Customer = bookshelf.Model.extend({
  initialize() {
    this.constructor.__super__.initialize.apply(this, arguments)
    this.on('saving', this.validateSave)
  },

  validateSave() {
    return checkit(rules).run(this.attributes)
  }
})
```

### Events

There are several events fired by models at different stages of the query request process. For more information about
this see the {@tutorial events} guide.

**Note**: This section of the documentation is still a WIP. For more in-depth information about models check out the
{@link Model API Reference}.
