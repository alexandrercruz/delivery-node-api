exports.up = function(knex) {
    return knex.schema.createTable('refresh_tokens', function(table) {
        table.uuid('id').primary()
        table.text('token').unique().notNullable()
        table.string('request')
        table.string('city')
        table.string('region')
        table.string('region_code')
        table.string('region_name')
        table.string('country_code')
        table.string('country_name')
        table.string('continent_code')
        table.string('continent_name')
        table.string('latitude')
        table.string('longitude')
        table.string('location_accuracy_radius')
        table.string('timezone')
        table.string('user_agent')
        table.timestamp('created_at')
        table.timestamp('updated_at')
        table.timestamp('deleted_at')
        table.uuid('usuario_id').references('usuarios.id').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('refresh_tokens')
}