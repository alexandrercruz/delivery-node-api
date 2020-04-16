exports.up = function(knex) {
    return knex.schema.createTable('marcas', function(table) {
        table.uuid('id').primary()
        table.string('nome').notNullable()
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('estabelecimento_id').references('estabelecimentos.id').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('marcas')
}