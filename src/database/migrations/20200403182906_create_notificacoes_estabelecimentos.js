exports.up = function(knex) {
    return knex.schema.createTable('notificacoes_estabelecimentos', function(table) {
        table.uuid('id').primary()
        table.text('mensagem').notNullable()
        table.boolean('visualizada').defaultTo(false)
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('estabelecimento_id').references('estabelecimentos.id').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('notificacoes_estabelecimentos')
}