exports.up = function(knex) {
    return knex.schema.createTable('enderecos', function(table) {
        table.uuid('id').primary()
        table.string('logradouro').notNullable()
        table.integer('numero').notNullable()
        table.string('complemento')
        table.string('bairro').notNullable()
        table.integer('cep').notNullable()
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.integer('cidade_id').references('cidades.id').notNullable()
        table.uuid('cliente_id').references('clientes.id').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('enderecos')
}