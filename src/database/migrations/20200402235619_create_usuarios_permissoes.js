exports.up = function(knex) {
    return knex.schema.createTable('usuarios_permissoes', function(table) {
        table.uuid('usuario_id').references('usuarios.id').notNullable()
        table.integer('permissao_id').references('permissoes.id').notNullable()
        table.primary(['usuario_id', 'permissao_id']);
        table.timestamp('created_at')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('usuarios_permissoes')
}