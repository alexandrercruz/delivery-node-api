const express = require('express')
const routes = express.Router()

const { administradores, estabelecimentos, clientes } = require('../roles')
const { authorize, hasRole } = require('../services/jwt.service')

const controller = require('../controllers/usuarios.controller')

routes.get('/', authorize, hasRole(administradores), controller.index)
routes.get('/:id', authorize, hasRole(administradores), controller.show)
routes.post('/', authorize, hasRole(administradores), controller.store)
routes.put('/', authorize, authorize, hasRole(administradores), controller.edit)
routes.delete('/:id', authorize, hasRole(administradores), controller.destroy)
routes.patch('/:id', authorize, hasRole(administradores), controller.restore)

module.exports = routes