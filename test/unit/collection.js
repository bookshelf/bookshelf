
    describe('extend/constructor/initialize', function() {

      var Users = Bookshelf.Collection.extend({
        getData: function() { return 'test'; }
      }, {
        classMethod: function() { return 'test'; }
      });

      var SubUsers = Users.extend({
        otherMethod: function() { return this.getData(); }
      }, {
        classMethod2: function() { return 'test2'; }
      });

      it('can be extended', function() {
        var users = new Users();
        var subUsers = new SubUsers();
        equal(users.getData(), 'test');
        equal(subUsers.otherMethod(), 'test');
        equal(Users.classMethod(), 'test');
        equal(SubUsers.classMethod(), 'test');
        equal(SubUsers.classMethod2(), 'test2');
      });

      it('accepts a custom `constructor` property', function() {
        var Users = Bookshelf.Collection.extend({
          constructor: function() {
            this.item = 'test';
            Bookshelf.Collection.apply(this, arguments);
          }
        });
        equal(new Users().item, 'test');
      });

    });

    describe('forge', function() {

      it('should create a new collection instance', function() {
        var User = Bookshelf.Model.extend({
          tableName: 'users'
        });
        var Users = Bookshelf.Collection.extend({
          model: User
        });
        var users = Users.forge();
        equal(users.tableName(), 'users');
      });

    });

    describe('tableName', function() {

      it('returns the `tableName` attribute off the `Collection#model` prototype', function() {
        var collection = new (Bookshelf.Collection.extend({
          model: Bookshelf.Model.extend({
            tableName: 'test'
          })
        }))();
        equal(collection.tableName(), 'test');
      });
    });

    describe('idAttribute', function() {

      it('returns the `idAttribute` attribute from the `Collection#model` prototype', function() {
        var collection = new (Bookshelf.Collection.extend({
          model: Bookshelf.Model.extend({
            idAttribute: 'test'
          })
        }))();
        equal(collection.idAttribute(), 'test');
      });
    });


