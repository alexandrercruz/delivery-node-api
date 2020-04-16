exports.up = function(knex) {
    return knex.schema.createTable('estados', function(table) {
        table.string('sigla', 2).primary()
        table.string('nome').notNullable()
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('estados')
}