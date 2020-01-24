
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
  .then(function () {
    return knex('users').insert([{
      username: 'dev_user',
      password: '$2b$12$dcJiN6AdyVLZFLGj.Pju4ecJdS0DjSrVJUGgAaEgrZdbAdpS49zN.'
    }])
  });
};
