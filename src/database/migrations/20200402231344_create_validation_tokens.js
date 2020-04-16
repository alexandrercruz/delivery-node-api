exports.up = function(knex) {
    return knex.schema.createTable('validation_tokens', function(table) {
        table.uuid('id').primary()
        table.text('token').unique().notNullable()
        table.timestamp('expires_in').notNullable()
        table.timestamp('validated_at')
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('usuario_id').references('usuarios.id').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('validation_tokens')
}