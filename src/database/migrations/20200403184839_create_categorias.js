exports.up = function(knex) {
    return knex.schema.createTable('categorias', function(table) {
        table.uuid('id').primary()
        table.string('nome').notNullable()
        table.string('imagem')
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('categoria_id').references('categorias.id')
        table.uuid('estabelecimento_id').references('estabelecimentos.id').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('categorias')
}