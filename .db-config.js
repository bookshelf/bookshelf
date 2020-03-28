module.exports = {
  mysql: {
    database: 'bookshelf_test',
    user: 'root',
    password: 'root',
    encoding: 'utf8'
  },

  postgres: {
    user: 'postgres',
    database: 'bookshelf_test',
    host: 'localhost',
    port: 5432,
    charset: 'utf8',
    ssl: false
  },

  sqlite3: {
    filename: ':memory:'
  }
};
