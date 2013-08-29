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
    'relations.1 - handles belongsTo (blog, site)': {
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
    'relations.2 - handles hasMany (posts)': {
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
    'relations.3 - handles hasOne (meta)': {
      mysql: {
        id: 1,
        site_id: 1,
        description: 'This is a description for the Knexjs Site'
      },
      postgres: {
        id: 1,
        site_id: 1,
        description: 'This is a description for the Knexjs Site'
      },
      sqlite3: {
        id: 1,
        site_id: 1,
        description: 'This is a description for the Knexjs Site'
      }
    },
    'relations.4 - handles belongsToMany (posts)': {
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
    'relations.5 - eager loads "hasOne" relationships correctly (site -> meta)': {
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
    'relations.6 - eager loads "hasMany" relationships correctly (site -> authors, blogs)': {
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
          last_name: 'Griesser'
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe'
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
    'relations.7 - eager loads "belongsTo" relationships correctly (blog -> site)': {
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
    'relations.8 - eager loads "belongsToMany" models correctly (post -> tags)': {
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
    'relations.9 - Attaches an empty related model or collection if the `EagerRelation` comes back blank': {
      mysql: {
        id: 3,
        name: 'backbonejs.org',
        meta: {
        
        },
        blogs: [],
        authors: []
      },
      postgres: {
        id: 3,
        name: 'backbonejs.org',
        meta: {
        
        },
        authors: [],
        blogs: []
      },
      sqlite3: {
        id: 3,
        name: 'backbonejs.org',
        meta: {
        
        },
        blogs: [],
        authors: []
      }
    },
    'relations.10 - eager loads "hasOne" models correctly (sites -> meta)': {
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
      },{
        id: 3,
        name: 'backbonejs.org',
        meta: {
        
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
      },{
        id: 3,
        name: 'backbonejs.org',
        meta: {
        
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
      },{
        id: 3,
        name: 'backbonejs.org',
        meta: {
        
        }
      }]
    },
    'relations.11 - eager loads "belongsTo" models correctly (blogs -> site)': {
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
    'relations.12 - eager loads "hasMany" models correctly (site -> blogs)': {
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
    'relations.13 - eager loads "belongsToMany" models correctly (posts -> tags)': {
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
    'relations.14 - eager loads "hasMany" -> "hasMany" (site -> authors.ownPosts)': {
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
    'relations.15 - eager loads "hasMany" -> "belongsToMany" (site -> authors.posts)': {
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
    'relations.16 - does multi deep eager loads (site -> authors.ownPosts, authors.site, blogs.posts)': {
      mysql: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser',
          site: {
            id: 1,
            name: 'knexjs.org'
          },
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
          site: {
            id: 1,
            name: 'knexjs.org'
          },
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
          site: {
            id: 1,
            name: 'knexjs.org'
          },
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
          site: {
            id: 1,
            name: 'knexjs.org'
          },
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
    'relations.17 - eager loads "hasMany" -> "hasMany" (sites -> authors.ownPosts)': {
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
      },{
        id: 3,
        name: 'backbonejs.org',
        authors: []
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
      },{
        id: 3,
        name: 'backbonejs.org',
        authors: []
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
      },{
        id: 3,
        name: 'backbonejs.org',
        authors: []
      }]
    },
    'relations.18 - eager loads relations on a populated model (site -> blogs, authors.site)': {
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
    'relations.19 - eager loads attributes on a collection (sites -> blogs, authors.site)': {
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
      },{
        id: 3,
        name: 'backbonejs.org',
        blogs: [],
        authors: []
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
      },{
        id: 3,
        name: 'backbonejs.org',
        blogs: [],
        authors: []
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
      },{
        id: 3,
        name: 'backbonejs.org',
        blogs: [],
        authors: []
      }]
    },
    'relations.20 - works with many-to-many (user -> roles)': {
      mysql: [{
        rid: 4,
        name: 'admin',
        _pivot_uid: 1,
        _pivot_rid: 4
      }],
      postgres: [{
        rid: 4,
        name: 'admin',
        _pivot_uid: 1,
        _pivot_rid: 4
      }],
      sqlite3: [{
        rid: 4,
        name: 'admin',
        _pivot_uid: 1,
        _pivot_rid: 4
      }]
    },
    'relations.21 - works with eager loaded many-to-many (user -> roles)': {
      mysql: {
        uid: 1,
        username: 'root',
        roles: [{
          rid: 4,
          name: 'admin',
          _pivot_uid: 1,
          _pivot_rid: 4
        }]
      },
      postgres: {
        uid: 1,
        username: 'root',
        roles: [{
          rid: 4,
          name: 'admin',
          _pivot_uid: 1,
          _pivot_rid: 4
        }]
      },
      sqlite3: {
        uid: 1,
        username: 'root',
        roles: [{
          rid: 4,
          name: 'admin',
          _pivot_uid: 1,
          _pivot_rid: 4
        }]
      }
    },
    'relations.22 - handles morphOne (photo)': {
      mysql: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'authors'
      },
      postgres: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'authors'
      },
      sqlite3: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'authors'
      }
    },
    'relations.23 - handles morphMany (photo)': {
      mysql: [{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites'
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites'
      }],
      postgres: [{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites'
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites'
      }],
      sqlite3: [{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites'
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites'
      }]
    },
    'relations.24 - handles morphTo (imageable "authors")': {
      mysql: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      },
      postgres: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      },
      sqlite3: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      }
    },
    'relations.25 - handles morphTo (imageable "sites")': {
      mysql: {
        id: 1,
        name: 'knexjs.org'
      },
      postgres: {
        id: 1,
        name: 'knexjs.org'
      },
      sqlite3: {
        id: 1,
        name: 'knexjs.org'
      }
    },
    'relations.26 - eager loads morphMany (sites -> photos)': {
      mysql: [{
        id: 1,
        name: 'knexjs.org',
        photos: [{
          id: 3,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 1,
          imageable_type: 'sites'
        },{
          id: 4,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 1,
          imageable_type: 'sites'
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        photos: [{
          id: 5,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 2,
          imageable_type: 'sites'
        },{
          id: 6,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 2,
          imageable_type: 'sites'
        }]
      },{
        id: 3,
        name: 'backbonejs.org',
        photos: []
      }],
      postgres: [{
        id: 1,
        name: 'knexjs.org',
        photos: [{
          id: 3,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 1,
          imageable_type: 'sites'
        },{
          id: 4,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 1,
          imageable_type: 'sites'
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        photos: [{
          id: 5,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 2,
          imageable_type: 'sites'
        },{
          id: 6,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 2,
          imageable_type: 'sites'
        }]
      },{
        id: 3,
        name: 'backbonejs.org',
        photos: []
      }],
      sqlite3: [{
        id: 1,
        name: 'knexjs.org',
        photos: [{
          id: 3,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 1,
          imageable_type: 'sites'
        },{
          id: 4,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 1,
          imageable_type: 'sites'
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        photos: [{
          id: 5,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 2,
          imageable_type: 'sites'
        },{
          id: 6,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          imageable_id: 2,
          imageable_type: 'sites'
        }]
      },{
        id: 3,
        name: 'backbonejs.org',
        photos: []
      }]
    },
    'relations.27 - eager loads morphTo (photos -> imageable)': {
      mysql: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'authors',
        imageable: {
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser'
        }
      },{
        id: 2,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'authors',
        imageable: {
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe'
        }
      },{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }],
      postgres: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'authors',
        imageable: {
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser'
        }
      },{
        id: 2,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'authors',
        imageable: {
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe'
        }
      },{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }],
      sqlite3: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'authors',
        imageable: {
          id: 1,
          site_id: 1,
          first_name: 'Tim',
          last_name: 'Griesser'
        }
      },{
        id: 2,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'authors',
        imageable: {
          id: 2,
          site_id: 1,
          first_name: 'Bazooka',
          last_name: 'Joe'
        }
      },{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }]
    },
    'relations.28 - handles hasMany `through`': {
      mysql: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        _pivot_id: 1,
        _pivot_blog_id: 1
      }],
      postgres: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        _pivot_id: 1,
        _pivot_blog_id: 1
      }],
      sqlite3: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        _pivot_id: 1,
        _pivot_blog_id: 1
      }]
    },
    'relations.29 - eager loads hasMany `through`': {
      mysql: [{
        id: 1,
        site_id: 1,
        name: 'Main Site Blog',
        comments: [{
          id: 1,
          post_id: 1,
          name: '(blank)',
          email: 'test@example.com',
          comment: 'this is neat.',
          _pivot_id: 1,
          _pivot_blog_id: 1
        }]
      },{
        id: 2,
        site_id: 1,
        name: 'Alternate Site Blog',
        comments: []
      }],
      postgres: [{
        id: 1,
        site_id: 1,
        name: 'Main Site Blog',
        comments: [{
          id: 1,
          post_id: 1,
          name: '(blank)',
          email: 'test@example.com',
          comment: 'this is neat.',
          _pivot_id: 1,
          _pivot_blog_id: 1
        }]
      },{
        id: 2,
        site_id: 1,
        name: 'Alternate Site Blog',
        comments: []
      }],
      sqlite3: [{
        id: 1,
        site_id: 1,
        name: 'Main Site Blog',
        comments: [{
          id: 1,
          post_id: 1,
          name: '(blank)',
          email: 'test@example.com',
          comment: 'this is neat.',
          _pivot_id: 1,
          _pivot_blog_id: 1
        }]
      },{
        id: 2,
        site_id: 1,
        name: 'Alternate Site Blog',
        comments: []
      }]
    },
    'relations.30 - handles hasOne `through`': {
      mysql: {
        id: 1,
        meta_id: 1,
        other_description: 'This is an info block for hasOne -> through test',
        _pivot_id: 1,
        _pivot_site_id: 1
      },
      postgres: {
        id: 1,
        meta_id: 1,
        other_description: 'This is an info block for hasOne -> through test',
        _pivot_id: 1,
        _pivot_site_id: 1
      },
      sqlite3: {
        id: 1,
        meta_id: 1,
        other_description: 'This is an info block for hasOne -> through test',
        _pivot_id: 1,
        _pivot_site_id: 1
      }
    },
    'relations.31 - eager loads hasOne `through`': {
      mysql: [{
        id: 1,
        name: 'knexjs.org',
        info: {
          id: 1,
          meta_id: 1,
          other_description: 'This is an info block for hasOne -> through test',
          _pivot_id: 1,
          _pivot_site_id: 1
        }
      },{
        id: 2,
        name: 'bookshelfjs.org',
        info: {
          id: 2,
          meta_id: 2,
          other_description: 'This is an info block for an eager hasOne -> through test',
          _pivot_id: 2,
          _pivot_site_id: 2
        }
      }],
      postgres: [{
        id: 1,
        name: 'knexjs.org',
        info: {
          id: 1,
          meta_id: 1,
          other_description: 'This is an info block for hasOne -> through test',
          _pivot_id: 1,
          _pivot_site_id: 1
        }
      },{
        id: 2,
        name: 'bookshelfjs.org',
        info: {
          id: 2,
          meta_id: 2,
          other_description: 'This is an info block for an eager hasOne -> through test',
          _pivot_id: 2,
          _pivot_site_id: 2
        }
      }],
      sqlite3: [{
        id: 1,
        name: 'knexjs.org',
        info: {
          id: 1,
          meta_id: 1,
          other_description: 'This is an info block for hasOne -> through test',
          _pivot_id: 1,
          _pivot_site_id: 1
        }
      },{
        id: 2,
        name: 'bookshelfjs.org',
        info: {
          id: 2,
          meta_id: 2,
          other_description: 'This is an info block for an eager hasOne -> through test',
          _pivot_id: 2,
          _pivot_site_id: 2
        }
      }]
    },
    'relations.32 - eager loads belongsToMany `through`': {
      mysql: [{
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          _pivot_id: 1,
          _pivot_owner_id: 1,
          _pivot_blog_id: 1
        }]
      },{
        id: 2,
        site_id: 1,
        first_name: 'Bazooka',
        last_name: 'Joe',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          _pivot_id: 3,
          _pivot_owner_id: 2,
          _pivot_blog_id: 1
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog',
          _pivot_id: 2,
          _pivot_owner_id: 2,
          _pivot_blog_id: 2
        }]
      },{
        id: 3,
        site_id: 2,
        first_name: 'Charlie',
        last_name: 'Brown',
        blogs: [{
          id: 3,
          site_id: 2,
          name: 'Main Site Blog',
          _pivot_id: 4,
          _pivot_owner_id: 3,
          _pivot_blog_id: 3
        }]
      },{
        id: 4,
        site_id: 2,
        first_name: 'Ron',
        last_name: 'Burgundy',
        blogs: [{
          id: 4,
          site_id: 2,
          name: 'Alternate Site Blog',
          _pivot_id: 5,
          _pivot_owner_id: 4,
          _pivot_blog_id: 4
        }]
      }],
      postgres: [{
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          _pivot_id: 1,
          _pivot_owner_id: 1,
          _pivot_blog_id: 1
        }]
      },{
        id: 2,
        site_id: 1,
        first_name: 'Bazooka',
        last_name: 'Joe',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          _pivot_id: 3,
          _pivot_owner_id: 2,
          _pivot_blog_id: 1
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog',
          _pivot_id: 2,
          _pivot_owner_id: 2,
          _pivot_blog_id: 2
        }]
      },{
        id: 3,
        site_id: 2,
        first_name: 'Charlie',
        last_name: 'Brown',
        blogs: [{
          id: 3,
          site_id: 2,
          name: 'Main Site Blog',
          _pivot_id: 4,
          _pivot_owner_id: 3,
          _pivot_blog_id: 3
        }]
      },{
        id: 4,
        site_id: 2,
        first_name: 'Ron',
        last_name: 'Burgundy',
        blogs: [{
          id: 4,
          site_id: 2,
          name: 'Alternate Site Blog',
          _pivot_id: 5,
          _pivot_owner_id: 4,
          _pivot_blog_id: 4
        }]
      }],
      sqlite3: [{
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          _pivot_id: 1,
          _pivot_owner_id: 1,
          _pivot_blog_id: 1
        }]
      },{
        id: 2,
        site_id: 1,
        first_name: 'Bazooka',
        last_name: 'Joe',
        blogs: [{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog',
          _pivot_id: 2,
          _pivot_owner_id: 2,
          _pivot_blog_id: 2
        },{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          _pivot_id: 3,
          _pivot_owner_id: 2,
          _pivot_blog_id: 1
        }]
      },{
        id: 3,
        site_id: 2,
        first_name: 'Charlie',
        last_name: 'Brown',
        blogs: [{
          id: 3,
          site_id: 2,
          name: 'Main Site Blog',
          _pivot_id: 4,
          _pivot_owner_id: 3,
          _pivot_blog_id: 3
        }]
      },{
        id: 4,
        site_id: 2,
        first_name: 'Ron',
        last_name: 'Burgundy',
        blogs: [{
          id: 4,
          site_id: 2,
          name: 'Alternate Site Blog',
          _pivot_id: 5,
          _pivot_owner_id: 4,
          _pivot_blog_id: 4
        }]
      }]
    }
  }
}