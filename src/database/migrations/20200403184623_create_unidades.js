exports.up = function(knex) {
    return knex.schema.createTable('unidades', function(table) {
        table.uuid('id').primary()
        table.string('nome').notNullable()
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('unidades')
}