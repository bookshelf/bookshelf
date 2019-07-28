With polymorphic associations, a model can belong to more than one other model, on a single association. For example,
you might have a photo model that belongs to either a `Site` model or a `Post` model. Here’s how this could be declared:

```js
const Site = bookshelf.model('Site', {
  tableName: 'sites',
  photo() {
    return this.morphOne('Photo', 'imageable')
  }
})

const Post = bookshelf.model('Post', {
  tableName: 'posts',
  photos() {
    return this.morphMany('Photo', 'imageable')
  }
})

const Photo = bookshelf.model('Photo', {
  tableName: 'photos',
  imageable() {
    return this.morphTo('imageable', 'Site', 'Post')
  }
})
```

Optionally, if you wish to use column names other than the `name` suffixed with `_type` and `_id` (for example, if you
use a different naming convention in your database), you may specify custom `columnNames`. This argument, when
specified, expects an array containing the substitute `_type` and `_id` columns, respectively.

Note that any custom `columnNames` must be specified on both ends of the relationship! Examples are provided for each of
the polymorphic relationship types individually.
