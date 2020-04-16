exports.up = function(knex) {
    return knex.schema.createTable('cidades', function(table) {
        table.integer('id').primary()
        table.string('nome').notNullable()
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.string('estado_sigla', 2).references('estados.sigla').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('cidades')
}