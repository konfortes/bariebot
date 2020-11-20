exports.up = async function(knex) {
  try {
    await knex.raw(
      'ALTER TABLE users ADD CONSTRAINT external_id_unique UNIQUE (external_id);',
    )
  } catch (err) {
    console.error(err)
  }
}

exports.down = async function(knex) {
  try {
    await knex.raw('ALTER TABLE users DROP CONSTRAINT external_id_unique;')
  } catch (err) {
    console.error(err)
  }
}
