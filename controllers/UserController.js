const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const saltRounds = 10;
const generateCode = require('../middlewares/generateCode')

module.exports = {
    // get all user
    getAllUser: async (req, res) => {
        try {
            const users = await User.find().where('deleted_at').equals(null)
            res.json({data: users})
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    // create any user
    createUser: async (req, res) => {
        try {
            let user
            await bcrypt.hash(req.body.password, saltRounds, async (err, hashPassword) => {
                if(err){
                    res.status(500).json({ response: false, message:err.message })
                }else{
                    user = new User({
                        role: req.body.role,
                        name: req.body.name,
                        email: req.body.email,
                        password: hashPassword,
                        verificationCode: generateCode()
                    })
                    await user.save((err, newUser) => {
                        if(err){
                            res.status(500).json({ response: false, message:err.message})
                        }else{
                            res.status(201).json({response: true, user: { name: req.body.name, email: req.body.email }})
                        }
                    })
                    
                }
            })
        } catch (error) {
            res.status(500).json({response: false, message: error.message })
        }
    },
    // sign in user
    signInUser: async (req, res) => {
        let user
        try {
            user = await User.findOne({ email: req.body.email}).where('deleted_at').equals(null)
            if(user){
                bcrypt.compare(req.body.password, user.password, (err, result) => {
                    if(err){
                        res.status(500).json({ err })
                    }else{
                        if(result){
                            jwt.sign({id: user._id, role: user.role, name: user.name, email: user.email}, process.env.SECRET_KEY, (err, token) => {
                                if(err){
                                    res.status(500).json({ message: err.message, reponse: false })
                                }else{
                                    res.status(200).json({
                                        data: { id: user._id, role: user.role, name: user.name, email: user.email, token },
                                        response: true
                                    })
                                }
                            });
                        }else{
                            res.status(500).json({ message: "incorrect password", reponse: false })
                        }
                    }
                })
            }else{
                res.status(500).json({ message: "Incorrect username or password", reponse: false})
            }
        } catch (error) {
            res.status(500).json({ message: "User doesn't exist.", reponse: false })
        }
    },
    // update user info
    updateUserInfo: async (req, res) => {
        let name = req.body.name
        let contact_num = req.body.contact_num
        let updated = false;
    
        if(name != null ){ res.foundUser.name = name; updated = true; }
        if(contact_num != null ){ res.foundUser.contact_num = contact_num; updated = true }
        if(updated){ res.foundUser.updated_at = Date.now() }
    
        try {
            let updatedUser = await res.foundUser.save()
            res.json({ user: updatedUser, message: 'user has been updated' })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },
    // delete user
    deleteUser: async (req, res) => {
        let user = await User.findById(req.params.id).where('deleted_at').equals(null)
        user.deleted_at = Date.now()
    
        try {
            let deletedUser = await user.save()
            return res.json({ user: deletedUser, message: "user deleted"})
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },
    // get deleted user
    getDeletedUsers: async (req, res) => {
        try {
            const users = await User.find().where('deleted_at').ne(null)
            res.json({ users: users })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },
    // reactivate deleted user
    reactivateUser: async (req, res) => {
        try {
            let user = await User.findById(req.params.id).where('deleted_at').ne(null)
            if(user != null){
                user.deleted_at = null
                let updatedUser = await user.save()
                res.json({ user: updatedUser, message: "user reactivated"})
            }else{
                res.json({ message: 'cannot find user' })
            }
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}