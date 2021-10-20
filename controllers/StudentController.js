const bcrypt = require('bcrypt')
const Student = require('../models/student')
const User = require('../models/user')
const generateCode = require('../middlewares/generateCode')
const saltRounds = 10;



module.exports = {
    getAllStudents: async (req, res) => {
        try {
            let yearLevel = req.body.yearLevel
            let course = req.body.course

            let regexp = new RegExp("^"+ req.body.searchString, 'i')
            const student = await Student.find({ 
                $and: [
                    { $or: [{name: regexp}, {email: regexp}] },
                    { deleted_at: null },
                    { course: { $in: course } },
                    { year_level: { $in: yearLevel } }
                ]
             })
            res.json({ response: true, data: student })
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    // get user total count
    getStudentCounts: async (req, res) => {
        try {
            const count = await Student.countDocuments();
            await res.json({ response: true, count: count})
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    registerStudent: async (req, res) => {
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
                    await user.save( async (err, newUser) => {
                        if(err){ res.status(500).json({ response: false, message:err.message}) }
                        if(newUser){
                            const student = new Student({
                                user_id: newUser._id,
                                email: req.body.email
                            })
                            await student.save((err, newStudent)=> {
                                if(err){ res.status(500).json({ response: false, message:err.message }) }
                                if(newStudent){
                                    res.status(201).json({
                                        response: true, 
                                        user: { name: req.body.name, email: req.body.email, user_id: newUser._id },
                                    })
                                }
                            })
                        }
                    })
                    
                }
            })
        } catch (error) {
            res.status(500).json({response: false, message: error.message })
        }
    },
    updateStudent: async (req, res) => {
        try {
            await Student.findOne({user_id: req.params.id}, async (err, student) => {
                if(err){ res.status(500).json({ message: error.message }) }
                if(!student){
                    return res.status(404).json({ message: "User doesn't exist." })
                }else{
                    let name = req.body.name
                    let course = req.body.course
                    let year_level = req.body.year_level
                    let updated = false;
                
                    if(name != null ){ student.name = name; updated = true; }
                    if(course != null ){ student.course = course; updated = true }
                    if(year_level != null ){ student.year_level = year_level; updated = true }
                    if(updated){ student.updated_at = Date.now() }
                
                    try {
                        let updatedStudent = await student.save()
                        res.json({ user: updatedStudent, message: 'user has been updated' })
                    } catch (error) {
                        res.status(500).json({ message: error.message })
                    }
                }
            })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },
    verifyStudent: async (req, res) => {
        try {
            await User.findOneAndUpdate({ _id: req.body.user_id, role: 'student' }, { $set: { is_verified: true }},  {}, async (err, user) => {
                if(err){ return res.status(500).json({ message: err.message })}
                if(user){
                    await res.json({ message: 'student verified successfully.' })
                }else{
                    await res.json({ message: 'Student cannot find.' })
                }
            })
        } catch (error) {
            res.status(500).json({response: false, message: error.message})
        }
    }
}
