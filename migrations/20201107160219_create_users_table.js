exports.up = async function(knex) {
  await knex.schema.createTable('users', t => {
    t.increments('id').primary()
    t.integer('external_id')
    t.string('first_name')
    t.string('last_name')
    t.string('username')
    t.boolean('subscribed')
    t.string('declaration_url')
    t.dateTime('created_at')
    t.index('external_id', 'external_id_idx')
  })
}

exports.down = async function(knex) {
  await knex.schems.dropTable('users')
}
