
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('events').del()
    .then(function () {
      // Inserts seed entries
      return knex('events').insert([
        {label: 'pimohtēwak'},
        {label: 'lot_x'}

      ]);
    });
};
