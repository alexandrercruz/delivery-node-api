exports.up = function(knex) {
    return knex.schema.createTable('itens_pedidos', function(table) {
        table.uuid('id').primary()
        table.decimal('valor').notNullable()
        table.float('quantidade').notNullable()
        table.integer('estado_item')
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('pedido_id').references('pedidos.id').notNullable()
        table.uuid('estabelecimento_id').references('estabelecimentos.id').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('itens_pedidos')
}