const permissoes = require('./inserts/permissoes');

exports.seed = async(knex) => {
    await knex('permissoes').del()
    return await knex.batchInsert('permissoes', permissoes)
}