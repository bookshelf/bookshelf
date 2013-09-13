({
    baseUrl: ".",
    optimize: 'none',
    preserveLicenseComments: false,
    shim: {
      'inflection': {
        exports: 'inflection'
      },
      'backbone': {
        deps: ['underscore'],
        exports: 'Backbone'
      },
      'underscore': {
        exports: '_'
      }
    },
    paths: {
      when: './node_modules/when/when',
      knex: './node_modules/knex/knex',
      underscore: './node_modules/underscore/underscore',
      backbone: './node_modules/backbone/backbone',
      inflection: './node_modules/inflection/lib/inflection',
      'trigger-then': './node_modules/trigger-then/trigger-then'
    },
    name: "bookshelf",
    out: "bookshelf-built.js"
})