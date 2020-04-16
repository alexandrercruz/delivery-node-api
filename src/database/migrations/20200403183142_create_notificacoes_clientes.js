exports.up = function(knex) {
    return knex.schema.createTable('notificacoes_clientes', function(table) {
        table.uuid('id').primary()
        table.text('mensagem').notNullable()
        table.boolean('visualizada').defaultTo(false)
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('cliente_id').references('clientes.id').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('notificacoes_clientes')
}