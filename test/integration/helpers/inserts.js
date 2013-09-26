var when  = require('when');
var _     = require('underscore');

module.exports = function(bookshelf) {

  var knex = bookshelf.knex;

  return when.all([

    knex('sites').insert([{
      name: 'knexjs.org'
    }, {
      name: 'bookshelfjs.org'
    }, {
      name: 'backbonejs.org'
    }]),

    knex('sitesmeta').insert([{
      site_id: 1,
      description: 'This is a description for the Knexjs Site'
    }, {
      site_id: 2,
      description: 'This is a description for the Bookshelfjs Site'
    }]),

    knex('info').insert([{
      meta_id: 1,
      other_description: 'This is an info block for hasOne -> through test'
    }, {
      meta_id: 2,
      other_description: 'This is an info block for an eager hasOne -> through test'
    }]),

    knex('admins').insert([{
      username: 'test1',
      password: 'testpwd1',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      username: 'test2',
      password: 'testpwd2',
      created_at: new Date(),
      updated_at: new Date()
    }]),

    knex('blogs').insert([{
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
    }]),

    knex('authors').insert([{
      site_id: 1,
      first_name: 'Tim',
      last_name: 'Griesser'
    },{
      site_id: 1,
      first_name: 'Bazooka',
      last_name: 'Joe'
    },{
      site_id: 2,
      first_name: 'Charlie',
      last_name: 'Brown'
    },{
      site_id: 2,
      first_name: 'Ron',
      last_name: 'Burgundy'
    }]),

    knex('posts').insert([{
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
    }]),

    knex('authors_posts').insert([{
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
    }]),

    knex('tags').insert([{
      name: 'cool'
    },{
      name: 'boring'
    },{
      name: 'exciting'
    },{
      name: 'amazing'
    }]),

    knex('posts_tags').insert([{
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
    }]),

    knex('comments').insert([{
      post_id: 1,
      name: '(blank)',
      email: 'test@example.com',
      comment: 'this is neat.'
    }]),

    knex('photos').insert([{
      caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
      url: 'https://www.google.com/images/srpr/logo4w.png',
      imageable_id: 1,
      imageable_type: 'authors'
    }, {
      caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
      url: 'https://www.google.com/images/srpr/logo4w.png',
      imageable_id: 2,
      imageable_type: 'authors'
    }, {
      caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
      url: 'https://www.google.com/images/srpr/logo4w.png',
      imageable_id: 1,
      imageable_type: 'sites'
    }, {
      caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
      url: 'https://www.google.com/images/srpr/logo4w.png',
      imageable_id: 1,
      imageable_type: 'sites'
    }, {
      caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
      url: 'https://www.google.com/images/srpr/logo4w.png',
      imageable_id: 2,
      imageable_type: 'sites'
    }, {
      caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
      url: 'https://www.google.com/images/srpr/logo4w.png',
      imageable_id: 2,
      imageable_type: 'sites'
    }]),

    knex('users').insert({uid: 1, username: 'root'}),

    knex('roles').insert({rid: 4, name: 'admin'}),

    knex('users_roles').insert({uid: 1, rid: 4}),

    knex('Customer').insert([
      {id: 1, name: 'Customer1'},
      {id: 2, name: 'Customer2'},
      {id: 3, name: 'Customer3'},
      {id: 4, name: 'Customer4'}]),

    knex('Settings').insert([
      {id: 1, Customer_id: 1, data: 'Europe/Paris'},
      {id: 2, Customer_id: 4, data: 'UTC'}
    ]),

    knex('hostnames').insert([
      {hostname: 'google.com', instance_id: 3},
      {hostname: 'apple.com', instance_id: 10},
    ]),

    knex('instances').insert([
      {id: 3, name: 'search engine'},
      {id: 4, name: 'not used'},
      {id: 10, name: 'computers'},
    ])

  ]).then(null, function(e) {
    console.log(e.stack);
  });

};