const HeadDepartment = require('../models/head-department')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const generateCode = require('../middlewares/generateCode')
const saltRounds = 10;
const fs = require('fs')

module.exports = {
    getDepartment: async (req, res) => {
        try {
            let user_id = res.user.id
            await HeadDepartment.find({user_id: user_id}).exec((error,dept)=>{
                if(error) return res.status(500).json({ response: false, message: error.message })
                if(dept){
                    return res.status(201).json({ response: true, data: dept })
                }else{
                    return res.status(404).json({ response: false, message: 'not found.' })
                }
            })
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }
    },
    getAllDepartments: async (req, res) => {
        try {
            let regexp = new RegExp("^"+ req.body.searchString, 'i')
            const headDepartments = await HeadDepartment.find({ 
                $and: [
                    { $or: [{email: regexp}, {in_charge: regexp}, {department_name: regexp} , {mobile_number: regexp}, {telephone_number: regexp} ] },
                    { deleted_at: null }
                ]
            })
            return res.json({response: true, data: headDepartments})
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }           
    },
    getAllDepartmentsByCourse: async (req, res) => {
        try {
            let course = req.body.course
            const headDepartments = await HeadDepartment.find({
                $or:[
                    { department_name: {$regex:course} },
                    { department_name: {$regex:"^((?!,).)*$"} },
                ]
            }).exec(async (err, departments) =>{
                if(err) return res.status(500).json({response: false, message: err.message})
                if(departments){
                    return res.json({response: true, data: departments})
                }else{
                    return res.json({response: false, message: 'No departments found.'})
                }
            })
        } catch (error) {
            return res.json({response: false, message: error.message})
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
            let in_charge = req.body.in_charge
            let department_name = req.body.department_name
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
                        email: email,
                        password: hashPassword,
                        verificationCode: generateCode(),
                        is_verified: true
                    })
                    await user.save( async (err, newUser) => {
                        if(err){ res.status(500).json({ response: false, message:err.message}) }
                        if(newUser){
                            const department = new HeadDepartment({
                                user_id: newUser._id,
                                email: email,
                                in_charge: in_charge,
                                department_name: department_name,
                                mobile_number: mobile_number,
                                telephone_number: telephone_number
                            })
                            await department.save((err, newDepartment)=> {
                                if(err){ res.status(500).json({ response: false, message:err.message }) }
                                if(newDepartment){
                                    res.status(201).json({
                                        response: true,
                                        department: {
                                            in_charge,
                                            department_name,
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
                    let department_name = req.body.department_name
                    let in_charge = req.body.in_charge
                    let email = req.body.email
                    let mobile_number = req.body.mobile_number
                    let telephone_number = req.body.telephone_number
                    let updated = false;
                
                    if(department_name != null ){ dept.department_name = department_name; updated = true; }
                    if(in_charge != null ){ dept.in_charge = in_charge; updated = true; }
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
    },
    uploadSignatureImg: async (req, res) => {
        try {
            var img = fs.readFileSync(req.file.path);
            var encode_image = img.toString('base64');
            let id = req.body.dept_id
            // let in_charge = req.body.in_charge
            // let department_name = req.body.department_name
            // let mobile_number = req.body.mobile_number
            // let telephone_number = req.body.telephone_number

            await HeadDepartment.findOne({id:id}).exec( async (err, dept)=>{
                if(err) return res.status(500).json({response: false, message: err.message})
                if(dept){
                    dept.signature.set('type', req.file.mimetype)
                    dept.signature.set('base', 'base64')
                    dept.signature.set('path', req.file.path)
                    dept.signature.set('img', encode_image)
                    // dept.in_charge = in_charge
                    // dept.department_name = department_name
                    // dept.mobile_number = mobile_number
                    // dept.telephone_number = telephone_number
                    dept.updated_at = Date.now()
                    await dept.save()
                    return res.status(201).json({response: true, data: dept, message: 'Signature updated successfully'})
                }else{
                    return res.status(500).json({response: false, message: 'nothing found.'})
                }
            }) 
        } catch (error) {
            return res.status(500).json({response: false, message: error.message})
        }
    }
}
