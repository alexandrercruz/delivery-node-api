exports.up = function(knex) {
    return knex.schema.createTable('formas_pagamentos', function(table) {
        table.uuid('id').primary()
        table.string('descricao').notNullable()
        table.boolean('ativa').defaultTo(false)
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('formas_pagamentos')
}