const User = require('../models/user')
const Student = require('../models/student')
const HeadDepartment = require('../models/head-department')
const Course = require('../models/course')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const saltRounds = 10;
const generateCode = require('../middlewares/generateCode');

module.exports = {
    // get all user
    getAllUser: async (req, res) => {
        try {
            let regexp = new RegExp("^"+ req.body.searchString, 'i')
            let admin = req.body.admin ? 'admin': null
            let department = req.body.department ? 'head-department': null
            let student = req.body.student ? 'student': null
            let users
            
            users = await User.find({ 
                $and: [
                    { email: regexp },
                    { deleted_at: null },
                    { role: { $in: [admin, department, student] } }
                ]
            })

            res.json({ response: true, data: users })
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    // get user total count
    getUserCounts: async (req, res) => {
        try {
            const adminCount = await User.countDocuments({role:'admin'});
            const studentCount = await Student.countDocuments();
            const departmentCount = await HeadDepartment.countDocuments();

            await res.json({ response: true, data: [adminCount,studentCount,departmentCount]})
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
                        email: req.body.email,
                        password: hashPassword,
                        verificationCode: generateCode()
                    })
                    await user.save((err, newUser) => {
                        if(err){
                            res.status(500).json({ response: false, message:err.message})
                        }else{
                            res.status(201).json({response: true, user: { email: req.body.email }})
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
                if(user.is_verified){
                    bcrypt.compare(req.body.password, user.password, (err, result) => {
                        if(err){
                            res.status(500).json({ err })
                        }else{
                            if(result){
                                jwt.sign({id: user._id, role: user.role, email: user.email}, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
                                    if(err){
                                        res.status(500).json({ message: err.message, reponse: false })
                                    }else{
                                        res.status(200).json({
                                            data: { id: user._id, role: user.role, email: user.email, token },
                                            response: true
                                        })
                                        // req.io.emit("admin", `${user.email} just logged in.`)
                                    }
                                });
                            }else{
                                res.status(500).json({ message: "incorrect password", reponse: false })
                            }
                        }
                    })
                }else{
                    res.status(500).json({ message: "User is not verified", reponse: false})
                }
            }else{
                res.status(500).json({ message: "Incorrect username or password", reponse: false})
            }
        } catch (error) {
            res.status(500).json({ message: "User doesn't exist.", reponse: false })
        }
    },
    // delete user
    deleteUser: async (req, res) => {
        let user = await User.findById(req.params.id).where('deleted_at').equals(null)
        user.deleted_at = Date.now
    
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
    },
    getStudentsByCourseCount: async (req, res) => {
        try {
            let courseCodes = []
            let studentCount = []
            // const studentCount = await Student.countDocuments({});
            await Course.find({},'code').exec(async (error, codes)=>{
                if(error) return res.status(500).json({ response: false, message: error.message })
                if(codes){
                    codes.forEach(code => {
                        courseCodes.push(code.code)
                    })
                    await Student.find({}).exec(async (error, students)=>{
                        if(error) return res.status(500).json({ response: false, message: error.message })
                        courseCodes.forEach(code=>{
                            let count = students.filter(item=>{
                                return code === item.course
                            })
                            studentCount.push(count.length)
                        })
                        return res.json({response:true, data:studentCount, codes: courseCodes})
                    })
                }
            })
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }
    },
}