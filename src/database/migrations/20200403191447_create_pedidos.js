exports.up = function(knex) {
    return knex.schema.createTable('pedidos', function(table) {
        table.uuid('id').primary()
        table.decimal('valor_total').notNullable()
        table.decimal('valor_entrega').notNullable()
        table.text('observacao')
        table.integer('status').notNullable()
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('cliente_id').references('clientes.id').notNullable()
        table.uuid('estabelecimento_id').references('estabelecimentos.id').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('pedidos')
}