const User = require('../schema/user')

async function isAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login')
    }

    const user = await User.findById(req.session.userId)
    if (!user || user.role !== 'admin') {
        return res.status(403).redirect('/')
    }

    next()
}

module.exports = {isAdmin}