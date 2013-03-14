var Shelf = require('../../bookshelf');
var _     = require('underscore');
var Q     = require('q');

var Schema = Shelf.Knex.Schema;

var drops = ['sites', 'sitesmeta', 'admins', 'admins_sites', 'authors', 'authors_posts', 'blogs', 'posts', 'tags', 'posts_tags', 'comments'];

drops = _.map(drops, function (val) {
  return Schema.dropTableIfExists(val);
});

module.exports = Q.all(drops).then(function () {

  var migrations = [];

  var sites = Schema.createTable('sites', function (table) {
    table.increments('id');
    table.string('name');
  });

  var sitemeta = Schema.createTable('sitesmeta', function (table) {
    table.increments('id');
    table.integer('site_id');
    table.text('description');
  });

  var admins = Schema.createTable('admins', function (table) {
    table.increments('id');
    table.string('username');
    table.string('password');
    table.timestamps();
  });

  var admins_sites = Schema.createTable('admins_sites', function (table) {
    table.integer('admin_id');
    table.integer('site_id');
    table.string('item').defaultTo('test');
  });

  var blogs = Schema.createTable('blogs', function (table) {
    table.increments('id');
    table.integer('site_id');
    table.string('name');
  });

  var authors = Schema.createTable('authors', function (table) {
    table.increments('id');
    table.integer('site_id');
    table.string('first_name');
    table.string('last_name');
  });

  var posts = Schema.createTable('posts', function (table) {
    table.increments('id');
    table.integer('owner_id');
    table.integer('blog_id');
    table.string('name');
    table.string('content');
  });

  var authors_posts = Schema.createTable('authors_posts', function (table) {
    table.increments('id');
    table.integer('author_id');
    table.integer('post_id');
  });

  var tags = Schema.createTable('tags', function (table) {
    table.increments('id');
    table.string('name');
  });

  var posts_tags = Schema.createTable('posts_tags', function (table) {
    table.increments('id');
    table.integer('post_id');
    table.integer('tag_id');
  });

  var comments = Schema.createTable('comments', function (table) {
    table.increments('id');
    table.integer('post_id');
    table.string('name');
    table.string('email');
    table.text('comment');
  });

  migrations.push(sites, sitemeta, admins, admins_sites, authors, authors_posts, blogs, posts, tags, posts_tags, comments);

  return Q.all(migrations);
});
