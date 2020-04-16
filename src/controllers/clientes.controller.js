const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const moment = require('moment')
const validator = require('validator')

const db = require('../database/db')

module.exports = {
    async index(req, res) {
        try {
            const { filter, operator, deleted } = req.body
            const { column, clause, value } = operator || {}
            let { sort, page, limit } = req.body

            if (!page || page < 0) page = 0

            if (!limit || limit < 5) limit = 5

            if (!sort) sort = 'clientes.nome'

            const columns = [
                'clientes.id',
                'clientes.nome',
                'clientes.cpf',
                'usuarios.email',
                'usuarios.fone',
                'usuarios.imagem',
                'clientes.ativo',
                'usuarios.bloqueado',
                'clientes.created_at',
                'clientes.updated_at'
            ]

            const query = db('clientes').join('usuarios', 'usuarios.cliente_id', 'clientes.id').select(columns)

            if (filter) query.where(filter)

            if (operator && column && clause && value) query.where(column, clause, value)

            if (deleted) query.whereNotNull('clientes.deleted_at').select('clientes.deleted_at')
            else query.whereNull('clientes.deleted_at')

            result = await query.limit(limit).offset(page).orderBy(sort)

            if (result.length > 0) return res.json(result)

            return res.sendStatus(204)
        } catch (error) {
            console.log(error)
            return res.sendStatus(400)
        }
    },

    async show(req, res) {
        try {
            const { id } = req.params

            if (!validator.isUUID(id)) return res.sendStatus(400)

            const columns = [
                'clientes.id',
                'clientes.nome',
                'clientes.cpf',
                'usuarios.email',
                'usuarios.fone',
                'usuarios.imagem',
                'clientes.ativo',
                'usuarios.bloqueado',
                'clientes.created_at',
                'clientes.updated_at',
                'clientes.deleted_at'
            ]

            const result = await db('clientes')
                .join('usuarios', 'usuarios.cliente_id', 'clientes.id')
                .where('clientes.id', id)
                .select(columns)
                .first()

            if (result) return res.json(result)

            return res.sendStatus(204)
        } catch (error) {
            console.log(error)
            return res.sendStatus(400)
        }
    },

    async store(req, res) {
        try {
            const { nome, cpf, email, senha, fone } = req.body

            if (!validator.isEmail(email)) return res.status(400).send({ error: 'Email inválido' })

            if (!senha) return res.status(400).send({ error: 'Senha inválida' })

            if (!cpf) return res.status(400).send({ error: 'CPF inválido' })

            const buscaEmail = await db('usuarios').where('email', email).first()

            if (buscaEmail) return res.status(400).send({ error: 'Email já cadastrado' })

            const buscaCpf = await db('clientes').where('cpf', cpf).first()

            if (buscaCpf) return res.status(400).send({ error: 'CPF já cadastrado' })

            const hashedPassword = await bcrypt.hash(senha, 10)

            const cliente_id = uuidv4()
            const usuario_id = uuidv4()

            await db('clientes').insert({
                id: cliente_id,
                nome,
                cpf,
                created_at: moment().format()
            })

            await db('usuarios').insert({
                id: usuario_id,
                email,
                senha: hashedPassword,
                fone,
                cliente_id,
                created_at: moment().format()
            })

            const permissao_id = await db('permissoes')
                .where('nome', 'clientes')
                .select('id')
                .first()
                .then(r => r.id)

            await db('usuarios_permissoes').insert({
                usuario_id,
                permissao_id,
                created_at: moment().format()
            })

            return res.status(201).json({ id: usuario_id })
        } catch (error) {
            console.log(error)
            return res.sendStatus(400)
        }
    },

    async edit(req, res) {
        try {
            const { id, nome, ativo } = req.body

            if (!validator.isUUID(id)) return res.sendStatus(400)

            await db('clientes').where('id', id).update({
                nome,
                ativo,
                updated_at: moment().format()
            })

            return res.sendStatus(204)
        } catch (error) {
            console.log(error)
            return res.sendStatus(400)
        }
    },

    async destroy(req, res) {
        try {
            const { id } = req.params

            if (!validator.isUUID(id)) return res.sendStatus(400)

            await db('clientes').where('id', id).update({ deleted_at: moment().format() })

            return res.sendStatus(204)
        } catch (error) {
            console.log(error)
            return res.sendStatus(400)
        }
    },

    async restore(req, res) {
        try {
            const { id } = req.params

            if (!validator.isUUID(id)) return res.sendStatus(400)

            await db('clientes').where('id', id).update({ deleted_at: null })

            return res.sendStatus(204)
        } catch (error) {
            console.log(error)
            return res.sendStatus(400)
        }
    }
}