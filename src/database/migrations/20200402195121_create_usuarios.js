exports.up = function(knex) {
    return knex.schema.createTable('usuarios', function(table) {
        table.uuid('id').primary()
        table.string('email').unique().notNullable()
        table.string('senha').notNullable()
        table.string('fone', 20).notNullable()
        table.string('imagem')
        table.boolean('bloqueado').defaultTo(true)
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('cliente_id').references('clientes.id')
        table.uuid('estabelecimento_id').references('estabelecimentos.id')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('usuarios')
}