module.exports = function(bookshelf) {
  describe('Processor Plugin', function () {
    var User;

    function lowerCaseProcessor(string) {
      return string.toLowerCase();
    }

    function trimProcessor(string) {
      return string.trim();
    }

    before(function() {
      bookshelf.plugin('processor');
      User = require('../helpers/objects')(bookshelf).Models.User
    })

    beforeEach(function() {
      bookshelf.removeAllProcessors()
    })

    it('adds a Bookshelf#addProcessor() method', function() {
      expect(bookshelf).to.respondTo('addProcessor');
    })

    it('adds a Model#processAttribute() method', function() {
      expect(new User()).to.respondTo('processAttribute');
    })

    it('adds a Bookshelf#removeProcessor() method', function() {
      expect(bookshelf).to.respondTo('removeProcessor');
    })

    it('adds a Model#removeAllProcessors() method', function() {
      expect(bookshelf).to.respondTo('removeAllProcessors');
    })

    describe('Bookshelf#addProcessor()', function() {
      it('adds a custom processor to a Bookshelf instance', function() {
        var OtherUser = User.extend({
          processors: {
            username: 'lowercase'
          }
        });

        function setUsername() {
          new OtherUser().set('username', 'test');
        }

        bookshelf.addProcessor('lowercase', lowerCaseProcessor);

        expect(setUsername).to.not.throw();
      })

      it('throws an error if the first argument is not a string', function() {
        function badAdd() {
          bookshelf.addProcessor(['name']);
        }

        expect(badAdd).to.throw();
      })

      it('throws an error if the first argument is an empty string', function() {
        function badAdd() {
          bookshelf.addProcessor('');
        }

        expect(badAdd).to.throw();
      })

      it('throws an error if the second argument is not a function', function() {
        function badAdd() {
          bookshelf.addProcessor('name', 'this ain\'t right');
        }

        expect(badAdd).to.throw();
      })
    })

    describe('Bookshelf#removeProcessor()', function() {
      it('can remove an already added processor', function() {
        var OtherUser = User.extend({
          processors: {
            username: 'lowercase'
          }
        });

        function setUsername() {
          new OtherUser().set('username', 'test');
        }

        bookshelf.addProcessor('lowercase', lowerCaseProcessor);
        expect(setUsername).to.not.throw();

        bookshelf.removeProcessor('lowercase');
        expect(setUsername).to.throw();
      })

      it('can remove a list of already added processors', function() {
        var OtherUser = User.extend({
          processors: {
            username: 'lowercase'
          }
        });

        function setUsername() {
          new OtherUser().set('username', 'test');
        }

        bookshelf.addProcessor('lowercase', lowerCaseProcessor);
        expect(setUsername).to.not.throw();

        bookshelf.removeProcessor(['lowercase']);
        expect(setUsername).to.throw();
      })
    })

    describe('Bookshelf#removeAllProcessors()', function() {
      it('can remove all processors at once', function() {
        bookshelf.addProcessor('lowercase', lowerCaseProcessor);
        bookshelf.addProcessor('trim', trimProcessor);

        var OtherUser = User.extend({
          processors: {
            username: ['lowercase', 'trim']
          }
        });

        function setUsername() {
          new OtherUser().set('username', 'test');
        }

        expect(setUsername).to.not.throw();
        bookshelf.removeAllProcessors();
        expect(setUsername).to.throw();
      })
    })

    describe('Model#set()', function() {
      it('throws an error if the specified processor doesn\'t exist', function() {
        var OtherUser = User.extend({
          processors: {
            username: 'nothingHere'
          }
        });

        function setUsername() {
          new OtherUser().set('username', 'test');
        }

        expect(setUsername).to.throw();
      })

      it('processes the set attribute with the correct processor', function() {
        bookshelf.addProcessor('lowercase', lowerCaseProcessor);

        var OtherUser = User.extend({
          processors: {
            username: 'lowercase'
          }
        });
        var otherUser = new OtherUser().set('username', 'TesT');

        expect(otherUser.get('username')).to.match(/test/);
      })

      it('can accept an object with attributes to process', function() {
        bookshelf.addProcessor('lowercase', lowerCaseProcessor);

        var OtherUser = User.extend({
          processors: {
            username: 'lowercase'
          }
        });
        var otherUser = new OtherUser().set({username: 'TesT'});

        expect(otherUser.get('username')).to.match(/test/);
      })

      it('can process an attribute with multiple processors', function() {
        bookshelf.addProcessor('lowercase', lowerCaseProcessor);
        bookshelf.addProcessor('trim', trimProcessor);

        var OtherUser = User.extend({
          processors: {
            username: ['lowercase', 'trim']
          }
        });
        var otherUser = new OtherUser().set('username', 'TesT   ');

        expect(otherUser.get('username')).to.match(/test$/);
      })

      it('doesn\'t do any processing if no processors are specified', function() {
        bookshelf.addProcessor('lowercase', lowerCaseProcessor);
        bookshelf.addProcessor('trim', trimProcessor);

        var OtherUser = User.extend({
          processors: {
            bogus: ['lowercase']
          }
        });
        var otherUser = new OtherUser().set('username', 'TesT');

        expect(otherUser.get('username')).to.match(/TesT/);
      })

      it('can use a custom processor function', function() {
        var OtherUser = User.extend({
          processors: {
            username: function(string) {
              return string + '_custom';
            }
          }
        });
        var otherUser = new OtherUser().set('username', 'TesT');

        expect(otherUser.get('username')).to.match(/_custom$/);
      })
    })
  })
}
