const express = require('express')
const routes = express.Router()

const { authorize } = require('../services/jwt.service')

const controller = require('../controllers/auth.controller')

routes.get('/:token', controller.validate)
routes.post('/', controller.auth)
routes.put('/', controller.refresh)
routes.delete('/', authorize, controller.logout)
routes.post('/forgot', controller.forgotPassword)
routes.post('/reset', controller.resetPassword)
    // routes.get('/reset/:token', (req, res, next) => {
    //     req.body.resetToken = req.params.token
    //     req.body.senha = '999999'
    //     next()
    // }, controller.resetPassword)

module.exports = routes