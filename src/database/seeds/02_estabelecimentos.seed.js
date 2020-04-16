const estabelecimentos = require('./inserts/estabelecimentos');

exports.seed = async(knex) => {
    await knex('estabelecimentos').del()
    return await knex.batchInsert('estabelecimentos', estabelecimentos)
}