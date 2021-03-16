exports.up = async function(knex) {
  try {
    await knex.raw('ALTER TABLE links ADD COLUMN last_sent_at timestamp;')
  } catch (err) {
    console.error(err)
  }
}

exports.down = async function(knex) {
  try {
    await knex.raw('ALTER TABLE links DROP COLUMN last_sent_at;')
  } catch (err) {
    console.error(err)
  }
}
