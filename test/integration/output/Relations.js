module.exports = {
  'handles belongsTo (blog, site)': {
    mysql: {
      result: {
        id: 2,
        name: 'bookshelfjs.org'
      }
    },
    postgresql: {
      result: {
        id: 2,
        name: 'bookshelfjs.org'
      }
    },
    sqlite3: {
      result: {
        id: 2,
        name: 'bookshelfjs.org'
      }
    },
    oracle: {
      result: {
        id: 2,
        name: 'bookshelfjs.org'
      }
    }
  },
  'handles hasMany (posts)': {
    mysql: {
      result: [{
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
    postgresql: {
      result: [{
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
    sqlite3: {
      result: [{
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
    oracle: {
      result: [{
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
    }
  },
  'handles hasOne (meta)': {
    mysql: {
      result: {
        id: 1,
        site_id: 1,
        description: 'This is a description for the Knexjs Site'
      }
    },
    postgresql: {
      result: {
        id: 1,
        site_id: 1,
        description: 'This is a description for the Knexjs Site'
      }
    },
    sqlite3: {
      result: {
        id: 1,
        site_id: 1,
        description: 'This is a description for the Knexjs Site'
      }
    },
    oracle: {
      result: {
        id: 1,
        site_id: 1,
        description: 'This is a description for the Knexjs Site'
      }
    }
  },
  'handles belongsToMany (posts)': {
    mysql: {
      result: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        _pivot_author_id: 1,
        _pivot_post_id: 1
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        _pivot_author_id: 1,
        _pivot_post_id: 1
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        _pivot_author_id: 1,
        _pivot_post_id: 1
      }]
    },
    oracle: {
      result: [{
        id: 1,
        owner_id: 1,
        blog_id: 1,
        name: 'This is a new Title!',
        content: 'Lorem ipsum Labore eu sed sed Excepteur enim laboris deserunt adipisicing dolore culpa aliqua cupidatat proident ea et commodo labore est adipisicing ex amet exercitation est.',
        _pivot_author_id: 1,
        _pivot_post_id: 1
      }]
    }
  },
  'eager loads "hasOne" relationships correctly (site -> meta)': {
    mysql: {
      result: {
        id: 1,
        name: 'knexjs.org',
        meta: {
          id: 1,
          site_id: 1,
          description: 'This is a description for the Knexjs Site'
        }
      }
    },
    postgresql: {
      result: {
        id: 1,
        name: 'knexjs.org',
        meta: {
          id: 1,
          site_id: 1,
          description: 'This is a description for the Knexjs Site'
        }
      }
    },
    sqlite3: {
      result: {
        id: 1,
        name: 'knexjs.org',
        meta: {
          id: 1,
          site_id: 1,
          description: 'This is a description for the Knexjs Site'
        }
      }
    },
    oracle: {
      result: {
        id: 1,
        name: 'knexjs.org',
        meta: {
          id: 1,
          site_id: 1,
          description: 'This is a description for the Knexjs Site'
        }
      }
    }
  },
  'eager loads "hasMany" relationships correctly (site -> authors, blogs)': {
    mysql: {
      result: {
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
    postgresql: {
      result: {
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
      }
    },
    sqlite3: {
      result: {
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
    oracle: {
      result: {
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
    }
  },
  'eager loads "belongsTo" relationships correctly (blog -> site)': {
    mysql: {
      result: {
        id: 3,
        site_id: 2,
        name: 'Main Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }
    },
    postgresql: {
      result: {
        id: 3,
        site_id: 2,
        name: 'Main Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }
    },
    sqlite3: {
      result: {
        id: 3,
        site_id: 2,
        name: 'Main Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }
    },
    oracle: {
      result: {
        id: 3,
        site_id: 2,
        name: 'Main Site Blog',
        site: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      }
    }
  },
  'does not load "belongsTo" relationship when foreignKey is null (blog -> site) #1299': {
    mysql: {
      result: {
        id: 5,
        site_id: null,
        name: 'Orphan Blog Without a Site'
      }
    },
    postgresql: {
      result: {
        id: 5,
        site_id: null,
        name: 'Orphan Blog Without a Site'
      }
    },
    sqlite3: {
      result: {
        id: 5,
        site_id: null,
        name: 'Orphan Blog Without a Site'
      }
    },
    oracle: {
      result: {
        id: 5,
        site_id: null,
        name: 'Orphan Blog Without a Site'
      }
    }
  },
  'eager loads "belongsToMany" models correctly (post -> tags)': {
    mysql: {
      result: {
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
    postgresql: {
      result: {
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
    sqlite3: {
      result: {
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
    oracle: {
      result: {
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
    }
  },
  'Attaches an empty related model or collection if the `EagerRelation` comes back blank': {
    mysql: {
      result: {
        id: 3,
        name: 'backbonejs.org',
        meta: {

        },
        blogs: [],
        authors: []
      }
    },
    postgresql: {
      result: {
        id: 3,
        name: 'backbonejs.org',
        meta: {

        },
        authors: [],
        blogs: []
      }
    },
    sqlite3: {
      result: {
        id: 3,
        name: 'backbonejs.org',
        meta: {

        },
        blogs: [],
        authors: []
      }
    },
    oracle: {
      result: {
        id: 3,
        name: 'backbonejs.org',
        meta: {

        },
        blogs: [],
        authors: []
      }
    }
  },
  'maintains eager loaded column specifications, #510': {
    mysql: {
      result: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim'
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka'
        }]
      }
    },
    postgresql: {
      result: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim'
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka'
        }]
      }
    },
    sqlite3: {
      result: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim'
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka'
        }]
      }
    },
    oracle: {
      result: {
        id: 1,
        name: 'knexjs.org',
        authors: [{
          id: 1,
          site_id: 1,
          first_name: 'Tim'
        },{
          id: 2,
          site_id: 1,
          first_name: 'Bazooka'
        }]
      }
    }
  },
  'eager loads "hasOne" models correctly (sites -> meta)': {
    mysql: {
      result: [{
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
    postgresql: {
      result: [{
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
    sqlite3: {
      result: [{
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
    oracle: {
      result: [{
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
    }
  },
  'eager loads "belongsTo" models correctly (blogs -> site) including #1299': {
    mysql: {
      result: [{
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
      },{
        id: 5,
        site_id: null,
        name: 'Orphan Blog Without a Site'
      }]
    },
    postgresql: {
      result: [{
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
      },{
        id: 5,
        site_id: null,
        name: 'Orphan Blog Without a Site'
      }]
    },
    sqlite3: {
      result: [{
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
      },{
        id: 5,
        site_id: null,
        name: 'Orphan Blog Without a Site'
      }]
    },
    oracle: {
      result: [{
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
      },{
        id: 5,
        site_id: null,
        name: 'Orphan Blog Without a Site'
      }]
    }
  },
  'eager loads "hasMany" models correctly (site -> blogs)': {
    mysql: {
      result: {
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
    postgresql: {
      result: {
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
    sqlite3: {
      result: {
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
    oracle: {
      result: {
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
    }
  },
  'eager loads "belongsToMany" models correctly (posts -> tags)': {
    mysql: {
      result: [{
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
    postgresql: {
      result: [{
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
    sqlite3: {
      result: [{
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
    oracle: {
      result: [{
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
    }
  },
  'eager loads "hasMany" -> "hasMany" (site -> authors.ownPosts)': {
    mysql: {
      result: {
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
    postgresql: {
      result: {
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
    sqlite3: {
      result: {
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
    oracle: {
      result: {
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
    }
  },
  'eager loads "hasMany" -> "belongsToMany" (site -> authors.posts)': {
    mysql: {
      result: {
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
      }
    },
    postgresql: {
      result: {
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
      }
    },
    sqlite3: {
      result: {
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
      }
    },
    oracle: {
      result: {
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
      }
    }
  },
  'does multi deep eager loads (site -> authors.ownPosts, authors.site, blogs.posts)': {
    mysql: {
      result: {
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
    postgresql: {
      result: {
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
      }
    },
    sqlite3: {
      result: {
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
    oracle: {
      result: {
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
    }
  },
  'eager loads "hasMany" -> "hasMany" (sites -> authors.ownPosts)': {
    mysql: {
      result: [{
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
    postgresql: {
      result: [{
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
    sqlite3: {
      result: [{
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
    oracle: {
      result: [{
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
    }
  },
  'eager loads relations on a populated model (site -> blogs, authors.site)': {
    mysql: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    },
    postgresql: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    },
    sqlite3: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    },
    oracle: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    }
  },
  'eager loads attributes on a collection (sites -> blogs, authors.site)': {
    mysql: {
      result: [{
        id: 1,
        name: 'knexjs.org'
      },{
        id: 2,
        name: 'bookshelfjs.org'
      },{
        id: 3,
        name: 'backbonejs.org'
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        name: 'knexjs.org'
      },{
        id: 2,
        name: 'bookshelfjs.org'
      },{
        id: 3,
        name: 'backbonejs.org'
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        name: 'knexjs.org'
      },{
        id: 2,
        name: 'bookshelfjs.org'
      },{
        id: 3,
        name: 'backbonejs.org'
      }]
    },
    oracle: {
      result: [{
        id: 1,
        name: 'knexjs.org'
      },{
        id: 2,
        name: 'bookshelfjs.org'
      },{
        id: 3,
        name: 'backbonejs.org'
      }]
    }
  },
  'works with many-to-many (user -> roles)': {
    mysql: {
      result: [{
        rid: 4,
        name: 'admin',
        _pivot_uid: 1,
        _pivot_rid: 4
      }]
    },
    postgresql: {
      result: [{
        rid: 4,
        name: 'admin',
        _pivot_uid: 1,
        _pivot_rid: 4
      }]
    },
    sqlite3: {
      result: [{
        rid: 4,
        name: 'admin',
        _pivot_uid: 1,
        _pivot_rid: 4
      }]
    },
    oracle: {
      result: [{
        rid: 4,
        name: 'admin',
        _pivot_uid: 1,
        _pivot_rid: 4
      }]
    }
  },
  'works with eager loaded many-to-many (user -> roles)': {
    mysql: {
      result: {
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
    postgresql: {
      result: {
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
    sqlite3: {
      result: {
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
    oracle: {
      result: {
        uid: 1,
        username: 'root',
        roles: [{
          rid: 4,
          name: 'admin',
          _pivot_uid: 1,
          _pivot_rid: 4
        }]
      }
    }
  },
  'handles morphOne (photo)': {
    mysql: {
      result: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic'
      }
    },
    postgresql: {
      result: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic'
      }
    },
    sqlite3: {
      result: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic'
      }
    },
    oracle: {
      result: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic'
      }
    }
  },
  'handles morphMany (photo)': {
    mysql: {
      result: [{
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
    postgresql: {
      result: [{
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
    sqlite3: {
      result: [{
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
    oracle: {
      result: [{
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
    }
  },
  'handles morphTo with custom morphValue (imageable "authors")': {
    mysql: {
      result: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      }
    },
    postgresql: {
      result: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      }
    },
    sqlite3: {
      result: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      }
    },
    oracle: {
      result: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      }
    }
  },
  'handles morphTo (imageble "authors", PhotoParsed)': {
    mysql: {
      result: {
        id_parsed: 1,
        site_id_parsed: 1,
        first_name_parsed: 'Tim',
        last_name_parsed: 'Griesser'
      }
    },
    postgresql: {
      result: {
        id_parsed: 1,
        site_id_parsed: 1,
        first_name_parsed: 'Tim',
        last_name_parsed: 'Griesser'
      }
    },
    sqlite3: {
      result: {
        id_parsed: 1,
        site_id_parsed: 1,
        first_name_parsed: 'Tim',
        last_name_parsed: 'Griesser'
      }
    },
    oracle: {
      result: {
        id_parsed: 1,
        site_id_parsed: 1,
        first_name_parsed: 'Tim',
        last_name_parsed: 'Griesser'
      }
    }
  },
  'has no side effects for morphTo (imageable "authors", PhotoParsed)': {
    mysql: {
      result: {
        imageable_id_parsed: 1,
        imageable_type_parsed: 'profile_pic',
        id_parsed: 1,
        url_parsed: 'https://www.google.com/images/srpr/logo4w.png',
        caption_parsed: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.'
      }
    },
    postgresql: {
      result: {
        imageable_id_parsed: 1,
        imageable_type_parsed: 'profile_pic',
        id_parsed: 1,
        url_parsed: 'https://www.google.com/images/srpr/logo4w.png',
        caption_parsed: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.'
      }
    },
    sqlite3: {
      result: {
        imageable_id_parsed: 1,
        imageable_type_parsed: 'profile_pic',
        id_parsed: 1,
        url_parsed: 'https://www.google.com/images/srpr/logo4w.png',
        caption_parsed: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.'
      }
    },
    oracle: {
      result: {
        imageable_id_parsed: 1,
        imageable_type_parsed: 'profile_pic',
        id_parsed: 1,
        url_parsed: 'https://www.google.com/images/srpr/logo4w.png',
        caption_parsed: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.'
      }
    }
  },
  'handles morphTo (imageable "sites")': {
    mysql: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    },
    postgresql: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    },
    sqlite3: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    },
    oracle: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    }
  },
  'eager loads morphMany (sites -> photos)': {
    mysql: {
      result: [{
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
    postgresql: {
      result: [{
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
    sqlite3: {
      result: [{
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
    oracle: {
      result: [{
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
    }
  },
  'eager loads morphTo (photos -> imageable)': {
    mysql: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
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
        imageable_type: 'profile_pic',
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
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageable: {

        }
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
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
        imageable_type: 'profile_pic',
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
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageable: {

        }
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
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
        imageable_type: 'profile_pic',
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
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageable: {

        }
      }]
    },
    oracle: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
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
        imageable_type: 'profile_pic',
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
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageable: {

        }
      }]
    }
  },
  'eager loads beyond the morphTo, where possible': {
    mysql: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
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
        imageable_type: 'profile_pic',
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
          }]
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageable: {

        }
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
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
        imageable_type: 'profile_pic',
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
          }]
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageable: {

        }
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
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
        imageable_type: 'profile_pic',
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
          }]
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageable: {

        }
      }]
    },
    oracle: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
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
        imageable_type: 'profile_pic',
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
          }]
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageable: {

        }
      }]
    }
  },
  'handles morphOne with custom columnNames (thumbnail)': {
    mysql: {
      result: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors'
      }
    },
    postgresql: {
      result: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors'
      }
    },
    sqlite3: {
      result: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors'
      }
    },
    oracle: {
      result: {
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors'
      }
    }
  },
  'handles morphMany with custom columnNames (thumbnail)': {
    mysql: {
      result: [{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites'
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites'
      }]
    },
    postgresql: {
      result: [{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites'
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites'
      }]
    },
    sqlite3: {
      result: [{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites'
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites'
      }]
    },
    oracle: {
      result: [{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites'
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites'
      }]
    }
  },
  'handles morphTo with custom columnNames (imageable "authors")': {
    mysql: {
      result: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      }
    },
    postgresql: {
      result: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      }
    },
    sqlite3: {
      result: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      }
    },
    oracle: {
      result: {
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser'
      }
    }
  },
  'handles morphTo with custom columnNames (imageable "sites")': {
    mysql: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    },
    postgresql: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    },
    sqlite3: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    },
    oracle: {
      result: {
        id: 1,
        name: 'knexjs.org'
      }
    }
  },
  'eager loads morphMany with custom columnNames (sites -> thumbnails)': {
    mysql: {
      result: [{
        id: 1,
        name: 'knexjs.org',
        thumbnails: [{
          id: 3,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 1,
          ImageableType: 'sites'
        },{
          id: 4,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 1,
          ImageableType: 'sites'
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        thumbnails: [{
          id: 5,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 2,
          ImageableType: 'sites'
        },{
          id: 6,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 2,
          ImageableType: 'sites'
        }]
      },{
        id: 3,
        name: 'backbonejs.org',
        thumbnails: []
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        name: 'knexjs.org',
        thumbnails: [{
          id: 3,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 1,
          ImageableType: 'sites'
        },{
          id: 4,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 1,
          ImageableType: 'sites'
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        thumbnails: [{
          id: 5,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 2,
          ImageableType: 'sites'
        },{
          id: 6,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 2,
          ImageableType: 'sites'
        }]
      },{
        id: 3,
        name: 'backbonejs.org',
        thumbnails: []
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        name: 'knexjs.org',
        thumbnails: [{
          id: 3,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 1,
          ImageableType: 'sites'
        },{
          id: 4,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 1,
          ImageableType: 'sites'
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        thumbnails: [{
          id: 5,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 2,
          ImageableType: 'sites'
        },{
          id: 6,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 2,
          ImageableType: 'sites'
        }]
      },{
        id: 3,
        name: 'backbonejs.org',
        thumbnails: []
      }]
    },
    oracle: {
      result: [{
        id: 1,
        name: 'knexjs.org',
        thumbnails: [{
          id: 3,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 1,
          ImageableType: 'sites'
        },{
          id: 4,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 1,
          ImageableType: 'sites'
        }]
      },{
        id: 2,
        name: 'bookshelfjs.org',
        thumbnails: [{
          id: 5,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 2,
          ImageableType: 'sites'
        },{
          id: 6,
          url: 'https://www.google.com/images/srpr/logo4w.png',
          caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
          ImageableId: 2,
          ImageableType: 'sites'
        }]
      },{
        id: 3,
        name: 'backbonejs.org',
        thumbnails: []
      }]
    }
  },
  'eager loads morphTo with custom columnNames (thumbnails -> imageable)': {
    mysql: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors',
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
        ImageableId: 2,
        ImageableType: 'authors',
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
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        ImageableId: 10,
        ImageableType: 'sites',
        imageable: {

        }
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors',
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
        ImageableId: 2,
        ImageableType: 'authors',
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
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        ImageableId: 10,
        ImageableType: 'sites',
        imageable: {

        }
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors',
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
        ImageableId: 2,
        ImageableType: 'authors',
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
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        ImageableId: 10,
        ImageableType: 'sites',
        imageable: {

        }
      }]
    },
    oracle: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors',
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
        ImageableId: 2,
        ImageableType: 'authors',
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
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
          id: 1,
          name: 'knexjs.org'
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org'
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        ImageableId: 10,
        ImageableType: 'sites',
        imageable: {

        }
      }]
    }
  },
  'eager loads beyond the morphTo with custom columnNames, where possible': {
    mysql: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors',
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
        ImageableId: 2,
        ImageableType: 'authors',
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
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        ImageableId: 10,
        ImageableType: 'sites',
        imageable: {

        }
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors',
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
        ImageableId: 2,
        ImageableType: 'authors',
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
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        ImageableId: 10,
        ImageableType: 'sites',
        imageable: {

        }
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors',
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
        ImageableId: 2,
        ImageableType: 'authors',
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
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        ImageableId: 10,
        ImageableType: 'sites',
        imageable: {

        }
      }]
    },
    oracle: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'authors',
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
        ImageableId: 2,
        ImageableType: 'authors',
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
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 1,
        ImageableType: 'sites',
        imageable: {
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
          }]
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        ImageableId: 2,
        ImageableType: 'sites',
        imageable: {
          id: 2,
          name: 'bookshelfjs.org',
          authors: [{
            id: 3,
            site_id: 2,
            first_name: 'Charlie',
            last_name: 'Brown'
          },{
            id: 4,
            site_id: 2,
            first_name: 'Ron',
            last_name: 'Burgundy'
          }]
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        ImageableId: 10,
        ImageableType: 'sites',
        imageable: {

        }
      }]
    }
  },
  'handles hasMany `through`': {
    mysql: {
      result: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        _pivot_id: 1,
        _pivot_blog_id: 1
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        _pivot_id: 1,
        _pivot_blog_id: 1
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        _pivot_id: 1,
        _pivot_blog_id: 1
      }]
    },
    oracle: {
      result: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        _pivot_id: 1,
        _pivot_blog_id: 1
      }]
    }
  },
  'eager loads hasMany `through`': {
    mysql: {
      result: [{
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
    postgresql: {
      result: [{
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
    sqlite3: {
      result: [{
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
    oracle: {
      result: [{
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
    }
  },
  'eager loads hasMany `through` using where / fetchAll': {
    mysql: {
      result: [{
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
    postgresql: {
      result: [{
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
    sqlite3: {
      result: [{
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
    oracle: {
      result: [{
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
    }
  },
  'handles hasOne `through`': {
    mysql: {
      result: {
        id: 1,
        meta_id: 1,
        other_description: 'This is an info block for hasOne -> through test',
        _pivot_id: 1,
        _pivot_site_id: 1
      }
    },
    postgresql: {
      result: {
        id: 1,
        meta_id: 1,
        other_description: 'This is an info block for hasOne -> through test',
        _pivot_id: 1,
        _pivot_site_id: 1
      }
    },
    sqlite3: {
      result: {
        id: 1,
        meta_id: 1,
        other_description: 'This is an info block for hasOne -> through test',
        _pivot_id: 1,
        _pivot_site_id: 1
      }
    },
    oracle: {
      result: {
        id: 1,
        meta_id: 1,
        other_description: 'This is an info block for hasOne -> through test',
        _pivot_id: 1,
        _pivot_site_id: 1
      }
    }
  },
  'eager loads hasOne `through`': {
    mysql: {
      result: [{
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
    postgresql: {
      result: [{
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
    sqlite3: {
      result: [{
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
    oracle: {
      result: [{
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
    }
  },
  'eager loads belongsToMany `through`': {
    mysql: {
      result: [{
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
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
          _pivot_owner_id: 2,
          _pivot_blog_id: 1
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog',
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
          _pivot_owner_id: 4,
          _pivot_blog_id: 4
        }]
      },{
        id: 5,
        site_id: 99,
        first_name: 'Anonymous',
        last_name: null,
        blogs: []
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
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
          _pivot_owner_id: 2,
          _pivot_blog_id: 1
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog',
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
          _pivot_owner_id: 4,
          _pivot_blog_id: 4
        }]
      },{
        id: 5,
        site_id: 99,
        first_name: 'Anonymous',
        last_name: null,
        blogs: []
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
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
          _pivot_owner_id: 2,
          _pivot_blog_id: 1
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog',
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
          _pivot_owner_id: 4,
          _pivot_blog_id: 4
        }]
      },{
        id: 5,
        site_id: 99,
        first_name: 'Anonymous',
        last_name: null,
        blogs: []
      }]
    },
    oracle: {
      result: [{
        id: 1,
        site_id: 1,
        first_name: 'Tim',
        last_name: 'Griesser',
        blogs: [{
          id: 1,
          site_id: 1,
          name: 'Main Site Blog',
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
          _pivot_owner_id: 2,
          _pivot_blog_id: 1
        },{
          id: 2,
          site_id: 1,
          name: 'Alternate Site Blog',
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
          _pivot_owner_id: 4,
          _pivot_blog_id: 4
        }]
      },{
        id: 5,
        site_id: 99,
        first_name: 'Anonymous',
        last_name: null,
        blogs: []
      }]
    }
  },
  'eager loads belongsTo `through`': {
    mysql: {
      result: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        blog:
        { id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          _pivot_id: 1,
          _pivot_blog_id: 1
        }
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        blog:
        { id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          _pivot_id: 1,
          _pivot_blog_id: 1
        }
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        blog:
        { id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          _pivot_id: 1,
          _pivot_blog_id: 1
        }
      }]
    },
    oracle: {
      result: [{
        id: 1,
        post_id: 1,
        name: '(blank)',
        email: 'test@example.com',
        comment: 'this is neat.',
        blog:
        { id: 1,
          site_id: 1,
          name: 'Main Site Blog',
          _pivot_id: 1,
          _pivot_blog_id: 1
        }
      }]
    }
  },
  '#65 - should eager load correctly for models': {
    mysql: {
      result: {
        hostname: 'google.com',
        instance_id: 3,
        route: null,
        instance: {
          id: 3,
          name: 'search engine'
        }
      }
    },
    postgresql: {
      result: {
        hostname: 'google.com',
        instance_id: 3,
        route: null,
        instance: {
          id: '3',
          name: 'search engine'
        }
      }
    },
    sqlite3: {
      result: {
        hostname: 'google.com',
        instance_id: 3,
        route: null,
        instance: {
          id: 3,
          name: 'search engine'
        }
      }
    },
    oracle: {
      result: {
        hostname: 'google.com',
        instance_id: 3,
        route: null,
        instance: {
          id: 3,
          name: 'search engine'
        }
      }
    }
  },
  '#65 - should eager load correctly for collections': {
    mysql: {
      result: [{
        hostname: 'google.com',
        instance_id: 3,
        route: null,
        instance: {
          id: 3,
          name: 'search engine'
        }
      },{
        hostname: 'apple.com',
        instance_id: 10,
        route: null,
        instance: {
          id: 10,
          name: 'computers'
        }
      }]
    },
    postgresql: {
      result: [{
        hostname: 'google.com',
        instance_id: 3,
        route: null,
        instance: {
          id: '3',
          name: 'search engine'
        }
      },{
        hostname: 'apple.com',
        instance_id: 10,
        route: null,
        instance: {
          id: '10',
          name: 'computers'
        }
      }]
    },
    sqlite3: {
      result: [{
        hostname: 'google.com',
        instance_id: 3,
        route: null,
        instance: {
          id: 3,
          name: 'search engine'
        }
      },{
        hostname: 'apple.com',
        instance_id: 10,
        route: null,
        instance: {
          id: 10,
          name: 'computers'
        }
      }]
    },
    oracle: {
      result: [{
        hostname: 'google.com',
        instance_id: 3,
        route: null,
        instance: {
          id: 3,
          name: 'search engine'
        }
      },{
        hostname: 'apple.com',
        instance_id: 10,
        route: null,
        instance: {
          id: 10,
          name: 'computers'
        }
      }]
    }
  },
  'parses eager-loaded morphTo relations (model)': {
    mysql: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
        imageableParsed: {
          id_parsed: 1,
          site_id_parsed: 1,
          first_name_parsed: 'Tim',
          last_name_parsed: 'Griesser'
        }
      },{
        id: 2,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'profile_pic',
        imageableParsed: {
          id_parsed: 2,
          site_id_parsed: 1,
          first_name_parsed: 'Bazooka',
          last_name_parsed: 'Joe'
        }
      },{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 1,
          name_parsed: 'knexjs.org',
          meta: {
            id: 1,
            site_id: 1,
            description: 'This is a description for the Knexjs Site'
          }
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 1,
          name_parsed: 'knexjs.org',
          meta: {
            id: 1,
            site_id: 1,
            description: 'This is a description for the Knexjs Site'
          }
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 2,
          name_parsed: 'bookshelfjs.org',
          meta: {
            id: 2,
            site_id: 2,
            description: 'This is a description for the Bookshelfjs Site'
          }
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 2,
          name_parsed: 'bookshelfjs.org',
          meta: {
            id: 2,
            site_id: 2,
            description: 'This is a description for the Bookshelfjs Site'
          }
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageableParsed: {

        }
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
        imageableParsed: {
          id_parsed: 1,
          site_id_parsed: 1,
          first_name_parsed: 'Tim',
          last_name_parsed: 'Griesser'
        }
      },{
        id: 2,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'profile_pic',
        imageableParsed: {
          id_parsed: 2,
          site_id_parsed: 1,
          first_name_parsed: 'Bazooka',
          last_name_parsed: 'Joe'
        }
      },{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 1,
          name_parsed: 'knexjs.org',
          meta: {
            id: 1,
            site_id: 1,
            description: 'This is a description for the Knexjs Site'
          }
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 1,
          name_parsed: 'knexjs.org',
          meta: {
            id: 1,
            site_id: 1,
            description: 'This is a description for the Knexjs Site'
          }
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 2,
          name_parsed: 'bookshelfjs.org',
          meta: {
            id: 2,
            site_id: 2,
            description: 'This is a description for the Bookshelfjs Site'
          }
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 2,
          name_parsed: 'bookshelfjs.org',
          meta: {
            id: 2,
            site_id: 2,
            description: 'This is a description for the Bookshelfjs Site'
          }
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageableParsed: {

        }
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
        imageableParsed: {
          id_parsed: 1,
          site_id_parsed: 1,
          first_name_parsed: 'Tim',
          last_name_parsed: 'Griesser'
        }
      },{
        id: 2,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'profile_pic',
        imageableParsed: {
          id_parsed: 2,
          site_id_parsed: 1,
          first_name_parsed: 'Bazooka',
          last_name_parsed: 'Joe'
        }
      },{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 1,
          name_parsed: 'knexjs.org',
          meta: {
            id: 1,
            site_id: 1,
            description: 'This is a description for the Knexjs Site'
          }
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 1,
          name_parsed: 'knexjs.org',
          meta: {
            id: 1,
            site_id: 1,
            description: 'This is a description for the Knexjs Site'
          }
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 2,
          name_parsed: 'bookshelfjs.org',
          meta: {
            id: 2,
            site_id: 2,
            description: 'This is a description for the Bookshelfjs Site'
          }
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 2,
          name_parsed: 'bookshelfjs.org',
          meta: {
            id: 2,
            site_id: 2,
            description: 'This is a description for the Bookshelfjs Site'
          }
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageableParsed: {

        }
      }]
    },
    oracle: {
      result: [{
        id: 1,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'profile_pic',
        imageableParsed: {
          id_parsed: 1,
          site_id_parsed: 1,
          first_name_parsed: 'Tim',
          last_name_parsed: 'Griesser'
        }
      },{
        id: 2,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'profile_pic',
        imageableParsed: {
          id_parsed: 2,
          site_id_parsed: 1,
          first_name_parsed: 'Bazooka',
          last_name_parsed: 'Joe'
        }
      },{
        id: 3,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 1,
          name_parsed: 'knexjs.org',
          meta: {
            id: 1,
            site_id: 1,
            description: 'This is a description for the Knexjs Site'
          }
        }
      },{
        id: 4,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 1,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 1,
          name_parsed: 'knexjs.org',
          meta: {
            id: 1,
            site_id: 1,
            description: 'This is a description for the Knexjs Site'
          }
        }
      },{
        id: 5,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 2,
          name_parsed: 'bookshelfjs.org',
          meta: {
            id: 2,
            site_id: 2,
            description: 'This is a description for the Bookshelfjs Site'
          }
        }
      },{
        id: 6,
        url: 'https://www.google.com/images/srpr/logo4w.png',
        caption: 'Lorem ipsum Quis Ut eu nostrud ea sint aute non aliqua ut ullamco cupidatat exercitation nisi nisi.',
        imageable_id: 2,
        imageable_type: 'sites',
        imageableParsed: {
          id_parsed: 2,
          name_parsed: 'bookshelfjs.org',
          meta: {
            id: 2,
            site_id: 2,
            description: 'This is a description for the Bookshelfjs Site'
          }
        }
      },{
        id: 7,
        url: 'http://image.dev',
        caption: 'this is a test image',
        imageable_id: 10,
        imageable_type: 'sites',
        imageableParsed: {

        }
      }]
    }
  },
  "works with hasOne relation (locale -> translation)": {
    mysql: {
      result: {
        code: 'pt',
        customer: 'Customer1'
      }
    },
    postgresql: {
      result: {
        code: 'pt',
        customer: 'Customer1'
      }
    },
    sqlite3: {
      result: {
        code: 'pt',
        customer: 'Customer1'
      }
    },
    oracle: {
      result: {
        code: 'pt',
        customer: 'Customer1'
      }
    }
  },
  "works with eager loaded hasOne relation (locale -> translation)": {
    mysql: {
      result: {
        isoCode: 'pt',
        translation: {
          code: 'pt',
          customer: 'Customer1'
        }
      }
    },
    postgresql: {
      result: {
        isoCode: 'pt',
        translation: {
          code: 'pt',
          customer: 'Customer1'
        }
      }
    },
    sqlite3: {
      result: {
        isoCode: 'pt',
        translation: {
          code: 'pt',
          customer: 'Customer1'
        }
      }
    },
    oracle: {
      result: {
        isoCode: 'pt',
        translation: {
          code: 'pt',
          customer: 'Customer1'
        }
      }
    }
  },
  "works with hasMany relation (locale -> translations)": {
    mysql: {
      result: [{
        code: 'en',
        customer: 'Customer1'
      }, {
        code: 'en',
        customer: 'Customer2'
      }]
    },
    postgresql: {
      result: [{
        code: 'en',
        customer: 'Customer1'
      }, {
        code: 'en',
        customer: 'Customer2'
      }]
    },
    sqlite3: {
      result: [{
        code: 'en',
        customer: 'Customer1'
      }, {
        code: 'en',
        customer: 'Customer2'
      }]
    },
    oracle: {
      result: [{
        code: 'en',
        customer: 'Customer1'
      }, {
        code: 'en',
        customer: 'Customer2'
      }]
    }
  },
  "works with eager loaded hasMany relation (locale -> translations)": {
    mysql: {
      result: {
        isoCode: 'en',
        translations: [{
          code: 'en',
          customer: 'Customer1'
        }, {
          code: 'en',
          customer: 'Customer2'
        }]
      }
    },
    postgresql: {
      result: {
        isoCode: 'en',
        translations: [{
          code: 'en',
          customer: 'Customer1'
        }, {
          code: 'en',
          customer: 'Customer2'
        }]
      }
    },
    sqlite3: {
      result: {
        isoCode: 'en',
        translations: [{
          code: 'en',
          customer: 'Customer1'
        }, {
          code: 'en',
          customer: 'Customer2'
        }]
      }
    },
    oracle: {
      result: {
        isoCode: 'en',
        translations: [{
          code: 'en',
          customer: 'Customer1'
        }, {
          code: 'en',
          customer: 'Customer2'
        }]
      }
    }
  },
  "works with belongsTo relation (translation -> locale)": {
    mysql: {
      result: {
        isoCode: 'pt'
      }
    },
    postgresql: {
      result: {
        isoCode: 'pt'
      }
    },
    sqlite3: {
      result: {
        isoCode: 'pt'
      }
    },
    oracle: {
      result: {
        isoCode: 'pt'
      }
    }
  },
  "works with eager loaded belongsTo relation (translation -> locale)": {
    mysql: {
      result: {
        code: 'pt',
        customer: 'Customer1',
        locale: {
          isoCode: 'pt'
        }
      }
    },
    postgresql: {
      result: {
        code: 'pt',
        customer: 'Customer1',
        locale: {
          isoCode: 'pt'
        }
      }
    },
    sqlite3: {
      result: {
        code: 'pt',
        customer: 'Customer1',
        locale: {
          isoCode: 'pt'
        }
      }
    },
    oracle: {
      result: {
        code: 'pt',
        customer: 'Customer1',
        locale: {
          isoCode: 'pt'
        }
      }
    }
  },
  "works with belongsToMany relation (locale -> customers)": {
    mysql: {
      result: [{
        id: 1,
        name: 'Customer1',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        id: 2,
        name: 'Customer2',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        name: 'Customer1',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        id: 2,
        name: 'Customer2',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        name: 'Customer1',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        id: 2,
        name: 'Customer2',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }]
    },
    oracle: {
      result: [{
        id: 1,
        name: 'Customer1',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        id: 2,
        name: 'Customer2',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }]
    }
  },
  "works with eager loaded belongsToMany relation (locale -> customers)": {
    mysql: {
      result: {
        isoCode: 'en',
        customers: [{
          id: 1,
          name: 'Customer1',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          id: 2,
          name: 'Customer2',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }]
      }
    },
    postgresql: {
      result: {
        isoCode: 'en',
        customers: [{
          id: 1,
          name: 'Customer1',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          id: 2,
          name: 'Customer2',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }]
      }
    },
    sqlite3: {
      result: {
        isoCode: 'en',
        customers: [{
          id: 1,
          name: 'Customer1',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          id: 2,
          name: 'Customer2',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }]
      }
    },
    oracle: {
      result: {
        isoCode: 'en',
        customers: [{
          id: 1,
          name: 'Customer1',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          id: 2,
          name: 'Customer2',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }]
      }
    }
  },
  "works with hasOne `through` relation (customer -> locale)": {
    mysql: {
      result: {
        isoCode: 'en',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }
    },
    postgresql: {
      result: {
        isoCode: 'en',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }
    },
    sqlite3: {
      result: {
        isoCode: 'en',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }
    },
    oracle: {
      result: {
        isoCode: 'en',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }
    }
  },
  "works with eager loaded hasOne `through` relation (customer -> locale)": {
    mysql: {
      result: {
        id: 2,
        name: 'Customer2',
        locale: {
          isoCode: 'en',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }
      }
    },
    postgresql: {
      result: {
        id: 2,
        name: 'Customer2',
        locale: {
          isoCode: 'en',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }
      }
    },
    sqlite3: {
      result: {
        id: 2,
        name: 'Customer2',
        locale: {
          isoCode: 'en',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }
      }
    },
    oracle: {
      result: {
        id: 2,
        name: 'Customer2',
        locale: {
          isoCode: 'en',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }
      }
    }
  },
  "works with hasMany `through` relation (customer -> locales)": {
    mysql: {
      result: [{
        isoCode: 'en',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        isoCode: 'pt',
        _pivot_code: 'pt',
        _pivot_customer: 'Customer1'
      }]
    },
    postgresql: {
      result: [{
        isoCode: 'en',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        isoCode: 'pt',
        _pivot_code: 'pt',
        _pivot_customer: 'Customer1'
      }]
    },
    sqlite3: {
      result: [{
        isoCode: 'en',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        isoCode: 'pt',
        _pivot_code: 'pt',
        _pivot_customer: 'Customer1'
      }]
    },
    oracle: {
      result: [{
        isoCode: 'en',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        isoCode: 'pt',
        _pivot_code: 'pt',
        _pivot_customer: 'Customer1'
      }]
    }
  },
  "works with eager loaded hasMany `through` relation (customer -> locales)": {
    mysql: {
      result: {
        id: 1,
        name: 'Customer1',
        locales: [{
          isoCode: 'en',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          isoCode: 'pt',
          _pivot_code: 'pt',
          _pivot_customer: 'Customer1'
        }]
      }
    },
    postgresql: {
      result: {
        id: 1,
        name: 'Customer1',
        locales: [{
          isoCode: 'en',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          isoCode: 'pt',
          _pivot_code: 'pt',
          _pivot_customer: 'Customer1'
        }]
      }
    },
    sqlite3: {
      result: {
        id: 1,
        name: 'Customer1',
        locales: [{
          isoCode: 'en',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          isoCode: 'pt',
          _pivot_code: 'pt',
          _pivot_customer: 'Customer1'
        }]
      }
    },
    oracle: {
      result: {
        id: 1,
        name: 'Customer1',
        locales: [{
          isoCode: 'en',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          isoCode: 'pt',
          _pivot_code: 'pt',
          _pivot_customer: 'Customer1'
        }]
      }
    }
  },
  "works with belongsTo `through` relation (locale -> customer)": {
    mysql: {
      result: {
        id: 1,
        name: 'Customer1',
        _pivot_code: 'pt',
        _pivot_customer: 'Customer1'
      }
    },
    postgresql: {
      result: {
        id: 1,
        name: 'Customer1',
        _pivot_code: 'pt',
        _pivot_customer: 'Customer1'
      }
    },
    sqlite3: {
      result: {
        id: 1,
        name: 'Customer1',
        _pivot_code: 'pt',
        _pivot_customer: 'Customer1'
      }
    },
    oracle: {
      result: {
        id: 1,
        name: 'Customer1',
        _pivot_code: 'pt',
        _pivot_customer: 'Customer1'
      }
    }
  },
  "works with eager loaded belongsTo `through` relation (locale -> customer)": {
    mysql: {
      result: {
        isoCode: 'pt',
        customer: {
          id: 1,
          name: 'Customer1',
          _pivot_code: 'pt',
          _pivot_customer: 'Customer1'
        }
      }
    },
    postgresql: {
      result: {
        isoCode: 'pt',
        customer: {
          id: 1,
          name: 'Customer1',
          _pivot_code: 'pt',
          _pivot_customer: 'Customer1'
        }
      }
    },
    sqlite3: {
      result: {
        isoCode: 'pt',
        customer: {
          id: 1,
          name: 'Customer1',
          _pivot_code: 'pt',
          _pivot_customer: 'Customer1'
        }
      }
    },
    oracle: {
      result: {
        isoCode: 'pt',
        customer: {
          id: 1,
          name: 'Customer1',
          _pivot_code: 'pt',
          _pivot_customer: 'Customer1'
        }
      }
    }
  },
  "works with belongsToMany `through` relation (locale -> customers)": {
    mysql: {
      result: [{
        id: 1,
        name: 'Customer1',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        id: 2,
        name: 'Customer2',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }]
    },
    postgresql: {
      result: [{
        id: 1,
        name: 'Customer1',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        id: 2,
        name: 'Customer2',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }]
    },
    sqlite3: {
      result: [{
        id: 1,
        name: 'Customer1',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        id: 2,
        name: 'Customer2',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }]
    },
    oracle: {
      result: [{
        id: 1,
        name: 'Customer1',
        _pivot_code: 'en',
        _pivot_customer: 'Customer1'
      }, {
        id: 2,
        name: 'Customer2',
        _pivot_code: 'en',
        _pivot_customer: 'Customer2'
      }]
    }
  },
  "works with eager belongsToMany `through` relation (locale -> customers)": {
    mysql: {
      result: {
        isoCode: 'en',
        customersThrough: [{
          id: 1,
          name: 'Customer1',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          id: 2,
          name: 'Customer2',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }]
      }
    },
    postgresql: {
      result: {
        isoCode: 'en',
        customersThrough: [{
          id: 1,
          name: 'Customer1',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          id: 2,
          name: 'Customer2',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }]
      }
    },
    sqlite3: {
      result: {
        isoCode: 'en',
        customersThrough: [{
          id: 1,
          name: 'Customer1',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          id: 2,
          name: 'Customer2',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }]
      }
    },
    oracle: {
      result: {
        isoCode: 'en',
        customersThrough: [{
          id: 1,
          name: 'Customer1',
          _pivot_code: 'en',
          _pivot_customer: 'Customer1'
        }, {
          id: 2,
          name: 'Customer2',
          _pivot_code: 'en',
          _pivot_customer: 'Customer2'
        }]
      }
    }
  }
};
