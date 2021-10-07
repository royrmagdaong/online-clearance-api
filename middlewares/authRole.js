function authRole(roles) {
    return (req, res, next) => {
        try {
            let valid = roles.find(role => {
                return role === res.user.role
            });
            if(!valid) return res.status(401).send({ message: "Not Allowed." })
            next()
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    }
}

module.exports = authRole