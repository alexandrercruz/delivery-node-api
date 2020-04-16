const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const moment = require('moment')
const validator = require('validator')

const db = require('../database/db')
const emailService = require('../services/email.service')
const roles = require('../roles')

function hasRole(role) {
    if (role == roles.administradores) {
        return true
    } else if (role == roles.estabelecimentos) {
        return true
    } else if (role == roles.clientes) {
        return true
    } else {
        return false
    }
}

module.exports = {
    async index(req, res) {
        try {
            const { filter, operator, deleted } = req.body
            const { column, clause, value } = operator || {}
            let { sort, page, limit } = req.body

            if (!page || page < 0) page = 0

            if (!limit || limit < 5) limit = 5

            if (!sort) sort = 'email'

            const columns = [
                'id',
                'email',
                'fone',
                'imagem',
                'bloqueado',
                'cliente_id',
                'estabelecimento_id',
                'created_at',
                'updated_at'
            ]

            const query = db('usuarios').select(columns)

            if (filter) query.where(filter)

            if (operator && column && clause && value) query.where(column, clause, value)

            if (deleted) query
                .whereNotNull('deleted_at')
                .select('deleted_at')
            else query
                .whereNull('deleted_at')

            result = await query
                .limit(limit)
                .offset(page)
                .orderBy(sort)

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
                'id',
                'email',
                'fone',
                'imagem',
                'bloqueado',
                'cliente_id',
                'estabelecimento_id',
                'created_at',
                'updated_at',
                'deleted_at'
            ]

            const result = await db('usuarios')
                .where('id', id)
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
            const { role } = req.headers

            if (!hasRole(role)) return res.sendStatus(400)

            const { razaoSocial, nomeFantasia, nome, cnpj, cpf, fone, email, senha } = req.body
            const id = uuidv4()
            let cliente_id, estabelecimento_id, nomeOuRazaoSocial = null

            if (!validator.isEmail(email)) return res.status(400).send({ error: 'Email inválido' })

            if (role == roles.clientes && !cpf) return res.status(400).send({ error: 'CPF inválido' })

            if (role == roles.clientes && !nome) return res.status(400).send({ error: 'Nome inválido' })

            if (role == roles.estabelecimentos && !cnpj) return res.status(400).send({ error: 'CNPJ inválido' })

            if (role == roles.estabelecimentos && !razaoSocial) return res.status(400).send({ error: 'Razão social inválida' })

            if (role == roles.estabelecimentos && !nomeFantasia) return res.status(400).send({ error: 'Nome fantasia inválido' })

            if (role == roles.administradores && !nome) return res.status(400).send({ error: 'Nome inválido' })

            if (role == roles.administradores && !razaoSocial) return res.status(400).send({ error: 'Razão social inválida' })

            if (role == roles.administradores && !nomeFantasia) return res.status(400).send({ error: 'Nome fantasia inválido' })

            if (role == roles.administradores && !cpf || !cnpj) return res.status(400).send({ error: 'CPF ou CNPJ inválido' })

            if (!senha) return res.status(400).send({ error: 'Senha inválida' })

            const hashedPassword = await bcrypt.hash(senha, 10)

            const buscaEmail = await db('usuarios')
                .where('email', email)
                .first()

            if (buscaEmail) return res.status(400).send({ error: 'Email já cadastrado' })

            if (role == roles.estabelecimentos || role == roles.administradores) {
                const buscaCnpj = await db('estabelecimentos')
                    .where('cnpj', cnpj)
                    .first()

                if (buscaCnpj) return res.status(400).send({ error: 'CNPJ já cadastrado' })
            }

            if (role == roles.clientes || role == roles.administradores) {
                cliente_id = uuidv4()

                const buscaCpf = await db('clientes')
                    .where('cpf', cpf)
                    .first()

                if (buscaCpf) return res.status(400).send({ error: 'CPF já cadastrado' })

                nomeOuRazaoSocial = nome

                await db('clientes')
                    .insert({
                        id: cliente_id,
                        nome,
                        cpf,
                        created_at: moment().format()
                    })
            }

            if (role == roles.estabelecimentos || role == roles.administradores) {
                estabelecimento_id = uuidv4()
                nomeOuRazaoSocial = nome || razaoSocial

                await db('estabelecimentos')
                    .insert({
                        id: estabelecimento_id,
                        razao_social: razaoSocial,
                        nome_fantasia: nomeFantasia,
                        cnpj,
                        created_at: moment().format()
                    })
            }

            await db('usuarios')
                .insert({
                    id,
                    email,
                    senha: hashedPassword,
                    fone,
                    cliente_id,
                    estabelecimento_id,
                    created_at: moment().format()
                })

            const validateToken = jwt.sign({ id, roles: [role] }, process.env.REFRESH_TOKEN_SECRET)
            let template = process.env.EMAIL_TMPL_CONFIRM.replace('{0}', nome || razaoSocial)
            template = template.replace('{1}', `${process.env.LINK_ADDRESS}/auth/${validateToken}`)

            await db('validation_tokens')
                .insert({
                    id: uuidv4(),
                    token: validateToken,
                    expires_in: moment().add(1, 'hours').format(),
                    usuario_id: id,
                    created_at: moment().format()
                })

            await emailService.send(
                process.env.SENDGRID_FROM, //email do usuário
                'Ative sua conta no Delivery App',
                template)

            return res.status(201).json({ id })
        } catch (error) {
            console.log(error)
            return res.sendStatus(400)
        }
    },

    async edit(req, res) {
        try {
            const { id, nome, senha, ativo, bloqueado } = req.body
            let hashedPassword

            if (!validator.isUUID(id)) return res.sendStatus(400)

            if (senha) hashedPassword = await bcrypt.hash(senha, 10)

            await db('usuarios')
                .where('id', id)
                .update({
                    nome,
                    senha: hashedPassword,
                    ativo,
                    bloqueado,
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

            await db('usuarios')
                .where('id', id)
                .update({
                    deleted_at: moment().format()
                })

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

            await db('usuarios')
                .where('id', id)
                .update({
                    updated_at: moment().format(),
                    deleted_at: null
                })

            return res.sendStatus(204)
        } catch (error) {
            console.log(error)
            return res.sendStatus(400)
        }
    }
}