const User = require('../models/user')

async function checkEmail(req, res, next){
    try {
        await User.findOne({ email: req.body.email}, async (err, emailExists) => {
            if(err) return res.status(500).json(err)
            if(emailExists) return res.status(500).json({response: false, message: "email already exists."})
            next()
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = checkEmail