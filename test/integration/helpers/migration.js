var _ = require('lodash')
var Promise = global.testPromise;

var drops = [
  'sites', 'sitesmeta', 'admins', 'admins_sites', 'authors', 'authors_posts',
  'blogs', 'posts', 'tags', 'posts_tags', 'comments', 'users', 'roles',
  'photos', 'users_roles', 'info', 'Customer', 'Settings', 'hostnames',
  'instances', 'uuid_test', 'parsed_users', 'tokens', 'thumbnails', 'lefts',
  'rights', 'lefts_rights', 'organization', 'locales', 'translations',
  'backups', 'backup_types'
];

module.exports = function(Bookshelf) {

  var schema = Bookshelf.knex.schema;

  return Promise.all(_.map(drops, function(val) {
    return schema.dropTableIfExists(val);
  }))
  .then(function() {

    return schema.createTable('sites', function(table) {
      table.increments('id');
      table.string('name');
    })
    .createTable('sitesmeta', function(table) {
      table.increments('id');
      table.integer('site_id').notNullable();
      table.text('description');
    })
    .createTable('info', function(table) {
      table.increments('id');
      table.integer('meta_id').notNullable();
      table.text('other_description');
    })
    .createTable('admins', function(table) {
      table.increments('id');
      table.string('username');
      table.string('password');
      table.timestamps();
    })
    .createTable('admins_sites', function(table) {
      table.increments('id');
      table.integer('admin_id').notNullable();
      table.integer('site_id').notNullable();
      table.string('item').defaultTo('test');
    })
    .createTable('blogs', function(table) {
      table.increments('id');
      table.integer('site_id');
      table.string('name');
    })
    .createTable('authors', function(table) {
      table.increments('id');
      table.integer('site_id').notNullable();
      table.string('first_name');
      table.string('last_name');
    })
    .createTable('posts', function(table) {
      table.increments('id');
      table.integer('owner_id').notNullable();
      table.integer('blog_id').notNullable();
      table.string('name');
      table.text('content');
    })
    .createTable('authors_posts', function(table) {
      table.increments('id');
      table.integer('author_id').notNullable();
      table.integer('post_id').notNullable();
    })
    .createTable('tags', function(table) {
      table.increments('id');
      table.string('name');
    })
    .createTable('posts_tags', function(table) {
      table.increments('id');
      table.integer('post_id').notNullable();
      table.integer('tag_id').notNullable();
    })
    .createTable('comments', function(table) {
      table.increments('id');
      table.integer('post_id').notNullable();
      table.string('name');
      table.string('email');
      table.text('comment');
    })
    .createTable('users', function(table) {
      table.increments('uid');
      table.string('username');
    })
    .createTable('roles', function(table) {
      table.increments('rid');
      table.string('name');
    })
    .createTable('users_roles', function(table) {
      table.integer('rid').notNullable();
      table.integer('uid').notNullable();
    })
    .createTable('photos', function(table) {
      table.increments('id');
      table.string('url');
      table.string('caption');
      table.integer('imageable_id').notNullable();
      table.string('imageable_type');
    })
    /* The following table is for testing non-standard morphTo column name
     * specification. The breaking of naming convention is intentional.
     * Changing it back to snake_case will break the tests!
     */
    .createTable('thumbnails', function(table) {
      table.increments('id');
      table.string('url');
      table.string('caption');
      table.integer('ImageableId').notNullable();
      table.string('ImageableType');
    })
    .createTable('Customer', function(table) {
      table.increments('id');
      table.string('name');
    })
    .createTable('Settings', function(table) {
      table.increments('id');
      table.integer('Customer_id').notNullable();
      table.string('data', 64);
    })
    .createTable('hostnames', function(table){
      table.string('hostname');
      table.integer('instance_id').notNullable();
      table.enu('route', ['annotate','submit']);
    })
    .createTable('instances', function(table){
      table.bigIncrements('id');
      table.string('name');
    })
    .createTable('uuid_test', function(table) {
      table.uuid('uuid');
      table.string('name');
    })
    .createTable('parsed_users', function(table) {
      table.increments();
      table.string('name');
    })
    .createTable('tokens', function(table) {
      table.increments();
      table.string('parsed_user_id');
      table.string('token');
    })
    //
    .createTable('lefts', function(table) {
      table.increments();
    })
    .createTable('rights', function(table) {
      table.increments();
    })
    .createTable('lefts_rights', function(table) {
      table.increments();
      table.string('parsed_name');
      table.integer('left_id').notNullable();
      table.integer('right_id').notNullable();
    })
    .createTable('organization', function(table) {
      table.increments('organization_id');
      table.string('organization_name').notNullable();
      table.boolean('organization_is_active').defaultTo(false);
    })
    .createTable('locales', function(table) {
      table.string('isoCode');
    })
    .createTable('translations', function(table) {
      table.string('code');
      table.string('customer');
    })
    .createTable('backup_types', function(table) {
      table.increments();
      table.string('name');
    })
    .createTable('backups', function(table) {
      table.increments();
      table.string('name');
      table.integer('backup_type_id');
    })
  });

};
