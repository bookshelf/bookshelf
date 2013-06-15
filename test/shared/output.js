module.exports = {
  db: {
    'collection.1 - fetches the models in a collection': {
      mysql: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
      },{
        id: 2,
        owner_id: 2,
        blog_id: 2,
        name: 'This is a new Title 2!',
        content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
      },{
        id: 3,
        owner_id: 2,
        blog_id: 1,
        name: 'This is a new Title 3!',
        content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
      },{
        id: 4,
        owner_id: 3,
        blog_id: 3,
        name: 'This is a new Title 4!',
        content: 'Lorem ipsum Anim sed eu sint aute.'
      },{
        id: 5,
        owner_id: 4,
        blog_id: 4,
        name: 'This is a new Title 5!',
        content: 'Lorem ipsum Commodo consectetur eu ea amet laborum nulla eiusmod minim veniam ullamco nostrud sed mollit consectetur veniam mollit Excepteur quis cupidatat.'
      }],
      postgres: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
      },{
        id: 2,
        owner_id: 2,
        blog_id: 2,
        name: 'This is a new Title 2!',
        content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
      },{
        id: 3,
        owner_id: 2,
        blog_id: 1,
        name: 'This is a new Title 3!',
        content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
      },{
        id: 4,
        owner_id: 3,
        blog_id: 3,
        name: 'This is a new Title 4!',
        content: 'Lorem ipsum Anim sed eu sint aute.'
      },{
        id: 5,
        owner_id: 4,
        blog_id: 4,
        name: 'This is a new Title 5!',
        content: 'Lorem ipsum Commodo consectetur eu ea amet laborum nulla eiusmod minim veniam ullamco nostrud sed mollit consectetur veniam mollit Excepteur quis cupidatat.'
      }],
      sqlite3: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
      },{
        id: 2,
        owner_id: 2,
        blog_id: 2,
        name: 'This is a new Title 2!',
        content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
      },{
        id: 3,
        owner_id: 2,
        blog_id: 1,
        name: 'This is a new Title 3!',
        content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
      },{
        id: 4,
        owner_id: 3,
        blog_id: 3,
        name: 'This is a new Title 4!',
        content: 'Lorem ipsum Anim sed eu sint aute.'
      },{
        id: 5,
        owner_id: 4,
        blog_id: 4,
        name: 'This is a new Title 5!',
        content: 'Lorem ipsum Commodo consectetur eu ea amet laborum nulla eiusmod minim veniam ullamco nostrud sed mollit consectetur veniam mollit Excepteur quis cupidatat.'
      }]
    },
    'relations.1 - handles belongsTo': {
      mysql: [{
        blog: {
          id: 4,
          site_id: 2,
          name: 'Alternate Site Blog'
        }
      },{
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }],
      postgres: [{
        blog: {
          id: 4,
          site_id: 2,
          name: 'Alternate Site Blog'
        }
      },{
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }],
      sqlite3: [{
        blog: {
          id: 4,
          site_id: 2,
          name: 'Alternate Site Blog'
        }
      },{
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }]
    },
    'relations.2 - handles hasMany': {
      mysql: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
      },{
        id: 3,
        owner_id: 2,
        blog_id: 1,
        name: 'This is a new Title 3!',
        content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
      }],
      postgres: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
      },{
        id: 3,
        owner_id: 2,
        blog_id: 1,
        name: 'This is a new Title 3!',
        content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
      }],
      sqlite3: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
      },{
        id: 3,
        owner_id: 2,
        blog_id: 1,
        name: 'This is a new Title 3!',
        content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
      }]
    },
    'relations.3 - handles hasOne': {
      mysql: {
        site_id: 1,
        id: 1,
        description: 'This is a description for the Knexjs Site'
      },
      postgres: {
        site_id: 1,
        id: 1,
        description: 'This is a description for the Knexjs Site'
      },
      sqlite3: {
        site_id: 1,
        id: 1,
        description: 'This is a description for the Knexjs Site'
      }
    },
    'relations.4 - handles belongsToMany': {
      mysql: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        _pivot_author_id: 1,
        _pivot_post_id: 1
      }],
      postgres: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        _pivot_author_id: 1,
        _pivot_post_id: 1
      }],
      sqlite3: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        _pivot_author_id: 1,
        _pivot_post_id: 1
      }]
    },
    'relations.5 - eager loads "hasOne" relationships correctly': {
      mysql: {
        id: 1,
        name: 'knexjs.org',
        meta: {
          id: 1,
          site_id: 1,
          description: 'This is a description for the Knexjs Site'
        }
      },
      postgres: {
        id: 1,
        name: 'knexjs.org',
        meta: {
          id: 1,
          site_id: 1,
          description: 'This is a description for the Knexjs Site'
        }
      },
      sqlite3: {
        id: 1,
        name: 'knexjs.org',
        meta: {
          id: 1,
          site_id: 1,
          description: 'This is a description for the Knexjs Site'
        }
      }
    },
    'relations.6 - eager loads "hasMany" relationships correctly': {
      mysql: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser'
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe'
        }],
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }]
      },
      postgres: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser'
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe'
        }],
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }]
      },
      sqlite3: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser'
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe'
        }],
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }]
      }
    },
    'relations.7 - eager loads "belongsTo" relationships correctly': {
      mysql: {
        id: 3,
        site_id: 2,
        name: 'Main Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },
      postgres: {
        id: 3,
        site_id: 2,
        name: 'Main Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },
      sqlite3: {
        id: 3,
        site_id: 2,
        name: 'Main Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }
    },
    'relations.8 - eager loads "belongsToMany" models correctly': {
      mysql: {
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        tags: [{
          id: 1,
          name: 'cool',
          _pivot_post_id: 1,
          _pivot_tag_id: 1
        },{
          id: 2,
          name: 'boring',
          _pivot_post_id: 1,
          _pivot_tag_id: 2
        },{
          id: 3,
          name: 'exciting',
          _pivot_post_id: 1,
          _pivot_tag_id: 3
        }]
      },
      postgres: {
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        tags: [{
          id: 1,
          name: 'cool',
          _pivot_post_id: 1,
          _pivot_tag_id: 1
        },{
          id: 2,
          name: 'boring',
          _pivot_post_id: 1,
          _pivot_tag_id: 2
        },{
          id: 3,
          name: 'exciting',
          _pivot_post_id: 1,
          _pivot_tag_id: 3
        }]
      },
      sqlite3: {
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        tags: [{
          id: 1,
          name: 'cool',
          _pivot_post_id: 1,
          _pivot_tag_id: 1
        },{
          id: 2,
          name: 'boring',
          _pivot_post_id: 1,
          _pivot_tag_id: 2
        },{
          id: 3,
          name: 'exciting',
          _pivot_post_id: 1,
          _pivot_tag_id: 3
        }]
      }
    },
    'relations.9 - eager loads "hasOne" models correctly': {
      mysql: [{
        id: 1,
        name: 'knexjs.org',
        meta: {
          id: 1,
          site_id: 1,
          description: 'This is a description for the Knexjs Site'
        }
      },{
        id: 2,
        name: 'bookshelfjs.org',
        meta: {
          id: 2,
          site_id: 2,
          description: 'This is a description for the Bookshelfjs Site'
        }
      }],
      postgres: [{
        id: 1,
        name: 'knexjs.org',
        meta: {
          id: 1,
          site_id: 1,
          description: 'This is a description for the Knexjs Site'
        }
      },{
        id: 2,
        name: 'bookshelfjs.org',
        meta: {
          id: 2,
          site_id: 2,
          description: 'This is a description for the Bookshelfjs Site'
        }
      }],
      sqlite3: [{
        id: 1,
        name: 'knexjs.org',
        meta: {
          id: 1,
          site_id: 1,
          description: 'This is a description for the Knexjs Site'
        }
      },{
        id: 2,
        name: 'bookshelfjs.org',
        meta: {
          id: 2,
          site_id: 2,
          description: 'This is a description for the Bookshelfjs Site'
        }
      }]
    },
    'relations.10 - eager loads "belongsTo" models correctly': {
      mysql: [{
        id: 1,
        site_id: 1,
        name: 'Main Site Blog',
        site: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 2,
        site_id: 1,
        name: 'Alternate Site Blog',
        site: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 3,
        site_id: 2,
        name: 'Main Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 4,
        site_id: 2,
        name: 'Alternate Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }],
      postgres: [{
        id: 1,
        site_id: 1,
        name: 'Main Site Blog',
        site: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 2,
        site_id: 1,
        name: 'Alternate Site Blog',
        site: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 3,
        site_id: 2,
        name: 'Main Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 4,
        site_id: 2,
        name: 'Alternate Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }],
      sqlite3: [{
        id: 1,
        site_id: 1,
        name: 'Main Site Blog',
        site: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 2,
        site_id: 1,
        name: 'Alternate Site Blog',
        site: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 3,
        site_id: 2,
        name: 'Main Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 4,
        site_id: 2,
        name: 'Alternate Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }]
    },
    'relations.11 - eager loads "hasMany" models correctly': {
      mysql: {
        id: 1,
        name: 'knexjs.org',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }]
      },
      postgres: {
        id: 1,
        name: 'knexjs.org',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }]
      },
      sqlite3: {
        id: 1,
        name: 'knexjs.org',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }]
      }
    },
    'relations.12 - eager loads "belongsToMany" models correctly': {
      mysql: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        tags: [{
          id: 1,
          name: 'cool',
          _pivot_post_id: 1,
          _pivot_tag_id: 1
        },{
          id: 2,
          name: 'boring',
          _pivot_post_id: 1,
          _pivot_tag_id: 2
        },{
          id: 3,
          name: 'exciting',
          _pivot_post_id: 1,
          _pivot_tag_id: 3
        }]
      },{
        id: 3,
        owner_id: 2,
        blog_id: 1,
        name: 'This is a new Title 3!',
        content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.',
        tags: []
      }],
      postgres: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        tags: [{
          id: 1,
          name: 'cool',
          _pivot_post_id: 1,
          _pivot_tag_id: 1
        },{
          id: 2,
          name: 'boring',
          _pivot_post_id: 1,
          _pivot_tag_id: 2
        },{
          id: 3,
          name: 'exciting',
          _pivot_post_id: 1,
          _pivot_tag_id: 3
        }]
      },{
        id: 3,
        owner_id: 2,
        blog_id: 1,
        name: 'This is a new Title 3!',
        content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.',
        tags: []
      }],
      sqlite3: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        tags: [{
          id: 1,
          name: 'cool',
          _pivot_post_id: 1,
          _pivot_tag_id: 1
        },{
          id: 2,
          name: 'boring',
          _pivot_post_id: 1,
          _pivot_tag_id: 2
        },{
          id: 3,
          name: 'exciting',
          _pivot_post_id: 1,
          _pivot_tag_id: 3
        }]
      },{
        id: 3,
        owner_id: 2,
        blog_id: 1,
        name: 'This is a new Title 3!',
        content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.',
        tags: []
      }]
    },
    'relations.13 - eager loads "hasMany" -> "hasMany"': {
      mysql: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          ownPosts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          }]
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          ownPosts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }]
        }]
      },
      postgres: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          ownPosts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          }]
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          ownPosts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }]
        }]
      },
      sqlite3: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          ownPosts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          }]
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          ownPosts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }]
        }]
      }
    },
    'relations.14 - eager loads "hasMany" -> "belongsToMany"': {
      mysql: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          posts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
            _pivot_author_id: 1,
            _pivot_post_id: 1
          }]
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          posts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
            _pivot_author_id: 2,
            _pivot_post_id: 1
          },{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.',
            _pivot_author_id: 2,
            _pivot_post_id: 2
          }]
        }]
      },
      postgres: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          posts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
            _pivot_author_id: 1,
            _pivot_post_id: 1
          }]
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          posts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
            _pivot_author_id: 2,
            _pivot_post_id: 1
          },{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.',
            _pivot_author_id: 2,
            _pivot_post_id: 2
          }]
        }]
      },
      sqlite3: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          posts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
            _pivot_author_id: 1,
            _pivot_post_id: 1
          }]
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          posts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.',
            _pivot_author_id: 2,
            _pivot_post_id: 2
          },{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
            _pivot_author_id: 2,
            _pivot_post_id: 1
          }]
        }]
      }
    },
    'relations.15 - does multi deep eager loads': {
      mysql: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          ownPosts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          }],
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          ownPosts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }],
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        }],
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          posts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }]
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog',
          posts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          }]
        }]
      },
      postgres: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          ownPosts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          }],
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          ownPosts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }],
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        }],
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          posts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }]
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog',
          posts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          }]
        }]
      },
      sqlite3: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          ownPosts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          }],
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          ownPosts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }],
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        }],
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          posts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }]
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog',
          posts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          }]
        }]
      }
    },
    'relations.16 - eager loads "hasMany" -> "hasMany"': {
      mysql: [{
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          ownPosts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          }]
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          ownPosts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }]
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        authors: [{
          id: 3,
          site_id: 2,
          first_name: 'Charlie',
          last_name: 'Brown',
          ownPosts: [{
            id: 4,
            owner_id: 3,
            blog_id: 3,
            name: 'This is a new Title 4!',
            content: 'Lorem ipsum Anim sed eu sint aute.'
          }]
        },{
          id: 4,
          site_id: 2,
          first_name: 'Ron',
          last_name: 'Burgundy',
          ownPosts: [{
            id: 5,
            owner_id: 4,
            blog_id: 4,
            name: 'This is a new Title 5!',
            content: 'Lorem ipsum Commodo consectetur eu ea amet laborum nulla eiusmod minim veniam ullamco nostrud sed mollit consectetur veniam mollit Excepteur quis cupidatat.'
          }]
        }]
      }],
      postgres: [{
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          ownPosts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          }]
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          ownPosts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }]
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        authors: [{
          id: 3,
          site_id: 2,
          first_name: 'Charlie',
          last_name: 'Brown',
          ownPosts: [{
            id: 4,
            owner_id: 3,
            blog_id: 3,
            name: 'This is a new Title 4!',
            content: 'Lorem ipsum Anim sed eu sint aute.'
          }]
        },{
          id: 4,
          site_id: 2,
          first_name: 'Ron',
          last_name: 'Burgundy',
          ownPosts: [{
            id: 5,
            owner_id: 4,
            blog_id: 4,
            name: 'This is a new Title 5!',
            content: 'Lorem ipsum Commodo consectetur eu ea amet laborum nulla eiusmod minim veniam ullamco nostrud sed mollit consectetur veniam mollit Excepteur quis cupidatat.'
          }]
        }]
      }],
      sqlite3: [{
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          ownPosts: [{
            id: 1,
            owner_id: 1,
            blog_id: 1,
            name: 'This is a new Title!',
            content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.'
          }]
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          ownPosts: [{
            id: 2,
            owner_id: 2,
            blog_id: 2,
            name: 'This is a new Title 2!',
            content: 'Lorem ipsum Veniam ex amet occaecat dolore in pariatur minim est exercitation deserunt Excepteur enim officia occaecat in exercitation aute et ad esse ex in in dolore amet consequat quis sed mollit et id incididunt sint dolore velit officia dolor dolore laboris dolor Duis ea ex quis deserunt anim nisi qui culpa laboris nostrud Duis anim deserunt esse laboris nulla qui in dolor voluptate aute reprehenderit amet ut et non voluptate elit irure mollit dolor consectetur nisi adipisicing commodo et mollit dolore incididunt cupidatat nulla ut irure deserunt non officia laboris fugiat ut pariatur ut non aliqua eiusmod dolor et nostrud minim elit occaecat commodo consectetur cillum elit laboris mollit dolore amet id qui eiusmod nulla elit eiusmod est ad aliqua aute enim ut aliquip ex in Ut nisi sint exercitation est mollit veniam cupidatat adipisicing occaecat dolor irure in aute aliqua ullamco.'
          },{
            id: 3,
            owner_id: 2,
            blog_id: 1,
            name: 'This is a new Title 3!',
            content: 'Lorem ipsum Reprehenderit esse esse consectetur aliquip magna.'
          }]
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        authors: [{
          id: 3,
          site_id: 2,
          first_name: 'Charlie',
          last_name: 'Brown',
          ownPosts: [{
            id: 4,
            owner_id: 3,
            blog_id: 3,
            name: 'This is a new Title 4!',
            content: 'Lorem ipsum Anim sed eu sint aute.'
          }]
        },{
          id: 4,
          site_id: 2,
          first_name: 'Ron',
          last_name: 'Burgundy',
          ownPosts: [{
            id: 5,
            owner_id: 4,
            blog_id: 4,
            name: 'This is a new Title 5!',
            content: 'Lorem ipsum Commodo consectetur eu ea amet laborum nulla eiusmod minim veniam ullamco nostrud sed mollit consectetur veniam mollit Excepteur quis cupidatat.'
          }]
        }]
      }]
    },
    'relations.17 - eager loads relations on a populated model': {
      mysql: {
        id: 1,
        name: 'knexjs.org',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }],
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        }]
      },
      postgres: {
        id: 1,
        name: 'knexjs.org',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }],
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        }]
      },
      sqlite3: {
        id: 1,
        name: 'knexjs.org',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }],
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        }]
      }
    },
    'relations.18 - eager loads attributes on a collection': {
      mysql: [{
        id: 1,
        name: 'knexjs.org',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }],
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        blogs: [{
          id: 3,
          site_id: 2,
          name: 'Main Site Blog'
        },{
          id: 4,
          site_id: 2,
          name: 'Alternate Site Blog'
        }],
        authors: [{
          id: 3,
          site_id: 2,
          first_name: 'Charlie',
          last_name: 'Brown',
          site: {
            id: 2,
            name: 'bookshelfjs.org'
          }
        },{
          id: 4,
          site_id: 2,
          first_name: 'Ron',
          last_name: 'Burgundy',
          site: {
            id: 2,
            name: 'bookshelfjs.org'
          }
        }]
      }],
      postgres: [{
        id: 1,
        name: 'knexjs.org',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }],
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        blogs: [{
          id: 3,
          site_id: 2,
          name: 'Main Site Blog'
        },{
          id: 4,
          site_id: 2,
          name: 'Alternate Site Blog'
        }],
        authors: [{
          id: 3,
          site_id: 2,
          first_name: 'Charlie',
          last_name: 'Brown',
          site: {
            id: 2,
            name: 'bookshelfjs.org'
          }
        },{
          id: 4,
          site_id: 2,
          first_name: 'Ron',
          last_name: 'Burgundy',
          site: {
            id: 2,
            name: 'bookshelfjs.org'
          }
        }]
      }],
      sqlite3: [{
        id: 1,
        name: 'knexjs.org',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog'
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog'
        }],
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe',
          site: {
            id: 1,
            name: 'knexjs.org'
          }
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        blogs: [{
          id: 3,
          site_id: 2,
          name: 'Main Site Blog'
        },{
          id: 4,
          site_id: 2,
          name: 'Alternate Site Blog'
        }],
        authors: [{
          id: 3,
          site_id: 2,
          first_name: 'Charlie',
          last_name: 'Brown',
          site: {
            id: 2,
            name: 'bookshelfjs.org'
          }
        },{
          id: 4,
          site_id: 2,
          first_name: 'Ron',
          last_name: 'Burgundy',
          site: {
            id: 2,
            name: 'bookshelfjs.org'
          }
        }]
      }]
    },
    'relations.19 - works with many-to-many': {
      mysql: [{
        rid: 1,
        name: 'admin',
        _pivot_uid: 1,
        _pivot_rid: 1
      }],
      postgres: [{
        rid: 1,
        name: 'admin',
        _pivot_uid: 1,
        _pivot_rid: 1
      }],
      sqlite3: [{
        rid: 1,
        name: 'admin',
        _pivot_uid: 1,
        _pivot_rid: 1
      }]
    },
    'relations.20 - works with eager loaded many-to-many': {
      mysql: {
        uid: 1,
        username: 'root',
        roles: [{
          rid: 1,
          name: 'admin',
          _pivot_uid: 1,
          _pivot_rid: 1
        }]
      },
      postgres: {
        uid: 1,
        username: 'root',
        roles: [{
          rid: 1,
          name: 'admin',
          _pivot_uid: 1,
          _pivot_rid: 1
        }]
      },
      sqlite3: {
        uid: 1,
        username: 'root',
        roles: [{
          rid: 1,
          name: 'admin',
          _pivot_uid: 1,
          _pivot_rid: 1
        }]
      }
    }
  }
}