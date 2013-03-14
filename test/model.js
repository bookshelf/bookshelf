
var Shelf, Bookshelf;
Shelf = Bookshelf = require('../bookshelf');

var _ = require('underscore');
var assert = require('assert');
var should = require('should');

describe('Bookshelf.Model', function () {
  
  var base;
  var Base = Bookshelf.Model.extend({
    tableName: 'authors'
  });

  beforeEach(function () {
    if (base) base.off();
    base = new Base();
  });

  describe('extend/constructor/initialize', function () {

    it('can be extended', function () {
      var User = Bookshelf.Model.extend({
        idAttribute: 'user_id',
        getData: function () {
          return 'test';
        }
      });
      var user = new User();
      user.idAttribute.should.equal('user_id');
      user.getData().should.equal('test');
    });

    it('takes a hash of attributes as the first argument in the constructor', function () {
      var test = new Bookshelf.Model({name: 'Tim'});
      test.get('name').should.equal('Tim');
    });

  });

  describe('id, idAttribute', function () {

    it('should attach the id as a property on the model', function () {
      var test = new Bookshelf.Model({id: 1});
      test.id.should.equal(1);
    });

    it('should reference idAttribute as the key for model.id', function () {
      var Test = Shelf.Model.extend({
        idAttribute: '_id'
      });
      var test2 = new Test({_id: 2});
      test2.id.should.equal(2);
    });

  });

  it('should use the same get function as the Backbone library', function () {
    var attached = ['get'];
    _.each(attached, function (item) {
      Bookshelf.Model.prototype[item].should.equal(Bookshelf.Backbone.Model.prototype[item]);
    });
  });

  describe('fillable, guarded', function () {
    var model;
    
    beforeEach(function(){
      var Model = Bookshelf.Model.extend({fillable: ['name', 'role'], guarded: ['role']});
      model = new Model();
    });
    afterEach(function () { model.off(); });

    it('is an array, with the list of whitelisted attributes', function () {
      _.isArray(model.fillable).should.eql(true);
    });

    it('should only allow the mass assignment of the specified items', function () {
      model.set({name: 'Tim', role: 'admin'});
      assert.deepEqual(model.toJSON(), {name: 'Tim'});
    });

    it('should override fillable with guarded', function () {
      model.set({name: 'Tim', role: 'user'});
      should.not.exist(model.get('role'));
    });

    it('assign guarded or protected items without mass assignment', function () {
      model.set({name: 'Tim', 'role': 'admin'});
      model.set('role', 'admin');
      model.get('role').should.eql('admin');
    });

    it('should trigger an inaccessible event on a guarded mass-assignment', function () {
      var output = [];
      model.on('inaccessible', function () { output = arguments; });
      model.set({name: 'Tim', role: 'admin'});
      output[0].should.equal(model);
      assert(_.isEqual(output[1], {role: 'admin'}));
    });

  });

  describe('query', function () {

    it('returns the Knex builder when no arguments are passed', function () {
      base.query().should.be.an.instanceOf(Bookshelf.Knex.Builder);
    });

    it('calls Knex builder method with the first argument, returning the model', function () {
      var q = base.query('where', {id:1});
      q.should.equal(base);
    });

    it('passes along additional arguments to the Knex method in the first argument', function () {
      var qb = base.query();
      qb.wheres.length.should.equal(0);
      var q = base.query('where', {id:1});
      q.should.equal(base);
      qb.wheres.length.should.equal(1);
    });

  });

  describe('tableName', function () {
    
    var table;
    
    beforeEach(function () {
      table = new Bookshelf.Model({}, {tableName: 'customers'});
    });

    it('can be passed in the initialize options', function () {
      table.tableName.should.eql('customers');
    });

    it('should set the tableName for the query builder', function () {
      var qb = table.query();
      qb.from().should.equal('customers');
    });

  });

  describe('toJSON', function () {

    it('includes the idAttribute in the hash', function () {
      var m = new (Bookshelf.Model.extend({
        idAttribute: '_id'
      }))({'_id': 1, 'name': 'Joe'});
      assert.deepEqual(m.toJSON(), {'_id': 1, 'name': 'Joe'});
    });

  });

  describe('fetch', function () {

    it('issues a first (get one) to Knex, returning a promise', function (done) {

      base.set({id: 1}).fetch().then(function () {
        assert.equal(base.get('first_name'), 'Tim');
        assert.equal(base.get('last_name'), 'Griesser');
        done();
      }, done);

    });

    it('accepts succeess & error options, similar to standard Backbone', function (done) {
      var count = 0;
      base.set({id: 1}).fetch({
        success: function () {
          count++;
        }
      }).then(function () {
        return new Base({id: 10}).fetch({
          error: function () {
            count++;
          }
        });
      }).then(function () {
        done(new Error('Err.'));
      }, function () {
        done();
      });
    });

    it('triggers an "emptyResponse" error event when no records are found on set or save', function (done) {
      base.set({id: 10});
      base.on('error', function (model, msg, options) { 
        assert.deepEqual(base, model);
        assert.equal("emptyResponse", msg);
        done();
      });
      base.fetch();
    });

  });

  describe('destroy', function () {

    it('issues a delete to the Knex, returning a promise');

  });

  describe('hasTimestamps', function () {

    it('will set the created_at and updated_at columns if true');

  });

  describe('hasChanged', function () {

    it('returns true if the model has changed since last being persisted');

  });

  describe('changed', function () {

    it('is a hash of any changed attributes');

  });


  describe('sync', function () {

    it('serves as a passthrough to Bookshelf.sync');

  });

  describe('validate', function () {
    
    var model;

    beforeEach(function () {
      model = new (Bookshelf.Model.extend({
        item: 'test',
        validate: function () {
          return 'this is an error';
        }
      }))();
    });

    it('will fail if a non-true, non empty value is returned', function (done) {
      model.isValid().then(null, function () {
        done();
      }, done);
    });

    it('will fail if a non-true, non empty value is returned', function (done) {
      model.save('tim', 'test').fail(function () {
        assert(true);
        done();
      });
    });

    it('keeps the context of the model', function (done) {
      model = new (Bookshelf.Model.extend({
        item: 'test',
        validate: function () {
          this.item === 'test';
          return true;
        }
      }))();
      model.isValid().then(function () {
        done();
      }, done);
    });

    it('accepts a deferrred object');

  });

  describe('save', function () {

    // var base = new Base();

    // it('saves an new object', function (done) {
      
    //   base.set({
    //     name: 'Rob',
    //     guarded_name: 'A'
    //   }).save().then(function () {
    //     done();
    //   }, done);

    // });

    // it('updates an existing object', function (done) {
    //   base.save({name: 'Joe'}).then(function () {
    //     assert.equal(base.get('name'), 'Joe');
    //     done();
    //   }, done);
    // });

  });
  
  describe('defaults', function () {

    it('assigns defaults on save, rather than initialize');
  
  });

  describe('resetQuery', function () {

  });

});