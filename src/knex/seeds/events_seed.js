
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('events').del()
    .then(function () {
      // Inserts seed entries
      return knex('events').insert([
        {label: 'pimohtēwak', isOpen: false},
        {label: 'lot_x', isOpen: false}
      ]);
    });
};
