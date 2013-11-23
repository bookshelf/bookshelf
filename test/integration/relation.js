var equal = require('assert').equal;

module.exports = function(Bookshelf) {

  describe('Relation', function() {

    var Relation = require('../../dialects/sql/relation').Relation;

    var Photo = Bookshelf.Model.extend({
      tableName: 'photos',
      imageable: function() {
        this.morphTo('imageable', Doctor, Patient);
      }
    });

    var Doctor = Bookshelf.Model.extend({
      tableName: 'doctors',
      photos: function() {
        return this.morphMany(Photo, 'imageable');
      },
      patients: function() {
        return this.belongsToMany(Patient).through(Appointment);
      },
      patientsStd: function() {
        return this.belongsToMany(Patient);
      },
      meta: function() {
        return this.hasOne(DoctorMeta, 'doctoring_id');
      }
    });

    var DoctorMeta = Bookshelf.Model.extend({
      idAttribute: 'customId',
      tableName: 'doctormeta',
      doctor: function() {
        return this.belongsTo(Doctor, 'doctoring_id');
      }
    });

    var Patient = Bookshelf.Model.extend({
      tableName: 'patients',
      doctors: function() {
        return this.belongsToMany(Doctor).through(Appointment);
      },
      photos: function() {
        return this.morphMany(Photo, 'imageable');
      }
    });

    var Appointment = Bookshelf.Model.extend({
      tableName: 'appointments',
      patient: function() {
        return this.belongsTo(Patient);
      },
      doctor: function() {
        return this.belongsTo(Doctor);
      }
    });

    var Supplier = Bookshelf.Model.extend({
      tableName: 'suppliers',
      accountHistory: function() {
        return this.hasOne(AccountHistory).through(Account);
      }
    });

    var Account = Bookshelf.Model.extend({
      tableName: 'accounts'
    });

    var AccountHistory = Bookshelf.Model.extend({
      tableName: 'account_histories',
      supplier: function() {
        return this.belongsTo(Supplier).through(Account);
      }
    });

    describe('Bookshelf.Relation', function() {

      it('should not error if the type / target are not specified', function() {

        var relation = new Relation();
        equal(relation.type, undefined);

      });

      it('should handle a hasOne relation', function() {

        var base        = new Doctor({id: 1});
        var relation    = base.meta();
        var _knex       = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'hasOne');
        equal(relatedData.target, DoctorMeta);
        equal(relatedData.targetTableName, 'doctormeta');
        equal(relatedData.targetIdAttribute, 'customId');
        equal(relatedData.foreignKey, 'doctoring_id');

        // Init
        equal(relatedData.parentId, 1);
        equal(relatedData.parentTableName, 'doctors');
        equal(relatedData.parentIdAttribute, 'id');
        equal(relatedData.parentFk, 1);

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        equal(_knex.toString(), 'select `doctormeta`.* from `doctormeta` where `doctormeta`.`doctoring_id` = 1 limit 1');
      });

      it('should handle a hasOne -> through relation', function() {
        var base = new Supplier({id: 1});
        var relation = base.accountHistory();
        var _knex    = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'hasOne');
        equal(relatedData.target, AccountHistory);
        equal(relatedData.targetTableName, 'account_histories');
        equal(relatedData.targetIdAttribute, 'id');
        equal(relatedData.foreignKey, undefined);

        // Init
        equal(relatedData.parentId, 1);
        equal(relatedData.parentTableName, 'suppliers');
        equal(relatedData.parentIdAttribute, 'id');
        equal(relatedData.parentFk, 1);

        // Through
        equal(relatedData.throughTarget, Account);
        equal(relatedData.throughTableName, 'accounts');
        equal(relatedData.throughIdAttribute, 'id');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        var sql = 'select `account_histories`.*, `accounts`.`id` as `_pivot_id`, `accounts`.`supplier_id` as `_pivot_supplier_id` from `account_histories` inner join `accounts` on `accounts`.`id` = `account_histories`.`account_id` where `accounts`.`supplier_id` = 1 limit 1';

        equal(_knex.toString(), sql);
      });

      it('should handle a belongsTo -> through relation', function() {
        var base = new AccountHistory({id: 1});
        var relation = base.supplier();
        var _knex    = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'belongsTo');
        equal(relatedData.target, Supplier);
        equal(relatedData.targetTableName, 'suppliers');
        equal(relatedData.targetIdAttribute, 'id');
        equal(relatedData.foreignKey, 'supplier_id');

        // Init
        equal(relatedData.parentId, 1);
        equal(relatedData.parentTableName, 'account_histories');
        equal(relatedData.parentIdAttribute, 'id');
        equal(relatedData.parentFk, 1);

        // Through
        equal(relatedData.throughTarget, Account);
        equal(relatedData.throughTableName, 'accounts');
        equal(relatedData.throughIdAttribute, 'id');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        var sql = 'select `suppliers`.*, `accounts`.`id` as `_pivot_id`, `accounts`.`supplier_id` as `_pivot_supplier_id` from `suppliers` inner join `accounts` on `accounts`.`supplier_id` = `suppliers`.`id` inner join `account_histories` on `accounts`.`id` = `account_histories`.`account_id` where `account_histories`.`id` = 1 limit 1';

        equal(_knex.toString(), sql);
      });

      it('should handle a belongsToMany -> through relation', function() {
        var base = new Doctor({id: 1});
        var relation = base.patients();
        var _knex    = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'belongsToMany');
        equal(relatedData.target, Patient);
        equal(relatedData.targetTableName, 'patients');
        equal(relatedData.targetIdAttribute, 'id');
        equal(relatedData.foreignKey, undefined);

        // Init
        equal(relatedData.parentId, 1);
        equal(relatedData.parentTableName, 'doctors');
        equal(relatedData.parentIdAttribute, 'id');
        equal(relatedData.parentFk, 1);

        // Through
        equal(relatedData.throughTarget, Appointment);
        equal(relatedData.throughTableName, 'appointments');
        equal(relatedData.throughIdAttribute, 'id');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        var sql = 'select `patients`.*, `appointments`.`id` as `_pivot_id`, `appointments`.`doctor_id` as `_pivot_doctor_id`, `appointments`.`patient_id` as `_pivot_patient_id` from `patients` inner join `appointments` on `appointments`.`patient_id` = `patients`.`id` where `appointments`.`doctor_id` = 1';

        equal(_knex.toString(), sql);
      });

      it('should handle a standard belongsToMany relation', function() {
        var base = new Doctor({id: 1});
        var relation = base.patientsStd();
        var _knex    = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'belongsToMany');
        equal(relatedData.target, Patient);
        equal(relatedData.targetTableName, 'patients');
        equal(relatedData.targetIdAttribute, 'id');
        equal(relatedData.foreignKey, undefined);

        // Init
        equal(relatedData.parentId, 1);
        equal(relatedData.parentTableName, 'doctors');
        equal(relatedData.parentIdAttribute, 'id');
        equal(relatedData.parentFk, 1);

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        var sql = 'select `patients`.*, `doctors_patients`.`doctor_id` as `_pivot_doctor_id`, `doctors_patients`.`patient_id` as `_pivot_patient_id` from `patients` inner join `doctors_patients` on `doctors_patients`.`patient_id` = `patients`.`id` where `doctors_patients`.`doctor_id` = 1';

        equal(_knex.toString(), sql);
      });

      it('should handle polymorphic relations', function() {
        var base = new Doctor({id: 1});
        var relation = base.photos();
        var _knex    = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'morphMany');
        equal(relatedData.target, Photo);
        equal(relatedData.targetTableName, 'photos');
        equal(relatedData.targetIdAttribute, 'id');
        equal(relatedData.foreignKey, undefined);

        // Init
        equal(relatedData.parentId, 1);
        equal(relatedData.parentTableName, 'doctors');
        equal(relatedData.parentIdAttribute, 'id');
        equal(relatedData.parentFk, 1);

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        var sql = "select `photos`.* from `photos` where `photos`.`imageable_id` = 1 and `photos`.`imageable_type` = 'doctors'";

        equal(_knex.toString(), sql);
      });

    });

  });

};