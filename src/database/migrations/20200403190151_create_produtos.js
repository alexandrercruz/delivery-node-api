exports.up = function(knex) {
    return knex.schema.createTable('produtos', function(table) {
        table.uuid('id').primary()
        table.string('nome').notNullable()
        table.decimal('valor').notNullable()
        table.float('peso').notNullable()
        table.boolean('pesado').defaultTo(false)
        table.boolean('disponivel').defaultTo(true)
        table.string('imagem')
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('unidade_id').references('unidades.id').notNullable()
        table.uuid('marca_id').references('marcas.id')
        table.uuid('categoria_id').references('categorias.id').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('produtos')
}