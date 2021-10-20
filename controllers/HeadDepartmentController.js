const HeadDepartment = require('../models/head-department')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const generateCode = require('../middlewares/generateCode')
const saltRounds = 10;

module.exports = {
    getAllDepartments: async (req, res) => {
        try {
            let regexp = new RegExp("^"+ req.body.searchString, 'i')
            const headDepartments = await HeadDepartment.find({ 
                $and: [
                    { $or: [{email: regexp}, {name: regexp}, {mobile_number: regexp}, {telephone_number: regexp} ] },
                    { deleted_at: null }
                ]
            })
            res.json({response: true, data: headDepartments})
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }           
    },
    // get user total count
    getDepartmentsCounts: async (req, res) => {
        try {
            const count = await HeadDepartment.countDocuments();
            await res.json({ response: true, count: count})
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    // register department
    registerDepartment: async (req, res) => {
        try {
            let user
            let name = req.body.name
            let email = req.body.email
            let password = req.body.password
            let mobile_number = req.body.mobile_number
            let telephone_number = req.body.telephone_number

            await bcrypt.hash(password, saltRounds, async (err, hashPassword) => {
                if(err){
                    res.status(500).json({ response: false, message:err.message })
                }else{
                    user = new User({
                        role: 'head-department',
                        name: name,
                        email: email,
                        password: hashPassword,
                        verificationCode: generateCode()
                    })
                    await user.save( async (err, newUser) => {
                        if(err){ res.status(500).json({ response: false, message:err.message}) }
                        if(newUser){
                            const department = new HeadDepartment({
                                user_id: newUser._id,
                                email: email,
                                name: name,
                                mobile_number: mobile_number,
                                telephone_number: telephone_number
                            })
                            await department.save((err, newDepartment)=> {
                                if(err){ res.status(500).json({ response: false, message:err.message }) }
                                if(newDepartment){
                                    res.status(201).json({
                                        response: true, 
                                        user: { name, email, user_id: newUser._id },
                                        department: {
                                            name,
                                            email,
                                            mobile_number,
                                            telephone_number
                                        }
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
    updateDepartmentDetails: async (req, res) => {
        try {
            await HeadDepartment.findOne({user_id: req.params.id}, async (err, dept) => {
                if(err){ res.status(500).json({ message: error.message }) }
                if(!dept){
                    return res.status(404).json({ message: "Department doesn't exist." })
                }else{
                    let name = req.body.name
                    let email = req.body.email
                    let mobile_number = req.body.mobile_number
                    let telephone_number = req.body.telephone_number
                    let updated = false;
                
                    if(name != null ){ dept.name = name; updated = true; }
                    if(email != null ){ dept.email = email; updated = true; }
                    if(mobile_number != null ){ dept.mobile_number = mobile_number; updated = true }
                    if(telephone_number != null ){ dept.telephone_number = telephone_number; updated = true }
                    if(updated){ dept.updated_at = Date.now() }
                
                    try {
                        let updatedDept = await dept.save()
                        res.json({ user: updatedDept, message: 'department has been updated' })
                    } catch (error) {
                        res.status(500).json({ message: error.message })
                    }
                }
            })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }
}
