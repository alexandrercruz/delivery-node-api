const express = require('express')
const routes = express.Router()

const { administradores, estabelecimentos, clientes } = require('../roles')
const { authorize, hasRole } = require('../services/jwt.service')

const controller = require('../controllers/clientes.controller')

routes.get('/', authorize, hasRole(administradores), controller.index)
routes.get('/:id', authorize, hasRole(clientes), controller.show)
routes.post('/', controller.store)
routes.put('/', authorize, hasRole(clientes), controller.edit)
routes.delete('/:id', authorize, hasRole(administradores), controller.destroy)
routes.patch('/:id', authorize, hasRole(administradores), controller.restore)

module.exports = routes