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

    describe('Model#processors', function() {
      it('is false by default', function() {
        expect(new User().processors).to.be.false;
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
        var OtherUser = User.extend({
          processors: {
            username: lowerCaseProcessor
          }
        });
        var otherUser = new OtherUser().set('username', 'TesT');

        expect(otherUser.get('username')).to.match(/test/);
      })

      it('can accept an object with attributes to process', function() {
        var OtherUser = User.extend({
          processors: {
            username: lowerCaseProcessor
          }
        });
        var otherUser = new OtherUser().set({username: 'TesT'});

        expect(otherUser.get('username')).to.match(/test/);
      })

      it('can process an attribute with multiple processors', function() {
        var OtherUser = User.extend({
          processors: {
            username: [lowerCaseProcessor, trimProcessor]
          }
        });
        var otherUser = new OtherUser().set('username', 'TesT   ');

        expect(otherUser.get('username')).to.match(/test$/);
      })

      it('doesn\'t do any processing if no processors are specified', function() {
        var OtherUser = User.extend({
          processors: {
            bogus: [lowerCaseProcessor]
          }
        });
        var otherUser = new OtherUser().set('username', 'TesT');

        expect(otherUser.get('username')).to.match(/TesT/);
      })

      it('can use an anonymous processor function', function() {
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
