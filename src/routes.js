const express = require('express')

const routes = express.Router()

const authRoute = require('./routes/auth.route')
const usuariosRoute = require('./routes/usuarios.route')
const clientesRoute = require('./routes/clientes.route')

routes.use('/auth', authRoute)
routes.use('/usuarios', usuariosRoute)
routes.use('/clientes', clientesRoute)

module.exports = routes;