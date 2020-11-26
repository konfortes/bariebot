exports.up = async function(knex) {
  await knex.schema.createTable('links', t => {
    t.increments('id').primary()
    t.integer('user_id')
      .references('id')
      .inTable('users')
      .notNull()
      .onDelete('cascade')
    t.string('value')
    t.string('name')
    t.dateTime('created_at')
    t.index('user_id', 'user_id_idx')
  })
}

exports.down = async function(knex) {
  await knex.schema.dropTable('links')
}
