
var _     = require('underscore');
var Knex  = require('knex');

var inserts = [];

var sites = Knex('sites').insert([{
  name: 'knexjs.org'
}, {
  name: 'bookshelfjs.org'
}]);

var sitesmeta = Knex('sitesmeta').insert([{
  site_id: 1,
  description: 'This is a description for the Knexjs Site'
}, {
  site_id: 2,
  description: 'This is a description for the Bookshelfjs Site'
}]);

var admins = Knex('admins').insert([{
  username: 'test1',
  password: 'testpwd1'
}, {
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
  site_id: 1,
  name: 'Main Site Blog'
},{
  site_id: 1,
  name: 'Alternate Site Blog'
},{
  site_id: 2,
  name: 'Main Site Blog'
},{
  site_id: 2,
  name: 'Alternate Site Blog'
}]);

var authors = Knex('authors').insert([{
  site_id: 1,
  first_name: 'Tim',
  last_name: 'Griesser'
},{
  site_id: 1,
  first_name: 'Bazooka',
  last_name: 'Joe'
},{
  site_id: 2,
  first_name: 'Edgar',
  last_name: 'Winter'
},{
  site_id: 2,
  first_name: 'Ron',
  last_name: 'Burgundy'
}]);

var posts = Knex('posts').insert([{
  owner_id: 1,
  blog_id: 1,
  name: 'This is a new Title!',
  content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
},{
  owner_id: 2,
  blog_id: 2,
  name: 'This is a new Title 2!',
  content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
},{
  owner_id: 2,
  blog_id: 1,
  name: 'This is a new Title 3!',
  content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
},{
  owner_id: 3,
  blog_id: 3,
  name: 'This is a new Title 4!',
  content: 'Lorem ipsum Anim sed eu sint aute.'
},{
  owner_id: 4,
  blog_id: 4,
  name: 'This is a new Title 5!',
  content: 'Lorem ipsum Commodo consectetur eu ea amet laborum nulla eiusmod minim veniam ullamco nostrud sed mollit consectetur veniam mollit Excepteur quis cupidatat.'
}]);

var authors_posts = Knex('authors_posts').insert([{
  author_id: 1,
  post_id: 1
},{
  author_id: 2,
  post_id: 2
},{
  author_id: 3,
  post_id: 4
},{
  author_id: 2,
  post_id: 1
}]);

var tags = Knex('tags').insert([{
  name: 'cool'
},{
  name: 'boring'
},{
  name: 'exciting'
},{
  name: 'amazing'
}]);

var posts_tags = Knex('posts_tags').insert([{
  post_id: 1,
  tag_id: 1
},{
  post_id: 1,
  tag_id: 2
},{
  post_id: 1,
  tag_id: 3
},{
  post_id: 4,
  tag_id: 1
}]);

var comments = Knex('comments').insert([{
  post_id: 1,
  name: '(blank)',
  email: 'test@example.com',
  comment: 'this is neat.'
}]);

inserts.push(sites, sitesmeta, admins, admins_sites, blogs, authors, posts, authors_posts, tags, posts_tags, comments);

module.exports = require('q').all(inserts);