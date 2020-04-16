const clientes = require('./inserts/clientes');

exports.seed = async(knex) => {
    await knex('clientes').del()
    return await knex.batchInsert('clientes', clientes)
}