define(function () {

  // Todo Model
  // ----------

  // Our basic **Todo** model has `title`, `order`, and `completed` attributes.
  exports.Todo = Backbone.Model.extend({

    // Default attributes for the todo
    // and ensure that each todo created has `title` and `completed` keys.
    defaults: {
      title: '',
      completed: false
    },

    // Toggle the `completed` state of this todo item.
    toggle: function() {
      this.save({
        completed: !this.get('completed')
      });
    }
  });

  // Todo Collection
  // ---------------

  exports.TodoList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: exports.Todo,

    // Filter down the list of all todo items that are finished.
    completed: function() {
      return this.filter(function(todo) {
        return todo.get('completed');
      });
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.completed());
    },

    // Todos are sorted by their original insertion order.
    comparator: function(todo) {
      return todo.get('order');
    }
  });

  // Create our global collection of **Todos**.
  exports.Todos = new TodoList();

});