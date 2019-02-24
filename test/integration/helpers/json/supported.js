module.exports = function(bookshelf) {
  const isPostgresql = bookshelf.knex.client.dialect === 'postgresql';
  if (!isPostgresql) return false;
  return !bookshelf.knex.client.version || parseFloat(bookshelf.knex.client.version) >= 9.2;
};
