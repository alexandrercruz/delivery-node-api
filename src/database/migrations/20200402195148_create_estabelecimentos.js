exports.up = function(knex) {
    return knex.schema.createTable('estabelecimentos', function(table) {
        table.uuid('id').primary()
        table.string('razao_social').notNullable()
        table.string('nome_fantasia').notNullable()
        table.string('cnpj', 14).unique().notNullable()
        table.float('pontuacao')
        table.boolean('ativo').defaultTo(true)
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('endereco_id').references('enderecos.id')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('estabelecimentos')
}