const usuarios = require('./inserts/usuarios');

exports.seed = async(knex) => {
    await knex('usuarios').del()
    return await knex.batchInsert('usuarios', usuarios)
}