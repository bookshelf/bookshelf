You sometimes need to manipulate data from the database into the correct types.
Maybe you have a TEXT field that is actually a comma separated list of tags, or a blob field with JSON that you want to
parse.

This can be done with the model's {@link Model#parse parse} and {@link Model#format format}
methods:

```js
const Book = bookshelf.model('Book', {
  tableName: 'books',
  parse(response) {
    if (response.tags) response.tags = JSON.parse(response.tags)
    return response
  },
  format(attributes) {
    if (attributes.tags) attributes.tags = JSON.stringify(attributes.tags)
    return attributes;
  }
})
```

A very common use case for this is converting camelCase attributes to snake_case column names and vice-versa:

```js
const Book = bookshelf.model('Book', {
  tableName: 'books',
  parse(response) {
    return _.mapKeys(response, (value, key) => _.camelCase(key))
  },
  format(attributes) {
    return _.mapKeys(attributes, (value, key) => _.snakeCase(key))
  }
})
```
