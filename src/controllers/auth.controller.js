const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../database/db')

let refreshTokens = []

module.exports = {
    async auth(req, res) {
        try {
            const role = req.headers.role

            if (!role) return res.sendStatus(400)

            const { email, senha } = req.body
            const cliente = await db('clientes').where('email', email).first()

            if (cliente && await bcrypt.compare(senha, cliente.senha)) {
                const user = {
                    id: cliente.id,
                    role: role
                }

                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: process.env.TOKEN_EXPIRES
                })

                const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

                refreshTokens.push(refreshToken)

                return res.json({
                    role,
                    accessToken,
                    refreshToken
                })
            } else {
                return res.status(401).send({ error: 'Email ou senha inválidos' })
            }
        } catch (error) {
            return res.status(400).send(error)
        }
    },

    async refresh(req, res) {
        try {
            const role = req.headers.role

            if (!role) return res.sendStatus(400)

            const refreshToken = req.body.token

            if (!refreshToken) return res.sendStatus(401)
            if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
                if (error) return res.sendStatus(403)

                const accessToken = jwt.sign({ id: user.id, role }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: process.env.TOKEN_EXPIRES
                })

                res.json({ accessToken })
            })
        } catch (error) {
            return res.status(400).send(error)
        }
    },

    async logout(req, res) {
        try {
            const role = req.headers.role

            if (!role) return res.sendStatus(400)

            refreshTokens = refreshTokens.filter(token => token !== req.body.token)
            res.sendStatus(204)
        } catch (error) {
            return res.status(400).send(error)
        }
    }
}