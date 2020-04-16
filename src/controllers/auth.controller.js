const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const moment = require('moment')
const validator = require('validator')

const db = require('../database/db')
const emailService = require('../services/email.service')

module.exports = {
    async auth(req, res) {
        try {
            const { email, senha } = req.body

            if (!email || !validator.isEmail(email)) return res.status(400).send({ error: 'Email inválido' })

            if (!senha) return res.status(400).send({ error: 'Senha inválida' })

            const usuario = await db('usuarios').where('email', email).first()

            if (usuario && usuario.bloqueado) return res.status(401).send({ error: 'Usuário bloqueado' })

            if (usuario && await bcrypt.compare(senha, usuario.senha)) {
                let roles = []

                await db('usuarios_permissoes')
                    .join('permissoes', 'permissoes.id', 'usuarios_permissoes.permissao_id')
                    .where('usuario_id', usuario.id)
                    .select(['permissoes.id'])
                    .then(p => p.map(r => roles.push(r.id)))

                const user = {
                    id: usuario.id,
                    roles
                }

                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: process.env.TOKEN_EXPIRES
                })

                const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

                await db('refresh_tokens').insert({
                    id: uuidv4(),
                    token: refreshToken,
                    usuario_id: usuario.id,
                    user_agent: req.headers['user-agent'],
                    created_at: moment().format()
                })

                return res.json({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })
            } else {
                return res.status(401).send({ error: 'Email ou senha inválida' })
            }
        } catch (error) {
            console.log(error)
            return res.status(400).send(error)
        }
    },

    async refresh(req, res) {
        try {
            const refreshToken = req.body.token

            if (!refreshToken) return res.sendStatus(401)

            const token = await db('refresh_tokens')
                .join('usuarios', 'usuarios.id', 'refresh_tokens.usuario_id')
                .where('refresh_tokens.token', refreshToken)
                .whereNull('refresh_tokens.deleted_at')
                .select([
                    'refresh_tokens.id',
                    'refresh_tokens.token',
                    'refresh_tokens.usuario_id',
                    'usuarios.bloqueado'
                ])
                .first()

            if (!token) return res.sendStatus(403)

            if (token.bloqueado) {
                await db('refresh_tokens')
                    .where('id', token.id)
                    .update({
                        deleted_at: moment().format()
                    })

                return res.sendStatus(403)
            }

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
                if (error || user.id !== token.usuario_id) return res.sendStatus(403)

                const accessToken = jwt.sign({ id: user.id, roles: user.roles }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: process.env.TOKEN_EXPIRES
                })

                res.json({ access_token: accessToken })
            })

            await db('refresh_tokens')
                .where('id', token.id)
                .update({
                    user_agent: req.headers['user-agent'],
                    updated_at: moment().format()
                })

        } catch (error) {
            console.log(error)
            return res.status(400).send(error)
        }
    },

    async logout(req, res) {
        try {
            const { id } = req.user
            const { token } = req.body

            await db('refresh_tokens').where({
                    token: token,
                    usuario_id: id
                })
                .update({
                    deleted_at: moment().format()
                })

            res.sendStatus(204)
        } catch (error) {
            console.log(error)
            return res.status(400).send(error)
        }
    },

    async validate(req, res) {
        try {
            const validationToken = req.params.token

            const token = await db('validation_tokens')
                .join('usuarios', 'usuarios.id', 'validation_tokens.usuario_id')
                .where('validation_tokens.token', validationToken)
                .whereNull('validation_tokens.validated_at')
                .whereNull('validation_tokens.deleted_at')
                .where('usuarios.bloqueado', true)
                .select([
                    'validation_tokens.id',
                    'validation_tokens.token',
                    'validation_tokens.expires_in',
                    'validation_tokens.usuario_id',
                    'usuarios.bloqueado'
                ])
                .first()

            if (!token) return res.sendStatus(400)

            if (token.expires_in < moment().format()) {
                await db('validation_tokens')
                    .where('id', token.id)
                    .update({
                        updated_at: moment().format(),
                        deleted_at: moment().format()
                    })

                return res.sendStatus(400)
            }

            await db('validation_tokens')
                .where('id', token.id)
                .update({
                    validated_at: moment().format(),
                    updated_at: moment().format()
                })

            await db('usuarios')
                .where('id', token.usuario_id)
                .update({
                    bloqueado: false,
                    updated_at: moment().format()
                })

            return res.status(200).send({ message: 'Email confirmado com sucesso!' })
        } catch (error) {
            console.log(error)
            return res.status(400).send(error)
        }
    },

    async forgotPassword(req, res) {
        try {
            const { email } = req.body

            if (!email || !validator.isEmail(email)) return res.status(400).send({ error: 'Email inválido' })

            const usuario = await db('usuarios').where('email', email).first()

            if (!usuario) return res.status(400).send({ error: 'Email inválido' })

            if (usuario && usuario.bloqueado) return res.status(400).send({ error: 'Usuário bloqueado' })

            await db('reset_passwords')
                .where('usuario_id', usuario.id)
                .whereNull('validated_at')
                .whereNull('deleted_at')
                .update({
                    updated_at: moment().format(),
                    deleted_at: moment().format()
                })

            const forgotToken = jwt.sign({ id: usuario.id }, process.env.REFRESH_TOKEN_SECRET)
            const template = process.env.EMAIL_TMPL_RESET.replace('{0}', `${process.env.LINK_ADDRESS}/auth/reset/${forgotToken}`)

            await db('reset_passwords')
                .insert({
                    id: uuidv4(),
                    token: forgotToken,
                    expires_in: moment().add(1, 'hours').format(),
                    usuario_id: usuario.id,
                    created_at: moment().format()
                })

            await emailService.send(
                process.env.SENDGRID_FROM, //email do usuário
                'Alteração de senha do Delivery App',
                template)

            return res.status(201).json({ message: 'Email de alteração de senha enviado com sucesso!' })
        } catch (error) {
            console.log(error)
            return res.status(400).send(error)
        }
    },

    async resetPassword(req, res) {
        try {
            const { resetToken, senha } = req.body

            if (!resetToken) return res.status(400).send({ error: 'Token inválido' })

            if (!senha) return res.status(400).send({ error: 'Senha inválida' })

            const token = await db('reset_passwords')
                .join('usuarios', 'usuarios.id', 'reset_passwords.usuario_id')
                .where('reset_passwords.token', resetToken)
                .whereNull('reset_passwords.validated_at')
                .whereNull('reset_passwords.deleted_at')
                .where('usuarios.bloqueado', false)
                .select([
                    'reset_passwords.id',
                    'reset_passwords.token',
                    'reset_passwords.expires_in',
                    'reset_passwords.usuario_id'
                ])
                .first()

            if (!token) return res.status(400).send({ error: 'Token inválido' })

            if (token.expires_in < moment().format()) {
                await db('reset_passwords')
                    .where('id', token.id)
                    .update({
                        updated_at: moment().format(),
                        deleted_at: moment().format()
                    })

                return res.status(400).send({ error: 'Token expirado' })
            }

            await db('reset_passwords')
                .where('id', token.id)
                .update({
                    validated_at: moment().format(),
                    updated_at: moment().format()
                })

            const hashedPassword = await bcrypt.hash(senha, 10)

            await db('usuarios')
                .where('id', token.usuario_id)
                .update({
                    senha: hashedPassword,
                    updated_at: moment().format()
                })

            return res.status(200).send({ message: 'Senha de usuário alterada com sucesso!' })
        } catch (error) {
            console.log(error)
            return res.status(400).send(error)
        }
    }
}