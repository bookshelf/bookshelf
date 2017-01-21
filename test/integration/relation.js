var equal = require('assert').equal;

module.exports = function(Bookshelf) {

  describe('Relation', function() {

    var Relation = require('../../lib/relation').default;

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

    var Customer = Bookshelf.Model.extend({
      tableName: 'customers',
      locale: function() {
        return this.hasOne(Locale).through(Translation, 'isoCode', 'customer', 'code', 'name');
      },
      locales: function() {
        return this.hasMany(Locale).through(Translation, 'isoCode', 'customer', 'code', 'name');
      }
    });

    var Translation = Bookshelf.Model.extend({
      tableName: 'translations',
      locale: function() {
        return this.belongsTo(Locale, 'code', 'isoCode');
      }
    });

    var Locale = Bookshelf.Model.extend({
      tableName: 'locales',
      customer: function() {
        return this.belongsTo(Customer).through(Translation, 'isoCode', 'customer', 'code', 'name');
      },
      customers: function() {
        return this.belongsToMany(Customer, 'translations', 'code', 'customer', 'isoCode', 'name');
      },
      customersThrough: function() {
        return this.belongsToMany(Customer).through(Translation, 'code', 'customer', 'isoCode', 'name');
      },
      translation: function() {
        return this.hasOne(Translation, 'code', 'isoCode');
      },
      translations: function() {
        return this.hasMany(Translation, 'code', 'isoCode');
      }
    });

    describe('Bookshelf.Relation', function() {

      it('should not error if the type / target are not specified', function() {

        var relation = new Relation();
        equal(relation.type, undefined);

      });

      it('should not error when accessing a relation through an uninstantiated model', function() {
        var relation = Doctor.prototype.meta();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'hasOne');
        equal(relatedData.target, DoctorMeta);
        equal(relatedData.targetTableName, 'doctormeta');
        equal(relatedData.targetIdAttribute, 'customId');
        equal(relatedData.foreignKey, 'doctoring_id');
        equal(relatedData.foreignKeyTarget, undefined);

        // Init
        equal(relatedData.parentId, undefined);
        equal(relatedData.parentTableName, 'doctors');
        equal(relatedData.parentIdAttribute, 'id');
        equal(relatedData.parentFk, undefined);
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
        equal(relatedData.foreignKeyTarget, undefined);

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
        equal(relatedData.foreignKeyTarget, undefined);
        equal(relatedData.otherKey, undefined);
        equal(relatedData.otherKeyTarget, undefined);

        // Init
        equal(relatedData.parentId, 1);
        equal(relatedData.parentTableName, 'suppliers');
        equal(relatedData.parentIdAttribute, 'id');
        equal(relatedData.parentFk, 1);

        // Through
        equal(relatedData.throughTarget, Account);
        equal(relatedData.throughTableName, 'accounts');
        equal(relatedData.throughIdAttribute, 'id');
        equal(relatedData.throughForeignKey, undefined);
        equal(relatedData.throughForeignKeyTarget, undefined);

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
        equal(relatedData.foreignKeyTarget, undefined);
        equal(relatedData.otherKey, undefined);
        equal(relatedData.otherKeyTarget, undefined);

        // Init
        equal(relatedData.parentId, 1);
        equal(relatedData.parentTableName, 'account_histories');
        equal(relatedData.parentIdAttribute, 'id');
        equal(relatedData.parentFk, 1);

        // Through
        equal(relatedData.throughTarget, Account);
        equal(relatedData.throughTableName, 'accounts');
        equal(relatedData.throughIdAttribute, 'id');
        equal(relatedData.throughForeignKey, undefined);
        equal(relatedData.throughForeignKeyTarget, undefined);

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
        equal(relatedData.foreignKeyTarget, undefined);
        equal(relatedData.otherKey, undefined);
        equal(relatedData.otherKeyTarget, undefined);

        // Init
        equal(relatedData.parentId, 1);
        equal(relatedData.parentTableName, 'doctors');
        equal(relatedData.parentIdAttribute, 'id');
        equal(relatedData.parentFk, 1);

        // Through
        equal(relatedData.throughTarget, Appointment);
        equal(relatedData.throughTableName, 'appointments');
        equal(relatedData.throughIdAttribute, 'id');
        equal(relatedData.throughForeignKey, undefined);
        equal(relatedData.throughForeignKeyTarget, undefined);

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
        equal(relatedData.foreignKeyTarget, undefined);
        equal(relatedData.otherKey, undefined);
        equal(relatedData.otherKeyTarget, undefined);

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
        equal(relatedData.foreignKeyTarget, undefined);

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

      it('should handle a hasOne relation with explicit foreignKeyTarget', function() {
        var base = new Locale({ isoCode: 'en' });
        var relation = base.translation();
        var _knex = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'hasOne');
        equal(relatedData.target, Translation);
        equal(relatedData.targetTableName, 'translations');
        equal(relatedData.targetIdAttribute, 'id');
        equal(relatedData.foreignKey, 'code');
        equal(relatedData.foreignKeyTarget, 'isoCode');

        // Init
        equal(relatedData.parentId, undefined);
        equal(relatedData.parentTableName, 'locales');
        equal(relatedData.parentIdAttribute, 'isoCode');
        equal(relatedData.parentFk, 'en');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        equal(_knex.toString(), 'select `translations`.* from `translations` where `translations`.`code` = \'en\' limit 1');
      });

      it('should handle a hasOne -> through relation with explicit foreignKeyTarget', function() {
        var base = new Customer({ name: 'foobar' });
        var relation = base.locale();
        var _knex = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'hasOne');
        equal(relatedData.target, Locale);
        equal(relatedData.targetTableName, 'locales');
        equal(relatedData.targetIdAttribute, 'id');
        equal(relatedData.foreignKey, 'customer');
        equal(relatedData.foreignKeyTarget, undefined);
        equal(relatedData.otherKey, 'customer');
        equal(relatedData.otherKeyTarget, 'name');

        // Init
        equal(relatedData.parentId, undefined);
        equal(relatedData.parentTableName, 'customers');
        equal(relatedData.parentIdAttribute, 'name');
        equal(relatedData.parentFk, 'foobar');

        // Through
        equal(relatedData.throughTarget, Translation);
        equal(relatedData.throughTableName, 'translations');
        equal(relatedData.throughIdAttribute, 'code');
        equal(relatedData.throughForeignKey, 'isoCode');
        equal(relatedData.throughForeignKeyTarget, 'code');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        equal(_knex.toString(), 'select `locales`.*, `translations`.`code` as `_pivot_code`, `translations`.`customer` as `_pivot_customer` from `locales` inner join `translations` on `translations`.`code` = `locales`.`isoCode` where `translations`.`customer` = \'foobar\' limit 1');
      });

      it('should handle a hasMany relation with explicit foreignKeyTarget', function() {
        var base = new Locale({ isoCode: 'en' });
        var relation = base.translations();
        var _knex = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'hasMany');
        equal(relatedData.target, Translation);
        equal(relatedData.targetTableName, 'translations');
        equal(relatedData.targetIdAttribute, 'id');
        equal(relatedData.foreignKey, 'code');
        equal(relatedData.foreignKeyTarget, 'isoCode');

        // Init
        equal(relatedData.parentId, undefined);
        equal(relatedData.parentTableName, 'locales');
        equal(relatedData.parentIdAttribute, 'isoCode');
        equal(relatedData.parentFk, 'en');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        equal(_knex.toString(), 'select `translations`.* from `translations` where `translations`.`code` = \'en\'');
      });

      it('should handle a hasMany -> through relation with explicit foreignKeyTarget', function() {
        var base = new Customer({ name: 'foobar' });
        var relation = base.locales();
        var _knex = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'hasMany');
        equal(relatedData.target, Locale);
        equal(relatedData.targetTableName, 'locales');
        equal(relatedData.targetIdAttribute, 'id');
        equal(relatedData.foreignKey, 'customer');
        equal(relatedData.foreignKeyTarget, undefined);
        equal(relatedData.otherKey, 'customer');
        equal(relatedData.otherKeyTarget, 'name');

        // Init
        equal(relatedData.parentId, undefined);
        equal(relatedData.parentTableName, 'customers');
        equal(relatedData.parentIdAttribute, 'name');
        equal(relatedData.parentFk, 'foobar');

        // Through
        equal(relatedData.throughTarget, Translation);
        equal(relatedData.throughTableName, 'translations');
        equal(relatedData.throughIdAttribute, 'code');
        equal(relatedData.throughForeignKey, 'isoCode');
        equal(relatedData.throughForeignKeyTarget, 'code');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        equal(_knex.toString(), 'select `locales`.*, `translations`.`code` as `_pivot_code`, `translations`.`customer` as `_pivot_customer` from `locales` inner join `translations` on `translations`.`code` = `locales`.`isoCode` where `translations`.`customer` = \'foobar\'');
      });

      it('should handle a belongsTo relation with explicit foreignKeyTarget', function() {
        var base = new Translation({ code: 'en' });
        var relation = base.locale();
        var _knex = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'belongsTo');
        equal(relatedData.target, Locale);
        equal(relatedData.targetTableName, 'locales');
        equal(relatedData.targetIdAttribute, 'isoCode');
        equal(relatedData.foreignKey, 'code');
        equal(relatedData.foreignKeyTarget, 'isoCode');

        // Init
        equal(relatedData.parentId, undefined);
        equal(relatedData.parentTableName, 'translations');
        equal(relatedData.parentIdAttribute, 'isoCode');
        equal(relatedData.parentFk, 'en');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        var sql = 'select `locales`.* from `locales` where `locales`.`isoCode` = \'en\' limit 1';

        equal(_knex.toString(), sql);
      });

      it('should handle a belongsTo -> through relation with explicit foreignKeyTarget', function() {
        var base = new Locale({ isoCode: 'en' });
        var relation = base.customer();
        var _knex = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'belongsTo');
        equal(relatedData.target, Customer);
        equal(relatedData.targetTableName, 'customers');
        equal(relatedData.targetIdAttribute, 'name');
        equal(relatedData.foreignKey, 'customer');
        equal(relatedData.foreignKeyTarget, undefined);
        equal(relatedData.otherKey, 'customer');
        equal(relatedData.otherKeyTarget, 'name');

        // Init
        equal(relatedData.parentId, undefined);
        equal(relatedData.parentTableName, 'locales');
        equal(relatedData.parentIdAttribute, 'isoCode');
        equal(relatedData.parentFk, 'en');

        // Through
        equal(relatedData.throughTarget, Translation);
        equal(relatedData.throughTableName, 'translations');
        equal(relatedData.throughIdAttribute, 'code');
        equal(relatedData.throughForeignKey, 'isoCode');
        equal(relatedData.throughForeignKeyTarget, 'code');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        var sql = 'select `customers`.*, `translations`.`code` as `_pivot_code`, `translations`.`customer` as `_pivot_customer` from `customers` inner join `translations` on `translations`.`customer` = `customers`.`name` inner join `locales` on `translations`.`code` = `locales`.`isoCode` where `locales`.`isoCode` = \'en\' limit 1';

        equal(_knex.toString(), sql);
      });

      it('should handle a belongsToMany relation with explicit foreignKeyTarget and otherKeyTarget', function() {
        var base = new Locale({ isoCode: 'en' });
        var relation = base.customers();
        var _knex = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'belongsToMany');
        equal(relatedData.target, Customer);
        equal(relatedData.targetTableName, 'customers');
        equal(relatedData.targetIdAttribute, 'name');
        equal(relatedData.joinTableName, 'translations');
        equal(relatedData.foreignKey, 'code');
        equal(relatedData.foreignKeyTarget, 'isoCode');
        equal(relatedData.otherKey, 'customer');
        equal(relatedData.otherKeyTarget, 'name');

        // Init
        equal(relatedData.parentId, undefined);
        equal(relatedData.parentTableName, 'locales');
        equal(relatedData.parentIdAttribute, 'isoCode');
        equal(relatedData.parentFk, 'en');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        var sql = 'select `customers`.*, `translations`.`code` as `_pivot_code`, `translations`.`customer` as `_pivot_customer` from `customers` inner join `translations` on `translations`.`customer` = `customers`.`name` where `translations`.`code` = \'en\'';

        equal(_knex.toString(), sql);
      });

      it('should handle a belongsToMany -> through relation with explicit foreignKeyTarget and otherKeyTarget', function() {
        var base = new Locale({ isoCode: 'en' });
        var relation = base.customersThrough();
        var _knex = relation.query();
        var relatedData = relation.relatedData;

        // Base
        equal(relatedData.type, 'belongsToMany');
        equal(relatedData.target, Customer);
        equal(relatedData.targetTableName, 'customers');
        equal(relatedData.targetIdAttribute, 'name');
        equal(relatedData.joinTableName, undefined);
        equal(relatedData.foreignKey, 'code');
        equal(relatedData.foreignKeyTarget, undefined);
        equal(relatedData.otherKey, 'customer');
        equal(relatedData.otherKeyTarget, 'name');

        // Init
        equal(relatedData.parentId, undefined);
        equal(relatedData.parentTableName, 'locales');
        equal(relatedData.parentIdAttribute, 'isoCode');
        equal(relatedData.parentFk, 'en');

        // Through
        equal(relatedData.throughTarget, Translation);
        equal(relatedData.throughTableName, 'translations');
        equal(relatedData.throughIdAttribute, 'code');
        equal(relatedData.throughForeignKey, 'code');
        equal(relatedData.throughForeignKeyTarget, 'isoCode');

        // init the select constraints
        relatedData.selectConstraints(_knex, {});

        var sql = 'select `customers`.*, `translations`.`code` as `_pivot_code`, `translations`.`code` as `_pivot_code`, `translations`.`customer` as `_pivot_customer` from `customers` inner join `translations` on `translations`.`customer` = `customers`.`name` where `translations`.`code` = \'en\'';

        equal(_knex.toString(), sql);
      });

    });

  });

};
