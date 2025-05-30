module.exports = {
    isLoggedIn: (req, res , next) => {
        if (req.session.userId) {
            return next()
        } else {
            res.redirect('/login')
        }
    },
    isLoggedOut: (req, res, next) => {
        if (!req.session.userId) {
            return next()
        } else{
            res.redirect('/')
        }
    }
}