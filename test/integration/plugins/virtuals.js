var _         = require('lodash');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;
var expect    = require('chai').expect;

module.exports = function(bookshelf) {
  describe('Virtuals Plugin', function() {
    before(function() {
      bookshelf.plugin('virtuals');
    });

    it('can create virtual properties on the model', function() {
      var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});

      equal(m.fullName, 'Joe Shmoe');
    });

    it('can create virtual properties with getter and setter', function() {
      var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: {
            get: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
            },
            set: function(value) {
              value = value.split(' ');
              this.set('firstName', value[0]);
              this.set('lastName', value[1]);
            }
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});

      equal(m.fullName, 'Joe Shmoe');
      m.fullName = 'Jack Shmoe';

      equal(m.fullName, 'Jack Shmoe');
      equal(m.get('firstName'), 'Jack');
      equal(m.get('lastName'), 'Shmoe');
    });

    it('can access parameterized virtual properties on the model', function() {
      var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: function(middleName) {
            if (!middleName) return this.get('firstName') + ' ' + this.get('lastName');
            return this.get('firstName') + ' ' + middleName + ' ' + this.get('lastName');
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});

      equal(m.fullName, 'Joe Shmoe');
    });

    it('can set virtual properties in the constructor', function() {
      var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: {
            get: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
            },
            set: function(value) {
              value = value.split(' ');
              this.set('firstName', value[0]);
              this.set('lastName', value[1]);
            }
          }
        }
      }))({fullName: 'Peter Griffin', dogName:'Brian'});

      equal(m.get('firstName'), 'Peter');
      equal(m.get('lastName'), 'Griffin');
      equal(m.get('dogName'), 'Brian');
    });

    it('can set virtual properties in the constructor without setting an actual model attribute', function() {
      var m = new (bookshelf.Model.extend({
        virtuals: {
          fullName: {
            get: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
            },
            set: function(value) {
              value = value.split(' ');
              this.set('firstName', value[0]);
              this.set('lastName', value[1]);
            }
          }
        }
      }))({fullName: 'Peter Griffin'});

      equal(m.attributes['fullName'], undefined);
    });

    describe('Model#get()', function() {
      it('can access parameterized virtual properties with getter and setter', function() {
        var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: {
              get: function(middleName) {
                if (!middleName) return this.get('firstName') + ' ' + this.get('lastName');
                return this.get('firstName') + ' ' + middleName + ' ' + this.get('lastName');
              },
              set: function(value) {
                value = value.split(' ');
                this.set('firstName', value[0]);
                this.set('lastName', value[1]);
              }
            }
          }
        }))({firstName: 'Joe', lastName: 'Shmoe'});

        equal(m.get('fullName', 'Trouble'), 'Joe Trouble Shmoe');
      });

      it('can access parameterized virtual properties that accept multiple arguments', function() {
        var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: function(param1, param2) {
              return this.get('firstName') + ' ' + param1 + ' ' + param2;
            }
          }
        }))({firstName: 'Joe', lastName: 'Shmoe'});

        equal(m.get('fullName', 'Danger', 'Explosion'), 'Joe Danger Explosion');
      });

      it('can access parameterized virtual properties with getter and setter without passing an argument', function () {
        var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: {
              get: function(middleName) {
                if (!middleName) return this.get('firstName') + ' ' + this.get('lastName');
                return this.get('firstName') + ' ' + middleName + ' ' + this.get('lastName');
              },
              set: function(value) {
                value = value.split(' ');
                this.set('firstName', value[0]);
                this.set('lastName', value[1]);
              }
            }
          }
        }))({firstName: 'Joe', lastName: 'Shmoe'});

        equal(m.get('fullName'), 'Joe Shmoe');
      });
    });

    describe('Model#set()', function() {
      it('can set virtual properties by passing two argument strings', function() {
        var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: {
              get: function() {
                return this.get('firstName') + ' ' + this.get('lastName');
              },
              set: function(value) {
                value = value.split(' ');
                this.set('firstName', value[0]);
                this.set('lastName', value[1]);
              }
            }
          }
        }))();

        m.set('fullName', 'Jack Shmoe');

        equal(m.get('firstName'), 'Jack');
        equal(m.get('lastName'), 'Shmoe');
      });

      it('can set virtual properties by passing an object with values', function() {
        var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: {
              get: function() {
                return this.get('firstName') + ' ' + this.get('lastName');
              },
              set: function(value) {
                value = value.split(' ');
                this.set('firstName', value[0]);
                this.set('lastName', value[1]);
              }
            }
          }
        }))();

        m.set({fullName: 'Peter Griffin', dogName: 'Brian'});

        equal(m.get('firstName'), 'Peter');
        equal(m.get('lastName'), 'Griffin');
        equal(m.get('dogName'), 'Brian');
      });

      it('does not set actual attribute on model when setting virtual with two argument strings', function() {
        var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: {
              get: function() {
                return this.get('firstName') + ' ' + this.get('lastName');
              },
              set: function(value) {
                value = value.split(' ');
                this.set('firstName', value[0]);
                this.set('lastName', value[1]);
              }
            }
          }
        }))();

        m.set('fullName', 'Jack Shmoe');

        equal(m.attributes['fullName'], undefined);
      });

      it('does not set actual attribute on model when setting virtual with object', function() {
        var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: {
              get: function() {
                return this.get('firstName') + ' ' + this.get('lastName');
              },
              set: function(value) {
                value = value.split(' ');
                this.set('firstName', value[0]);
                this.set('lastName', value[1]);
              }
            }
          }
        }))();

        m.set({fullName: 'Jack Shmoe'});

        equal(m.attributes['fullName'], undefined);
      });

      it('defaults virtual properties with no setter to a noop', function() {
         var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
            }
          }
        }))();

        m.set('fullName', 'John Doe');

        expect(m.attributes.fullName).to.be.undefined;
      });

      it('does not crash when no virtuals are set - #168', function() {
        var m = new bookshelf.Model();
        m.set('firstName', 'Joe');
        equal(m.get('firstName'), 'Joe');
      });
    });

    describe('Model#toJSON()', function() {
      it('includes virtuals by default', function() {
        var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: function() {
                return this.get('firstName') + ' ' + this.get('lastName');
            },
            fullNameWithGetSet: {
              get: function() {
                return this.get('firstName') + ' ' + this.get('lastName');
              },
              set: function(value) {
                value = value.split(' ');
                this.set('firstName', value[0]);
                this.set('lastName', value[1]);
              }
            }
          }
        }))({firstName: 'Joe', lastName: 'Shmoe'});
        var json = m.toJSON();

        deepEqual(_.keys(json), ['firstName', 'lastName', 'fullName', 'fullNameWithGetSet']);
      });

      it('includes virtuals if `outputVirtuals` is true', function() {
        var m = new (bookshelf.Model.extend({
          outputVirtuals: true,
          virtuals: {
            fullName: function() {
                return this.get('firstName') + ' ' + this.get('lastName');
            },
            fullNameWithGetSet: {
              get: function() {
                return this.get('firstName') + ' ' + this.get('lastName');
              },
              set: function(value) {
                value = value.split(' ');
                this.set('firstName', value[0]);
                this.set('lastName', value[1]);
              }
            }
          }
        }))({firstName: 'Joe', lastName: 'Shmoe'});
        var json = m.toJSON();

        deepEqual(_.keys(json), ['firstName', 'lastName', 'fullName', 'fullNameWithGetSet']);
      });

      it('doesn\'t include virtuals if `outputVirtuals` is set to false', function() {
        var m = new (bookshelf.Model.extend({
          outputVirtuals: false,
          virtuals: {
            fullName: function() {
                return this.get('firstName') + ' ' + this.get('lastName');
            }
          }
        }))({firstName: 'Joe', lastName: 'Shmoe'});
        var json = m.toJSON();

        deepEqual(_.keys(json), ['firstName', 'lastName']);
      });

      it('includes virtuals if `outputVirtuals` is false but `virtuals: true` is set in the options', function() {
        var m = new (bookshelf.Model.extend({
          outputVirtuals: false,
          virtuals: {
            fullName: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
            }
          }
        }))({firstName: 'Joe', lastName: 'Shmoe'});
        var json = m.toJSON({virtuals: true});

        deepEqual(_.keys(json), ['firstName', 'lastName', 'fullName']);
      });

      it('doesn\'t include virtuals if `outputVirtuals` is true but `virtuals: false` is set in the options', function() {
        var m = new (bookshelf.Model.extend({
          outputVirtuals: true,
          virtuals: {
            fullName: function() {
                return this.get('firstName') + ' ' + this.get('lastName');
            }
          }
        }))({firstName: 'Joe', lastName: 'Shmoe'});
        var json = m.toJSON({virtuals: false});

        deepEqual(_.keys(json), ['firstName', 'lastName']);
      });

      it('doesn\'t include virtuals if `omitNew` is true even if `outputVirtuals` is true', function() {
        var m = new (bookshelf.Model.extend({
          outputVirtuals: true,
          virtuals: {
            fullName: function() {
              return this.get('firstName') + ' ' + this.get('lastName');
            }
          }
        }))({firstName: 'Joe', lastName: 'Schmoe'});
        var json = m.toJSON({omitNew: true});

        deepEqual(json, null);
      });

      it('includes virtuals with parameters', function() {
        var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: function(param) {
              return this.get('firstName') + ' ' + param;
            }
          }
        }))({firstName: 'Joe', lastName: 'Shmoe'});
        var json = m.toJSON({virtualParams: {fullName: 'Danger'}});

        deepEqual(_.keys(json), ['firstName', 'lastName', 'fullName']);
        equal(json.fullName, 'Joe Danger');
      });

      it('includes virtuals with array parameters', function() {
        var m = new (bookshelf.Model.extend({
          virtuals: {
            fullName: function(param) {
              return this.get('firstName') + ' ' + param.join(' ');
            }
          }
        }))({firstName: 'Joe', lastName: 'Shmoe'});
        var json = m.toJSON({virtualParams: {fullName: ['Danger', 'Mouse', 'Explosion']}});

        equal(json.fullName, 'Joe Danger Mouse Explosion');
      });
    })

    it('works fine with `underscore` methods - #170', function() {
       var m = new (bookshelf.Model.extend({
        outputVirtuals: true,
        virtuals: {
          fullName: function() {
            return this.get('firstName') + ' ' + this.get('lastName');
          }
        }
      }))({firstName: 'Joe', lastName: 'Shmoe'});

      deepEqual(m.keys(), ['firstName', 'lastName', 'fullName']);
      deepEqual(m.values(), ['Joe', 'Shmoe', 'Joe Shmoe']);
      deepEqual(m.toPairs(), [['firstName', 'Joe'], ['lastName', 'Shmoe'], ['fullName', 'Joe Shmoe']]);
      deepEqual(m.invert(), {'Joe': 'firstName', 'Shmoe': 'lastName','Joe Shmoe': 'fullName'});
      deepEqual(m.pick('fullName'), {'fullName': 'Joe Shmoe'});
      deepEqual(m.omit('firstName'), {'lastName': 'Shmoe', 'fullName': 'Joe Shmoe'});
    });

    describe('behaves correctly during a `patch` save - #542', function() {
      var generalExpect = function(result) {
        expect(result.get('site_id')).to.equal(2);
        expect(result.get('first_name')).to.equal('Oderus');
        expect(result.get('last_name')).to.equal('Urungus');
      };

      it('by using the `{key: value}` style assignment call', function() {
        var Model = bookshelf.Model.extend({
          tableName: 'authors',
          virtuals: {
            full_name: {
              set: function(fullName) {
                var names = fullName.split(' ');
                return this.set({
                  first_name: names[0],
                  last_name:  names[1]
                });
              },
              get: function() {
                return [this.get('first_name'), this.get('last_name')].join(' ');
              }
            }
          }
        });

        return new Model({site_id: 5}).save()
          .then(function(model) {
            return model.save({site_id: 2, full_name: 'Oderus Urungus'}, {patch: true})
          }).tap(generalExpect)
          .then(function(result) {
            return result.refresh();
          }).tap(generalExpect)
          .tap(function(result) {
            return result.destroy();
          });
      });

      it('by using the `"key", value` style assignment call', function() {
        var Model = bookshelf.Model.extend({
          tableName: 'authors',
          virtuals: {
            full_name: {
              set: function(fullName) {
                var names = fullName.split(' ');
                this.set('first_name', names[0]);
                this.set('last_name', names[1]);
                return this.get('full_name');
              },
              get: function() {
                return [this.get('first_name'), this.get('last_name')].join(' ');
              }
            }
          }
        });

        return new Model({site_id: 5}).save()
          .then(function(model) {
            return model.save({site_id: 2, full_name: 'Oderus Urungus'}, {patch: true})
          }).tap(generalExpect)
          .then(function(result) {
            return result.refresh();
          }).tap(generalExpect)
          .tap(function(result) {
            return result.destroy();
          });
      });
    });

    it('save should be rejected after `set` throws an exception during a `patch` operation', function() {
      var Model = bookshelf.Model.extend({
        tableName: 'authors',
        virtuals: {
          will_cause_error: {
            set: function(fullName) {
              throw new Error('Deliberately failing');
            },
            get: _.noop
          }
        }
      });

      return Model.forge({id: 4, first_name: 'Ned'})
        .save({will_cause_error: 'value'}, {patch: true})
        .catch(function(error) {
          expect(error.message).to.equal('Deliberately failing');
        })
    });
  });
};
