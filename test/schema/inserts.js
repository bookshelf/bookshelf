
var Shelf = require('../../bookshelf');
var _     = require('underscore');
var Q     = require('q');
var Knex = Shelf.Knex;
var inserts = [];

var sites = Knex('sites').insert([{
  name: 'knexjs.org'
}, {
  name: 'bookshelfjs.org'
}]);

var sitesmeta = Knex('sitesmeta').insert([{
  id: 1,
  site_id: 1,
  description: 'This is a description for the Knexjs Site'
}, {
  id: 2,
  site_id: 2,
  description: 'This is a description for the Bookshelfjs Site'
}]);

var admins = Knex('admins').insert([{
  id: 1,
  username: 'test1',
  password: 'testpwd1'
}, {
  id: 2,
  username: 'test2',
  password: 'testpwd2'
}]);

var admins_sites = Knex('admins_sites').insert([{
  site_id: 1,
  admin_id: 1
}, {
  site_id: 2,
  admin_id: 2
}]);

var blogs = Knex('blogs').insert([{
  id: 1,
  site_id: 1,
  name: 'Main Site Blog'
},{
  id: 2,
  site_id: 1,
  name: 'Alternate Site Blog'
},{
  id: 3,
  site_id: 2,
  name: 'Main Site Blog'
},{
  id: 4,
  site_id: 2,
  name: 'Alternate Site Blog'
}]);

var authors = Knex('authors').insert([{
  id: 1,
  site_id: 1,
  first_name: 'Tim',
  last_name: 'Griesser'
},{
  id: 2,
  site_id: 1,
  first_name: 'Bazooka',
  last_name: 'Joe'
},{
  id: 3,
  site_id: 2,
  first_name: 'Edgar',
  last_name: 'Winter'
},{
  id: 4,
  site_id: 2,
  first_name: 'Ron',
  last_name: 'Burgundy'
}]);

var posts = Knex('posts').insert([{
  id: 1,
  owner_id: 1,
  blog_id: 1,
  name: 'This is a new Title!',
  content: ''
},{
  id: 2,
  owner_id: 2,
  blog_id: 2,
  name: 'This is a new Title 2!',
  content: ''
},{
  id: 3,
  owner_id: 2,
  blog_id: 1,
  name: 'This is a new Title 3!',
  content: ''
},{
  id: 4,
  owner_id: 3,
  blog_id: 3,
  name: 'This is a new Title 3!',
  content: ''
},{
  id: 5,
  owner_id: 4,
  blog_id: 4,
  name: 'This is a new Title 3!',
  content: ''
}]);

var authors_posts = Knex('authors_posts').insert([{
  id: 1,
  author_id: 1,
  post_id: 1
},{
  id: 2,
  author_id: 2,
  post_id: 2
},{
  id: 3,
  author_id: 3,
  post_id: 4
},{
  id: 4,
  author_id: 2,
  post_id: 1
}]);

var tags = Knex('tags').insert([{
  id: 1,
  name: 'cool'
},{
  id: 2,
  name: 'boring'
},{
  id: 3,
  name: 'exciting'
},{
  id: 4,
  name: 'amazing'
}]);

var posts_tags = Knex('posts_tags').insert([{
  id: 1,
  post_id: 1,
  tag_id: 1
},{
  id: 2,
  post_id: 1,
  tag_id: 2
},{
  id: 3,
  post_id: 1,
  tag_id: 3
},{
  id: 4,
  post_id: 4,
  tag_id: 1
}]);

var comments = Knex('comments').insert([{
  id: 1,
  post_id: 1,
  name: '(blank)',
  email: 'test@example.com',
  comment: 'this is neat.'
}]);

inserts.push(sites, sitesmeta, admins, admins_sites, blogs, authors, posts, authors_posts, tags, posts_tags, comments);

module.exports = Q.all(inserts);