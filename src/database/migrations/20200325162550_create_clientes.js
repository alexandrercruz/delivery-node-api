exports.up = function(knex) {
    return knex.schema.createTable('clientes', function(table) {
        table.uuid('id').primary()
        table.string('nome').notNullable()
        table.string('cpf', 11).unique().notNullable()
        table.boolean('ativo').defaultTo(true)
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('clientes')
}