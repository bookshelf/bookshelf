Events allow you to tap into the life cycle of a query request and perform actions before and after the query is
executed. This can be used for adding validation before saving a model, hashing a password or calling some external
process after a model is saved.

The way this is done is by attaching event handlers to a model that will listen for these events. If the event
handlers return Promises, the handlers will wait for the Promise to be resolved or rejected before progressing. If
the promise is rejected, the process will be interrupted.

### Listening to events

In order to attach an event listener to a model you can do it in the {@link Model#initialize Model's initialize}
method like so:

```js
const User = bookshelf.model('User', {
  tableName: 'users',

  initialize() {
    this.on('updated', (model) => {
      // This is fired after a model is updated
    })
  }
})
```

You can attach multiple event listeners for the same event by calling the {@link Model#on on} method multiple times
and the listeners will run sequentially.

### Available save events

The available {@link Model model} save related events are:

- {@link Model#event:saving saving}
- {@link Model#event:creating creating}
- {@link Model#event:updating updating}
- {@link Model#event:created created}
- {@link Model#event:updated updated}
- {@link Model#event:saved saved}

They are fired in this order and it's possible to prevent the request from advancing further by throwing an error or
returning a rejected Promise from any one of these event listeners, e.g.:

```js
const User = bookshelf.model('User', {
  tableName: 'users',

  initialize() {
    this.on('saving', (model) => {
      if (model.get('status') !== 'active') {
        // Throwing an error will prevent the model from being saved
        throw new Error('Cannot save inactive user')
      }
    })

    this.on('saved', (model) => {
      // This won't be reached if the previous event threw an error
    })
  }
})
```

This feature can be used to perform validation before saving a model. For example, checking if an email address
already exists and preventing the model from being saved if it does:

```js
const User = bookshelf.model('User', {
  tableName: 'users',

  initialize() {
    this.on('saving', (model) => {
      return User.forge({email: model.get('email')}).fetch().then((user) => {
        if (user) throw new Error('That email address already exists')
      })
    })
  }
})
```

### Available fetch related events

The available {@link Model model} data retrieval related events are:

- {@link Model#event:fetching fetching}
- {@link Model#fetching:collection fetching:collection}
- {@link Model#event:counting counting}
- {@link Model#event:fetched fetched}
- {@link Model#fetched:collection fetched:collection}

### Available destroy related events

The available {@link Model model} destruction related events are:

- {@link Model#event:destroying destroying}
- {@link Model#event:destroyed destroyed}

Note that you can get the model's previous attributes after it's destroyed by calling the
{@link Model#previousAttributes previousAttributes} method:

```js
const User = bookshelf.model('User', {
  tableName: 'users',

  initialize() {
    this.on('destroyed', (model) => {
      const previousAttributes = JSON.stringify(model.previousAttributes())
      log(`Destroyed model with attributes: ${previousAttributes}`)
    })
  }
})
```
