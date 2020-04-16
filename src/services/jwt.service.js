const jwt = require('jsonwebtoken')

module.exports = {
    async authorize(req, res, next) {
        const { authorization } = req.headers

        if (authorization && authorization.split(' ')[0] === 'Bearer') {
            const token = authorization.split(' ')[1]

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) return res.sendStatus(403)
                req.user = user
                next()
            })
        } else {
            res.sendStatus(401)
        }
    },

    hasRole(role) {
        return (req, res, next) => {
            if (!req.user.roles.includes(role)) res.sendStatus(403)
            else next()
        }
    }
}