You sometimes need to manipulate data from the database into the correct types.
Maybe you have a TEXT field that is actually a comma seperated list of tags,
or a blob field with json that you want to parse.

This can be done with a models {@link Model#parse parse} and {@link Model#format format}
methods.

    Book = bookshelf.Model.extend({
      tableName: 'books',
      parse: function (response) {
          response.tags = JSON.parse(response.tags || '[]');
          return response;
      },
      format: function (attributes) {
          attributes.tags = JSON.stringify(attributes.tags || []);
          return attributes;
      }
    });
