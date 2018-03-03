You sometimes need to manipulate data from the database into the correct types.
Maybe you have a TEXT field that is actually a comma separated list of tags, or a blob field with JSON that you want to
parse.

This can be done with the model's {@link Model#parse parse} and {@link Model#format format}
methods:

    Book = bookshelf.Model.extend({
      tableName: 'books',
      parse: function(response) {
        response.tags = JSON.parse(response.tags || '[]');
        return response;
      },
      format: function(attributes) {
        attributes.tags = JSON.stringify(attributes.tags || []);
        return attributes;
      }
    });

A very common use case for this is converting camelCase attributes to snake_case column names and vice-versa:

    Book = bookshelf.Model.extend({
      tableName: 'books',
      parse: function(response) {
        return _.mapKeys(response, function(value, key) {
          return _.camelCase(key);
        });
      },
      format: function(attributes) {
        return _.mapKeys(attributes, function(value, key) {
          return _.snakeCase(key);
        });
      }
    });
