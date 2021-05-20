module.exports = {
  mysql: {
    database: 'bookshelf_test',
    user: 'root',
    encoding: 'utf8'
  },

  postgres: {
    database: 'bookshelf_test',
    user: 'postgres',
    password: 'postgres'
  },

  sqlite3: {
    filename: ':memory:'
  }
};
