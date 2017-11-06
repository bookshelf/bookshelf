module.exports = {

  mysql: {
    database: 'bookshelf_test',
    user: 'root',
    encoding: 'utf8'
  },

  postgres: {
    database: 'bookshelf_test',
    user: 'postgres'
  },

  sqlite3: {
    filename: ':memory:'
  },

  oracledb: {
    user          : "travis",
    password      : "travis",
    connectString : "localhost/XE",
    // https://github.com/oracle/node-oracledb/issues/525
    stmtCacheSize : 0
  }

};
