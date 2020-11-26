exports.up = async function(knex) {
  try {
    await knex.raw('ALTER TABLE users DROP COLUMN declaration_url;')
  } catch (err) {
    console.error(err)
  }
}

exports.down = async function(knex) {
  try {
    await knex.raw(
      'ALTER TABLE users ADD COLUMN declaration_url character varying(255);',
    )
  } catch (err) {
    console.error(err)
  }
}
