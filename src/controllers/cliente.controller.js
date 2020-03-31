const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db')
const moment = require('moment')

module.exports = {
    async index(req, res) {
        try {
            const { deleted } = req.headers
            const { role } = req.user

            if (role !== 'cliente') return res.sendStatus(403)

            const columns = [
                'id',
                'nome',
                'cpf',
                'fone',
                'email',
                'imagem',
                'ativo',
                'bloqueado',
                'created_at',
                'updated_at'
            ]

            const query = db('clientes').select(columns)

            if (deleted) {
                query.whereNotNull('deleted_at').select('deleted_at')
            } else {
                query.whereNull('deleted_at')
            }

            result = await query

            if (result.length > 0) return res.json(result)

            return res.sendStatus(204)
        } catch (error) {
            return res.status(400).send(error)
        }
    },

    async show(req, res) {
        try {
            const { deleted } = req.headers
            const { id } = req.params
            const { role } = req.user

            if (role !== 'cliente') return res.sendStatus(403)

            const columns = [
                'id',
                'nome',
                'cpf',
                'fone',
                'email',
                'imagem',
                'ativo',
                'bloqueado',
                'created_at',
                'updated_at'
            ]

            const query = db('clientes').where({ id: id, deleted_at: null }).select(columns).first()

            if (deleted) {
                query.whereNotNull('deleted_at').select('deleted_at')
            } else {
                query.whereNull('deleted_at')
            }

            result = await query

            if (result) return res.json(result)

            return res.sendStatus(204)
        } catch (error) {
            return res.status(400).send(error)
        }
    },

    async create(req, res) {
        try {
            const { nome, cpf, fone, email, senha } = req.body
            const id = uuidv4()
            const hashedPassword = await bcrypt.hash(senha, 10)

            await db('clientes').insert({
                id,
                nome,
                cpf,
                fone,
                email,
                senha: hashedPassword
            })

            return res.status(201).json({ id })
        } catch (error) {
            return res.status(400).send(error)
        }
    },

    async edit(req, res) {
        try {
            const { role } = req.user

            if (role !== 'cliente') return res.sendStatus(403)

            const { id, nome, fone, imagem, ativo, bloqueado } = req.body

            await db('clientes').where('id', id).update({
                nome,
                fone,
                imagem,
                ativo,
                bloqueado,
                updated_at: moment().format()
            })

            return res.sendStatus(204)
        } catch (error) {
            return res.status(400).send(error)
        }
    },

    async destroy(req, res) {
        try {
            const { role } = req.user

            if (role !== 'cliente') return res.sendStatus(403)

            const { id } = req.params
            await db('clientes').where('id', id).update({ deleted_at: moment().format() })
            return res.sendStatus(204)
        } catch (error) {
            return res.status(400).send(error)
        }
    },

    async restore(req, res) {
        try {
            const { role } = req.user

            if (role !== 'cliente') return res.sendStatus(403)

            const { id } = req.params
            await db('clientes').where('id', id).update({ deleted_at: null })
            return res.sendStatus(204)
        } catch (error) {
            return res.status(400).send(error)
        }
    }
}