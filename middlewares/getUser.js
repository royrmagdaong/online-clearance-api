const User = require('../models/user')

async function getUser(req, res, next){
    let user
    try {
        user = await User.findById(req.params.id).where('deleted_at').equals(null)
        if(user == null){
            return res.status(404).json({ message: "User doesn't exist." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }

    res.foundUser = user
    next()
}

module.exports = getUser