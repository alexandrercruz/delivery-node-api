const moment = require('moment')

exports.up = function(knex) {
    return knex.schema.createTable('clientes', function(table) {
        table.uuid('id').primary()
        table.string('nome').notNullable()
        table.string('cpf', 11).unique().notNullable()
        table.string('fone', 20).notNullable()
        table.string('email').unique().notNullable()
        table.string('senha').notNullable()
        table.string('imagem')
        table.boolean('ativo').defaultTo(false)
        table.boolean('bloqueado').defaultTo(false)
        table.timestamp('created_at').defaultTo(moment().format())
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('clientes')
}