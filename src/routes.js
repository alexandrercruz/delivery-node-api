const express = require('express')

const { validate } = require('./services/jwt.service')
const authController = require('./controllers/auth.controller')
const clienteController = require('./controllers/cliente.controller')

const routes = express.Router()

routes.post('/auth', authController.auth)
routes.put('/auth', authController.refresh)
routes.delete('/auth', authController.logout)

routes.get('/clientes', validate, clienteController.index)
routes.get('/clientes/:id', validate, clienteController.show)
routes.post('/clientes', clienteController.create)

module.exports = routes;