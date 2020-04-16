const usuarios_permissoes = require('./inserts/usuarios_permissoes');

exports.seed = async(knex) => {
    await knex('usuarios_permissoes').del()
    return await knex.batchInsert('usuarios_permissoes', usuarios_permissoes)
}