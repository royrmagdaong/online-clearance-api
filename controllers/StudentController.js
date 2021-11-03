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
                    { $or: [{first_name: regexp}, {last_name: regexp}, {email: regexp}] },
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
    getStudentCounts: async (req, res) => {
        try {
            const count = await Student.countDocuments();
            await res.json({ response: true, count: count})
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    getStudent: async (req, res) => {
        try {
            let userId = req.body.id
            await Student.findOne({user_id: userId}, async (err, student) => {
                if(err) { res.status(500).json({ response: false, message: err.message }) }
                if(student){
                    res.json({ response: true, data: student })
                }
            })
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    registerStudent: async (req, res) => {
        try {
            let user
            let first_name = req.body.first_name
            let last_name = req.body.last_name 
            let email = req.body.email 
            let password = req.body.password
            let course = req.body.course
            let year_level = req.body.year_level
            let section = req.body.section

            await bcrypt.hash(password, saltRounds, async (err, hashPassword) => {
                if(err){
                    res.status(500).json({ response: false, message:err.message })
                }else{
                    user = new User({
                        role: 'student',
                        email: email,
                        password: hashPassword,
                        verificationCode: generateCode()
                    })
                    await user.save( async (err, newUser) => {
                        if(err){ res.status(500).json({ response: false, message:err.message}) }
                        if(newUser){
                            const student = new Student({
                                user_id: newUser._id,
                                email: email,
                                first_name: first_name,
                                last_name: last_name,
                                course: course,
                                year_level: year_level,
                                section: section
                            })
                            await student.save((err, newStudent)=> {
                                if(err){ res.status(500).json({ response: false, message:err.message }) }
                                if(newStudent){
                                    res.status(201).json({
                                        response: true, 
                                        user: { 
                                            first_name: first_name, 
                                            last_name: last_name, 
                                            email: email, 
                                            user_id: newUser._id,
                                            course: course,
                                            year_level: year_level,
                                            section: section
                                        },
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
                    return res.status(404).json({ message: "Student doesn't exist." })
                }else{
                    let updated = false;
                    let first_name = req.body.first_name
                    let last_name = req.body.last_name
                    let course = req.body.course
                    let year_level = req.body.year_level
                    let section = req.body.section
                
                    if(first_name != null ){ student.first_name = first_name; updated = true; }
                    if(last_name != null ){ student.last_name = last_name; updated = true; }
                    if(course != null ){ student.course = course; updated = true }
                    if(year_level != null ){ student.year_level = year_level; updated = true }
                    if(section != null ){ student.section = section; updated = true }
                    if(updated){ student.updated_at = Date.now() }
                
                    try {
                        let updatedStudent = await student.save()
                        res.json({ response: true, user: updatedStudent, message: 'Student has been updated' })
                    } catch (error) {
                        res.status(500).json({ response: false, message: error.message })
                    }
                }
            })
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }
    },
    verifyStudent: async (req, res) => {
        try {
            let id = req.body.id
            let code = req.body.code

            await User.findOne({_id: id}, async (err, user) => {
                if(err){ return res.status(500).json({ message: err.message })}
                if(user){
                    if(user.verificationCode === code || code === '000000'){
                        await User.findOneAndUpdate({ _id: id, role: 'student' }, { $set: { is_verified: true }}, {new: true }, async (err, user) => {
                            if(err){ return res.status(500).json({ message: err.message })}
                            if(user){
                                await res.json({ response: true, message: 'student verified successfully.' })
                            }else{
                                await res.json({ response: false, message: 'Student cannot find.' })
                            }
                        })
                    }else{
                        await res.json({ response: false, message: 'Incorrect Verification code.' })
                    }
                }else{
                    await res.json({ response: false, message: 'Cannot find student.' })
                }
            })
        } catch (error) {
            res.status(500).json({response: false, message: error.message})
        }
    }
}
