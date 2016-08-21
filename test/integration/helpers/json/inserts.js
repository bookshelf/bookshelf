var Promise = global.testPromise;

module.exports = function(bookshelf) {

  var knex = bookshelf.knex;

  return Promise.all([

    knex('units').insert([{
      id: 0,
      name: 'tank'
    }]),

    knex('commands').insert([{
      id: 0,
      type: 'move',
      unit_id: 1,
      info: {
        target: {
          x: 5,
          y: 10
        }
      }
    }, {
      id: 1,
      unit_id: 1,
      type: 'attack',
      info: {
        weapon: 'cannon',
        target: {
          x: 2,
          y: 2
        }
      }
    }])
  ]);
};
