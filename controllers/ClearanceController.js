const Clearance = require('../models/clearance')
const HeadDepartment = require('../models/head-department')
const Requirements = require('../models/requirement')
const mongoose = require('mongoose')
const fs = require('fs')
var QRCode = require('qrcode')

module.exports = {
    // get over all clearances
    getAllClearance: async (req, res) => {
        try {
            await Clearance.find({}, async (err, clearances) => {
                if(err){res.status(500).json({ response: false, message:err.message})}
                if(clearances){
                    res.json({ response: true, data: clearances })
                }
            })
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    // get student clearances
    getClearance: async (req, res) => {
        try {
            let student = req.body.student

            await Clearance.find({student: student}).sort({academic_year: -1, semester: -1}).exec(async (err, clearance) => {
                if(err){res.status(500).json({ response: false, message:err.message})}
                if(clearance){
                    res.json({ response: true, data: clearance })
                }else{
                    res.status(500).json({ response: false, data: clearance })
                }
            })
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    // student clearance request
    createClearance: async (req, res) => {
        try {
            let student = req.body.student
            let academic_year = req.body.academic_year
            let semester = req.body.semester
            let course = req.body.course
            let section = req.body.section
            let year_level = req.body.year_level
            let existing = false
            let pending_request = false
            let incomplete = false

            await Clearance.find({student:student}, async(err, clearances)=>{
                if(err){ res.status(500).json({ response: false, message:err.message})}
                if(clearances){
                    for(let i=0;i<clearances.length;i++){
                        if(academic_year === clearances[i].academic_year){
                            if(semester === clearances[i].semester){
                                existing = true
                            }
                        }
                        if(!clearances[i].request_approved){
                            pending_request = true
                        }
                        if(!clearances[i].completed){
                            incomplete = true
                        }
                    }
                    if(existing){
                        res.json({ response: false, message:'You have already requested a clearance form for this semester on this academic year.'})
                    }else if(pending_request){
                        res.json({ response: false, message:'Unable to request clearance form because you have PENDING request.'})
                    }else if(incomplete){
                        res.json({ response: false, message:'Unable to request clearance form because you have INCOMPLETE clearance form.'})
                    }else{
                        clearance = new Clearance({
                            student: student,
                            academic_year: academic_year,
                            semester: semester,
                            course: course,
                            section: section,
                            year_level: year_level
                        })
                        await clearance.save(async (err, newClearance) => {
                            if(err){ res.status(500).json({ response: false, message:err.message}) }
                            if(newClearance){
                                await Clearance.updateMany({student:student, _id:{$ne:newClearance._id}}, {outdated: true}).exec((err, updatedClearances)=>{
                                    if(err){
                                        res.json({response: false, message: err.message})
                                    }else{
                                        res.status(201).json({response: true, message: 'Request Successful'})
                                    }
                                })
                                
                            }
                        })
                    }
                }
            })
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    // get all clearance requests
    getClearanceFormRequests: async (req, res) => {
        try {
            await Clearance.find({request_approved: false, outdated: false})
            .populate('student',['first_name','last_name','email'])
            .sort({created_at: -1})
            .exec( async (err, clearances) => {
                if(err){res.status(500).json({ response: false, message:err.message})}
                if(clearances){
                    res.json({ response: true, data: clearances })
                }
            })
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    // approve clearance request
    approveClearanceRequest: async (req, res) => {
        try {
            let clearance_id = req.body.id
            await Clearance.findOneAndUpdate({_id: clearance_id, request_approved: false}, { $set: { request_approved: true }}, {new: true }).exec(async (err, clearance) => {
                if(err) { res.status(500).json({ response: false, message: error.message }) }
                if(clearance){
                    await res.json({ response: true, message: 'Clearance approved.', data: clearance })
                }else{
                    res.status(500).json({ response: false, message: 'Clearance not found.' })
                }
            })
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    // clearance request signature
    requestSignature: async (req, res) => {
        try {

            // return res.json({response: true, data: req.files, message: 'Your requirements are uploaded successfully!'})
            let department_id = req.body.department_id
            let clearance_id = req.body.clearance_id
            let user_id = req.body.user_id
            let message = req.body.message
            let files = req.files
            
            requirements = new Requirements({
                student: user_id,
                department: department_id,
                clearance: clearance_id,
                files: files
            })
            requirements.message.push(message)
            await requirements.save(async (error, newRequirement) => {
                if(error) return res.json({response: false, message: error.message})
                if(newRequirement){
                    // return res.json({response: true, message: 'Requirements Uploaded successfully.'})

                    await Clearance.findOne({_id: clearance_id, request_approved: true, outdated: false})
                    .exec(async (err, clearance) => {
                        if(err) { return res.status(500).json({ response: false, message: err.message }) }
                        if(clearance){
                            if(clearance.departments_pending.includes(department_id)){
                                return res.status(500).json({ response: false, message: 'Already requested for this department.' })
                            }
                            clearance.departments_pending.push(department_id)
                            clearance.updated_at = Date.now()
                            let updatedClearance = await clearance.save()
                            return await res.json({ response: true, message: 'Signature Requested.', data: updatedClearance })
                        }else{
                            return res.status(500).json({ response: false, message: 'Clearance not found.' })
                        }
                    })
                }
            })
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }
    },
    // update request signature
    updateRequestSignature: async (req, res) => {
        try {
            let requirements_id = req.body.requirements_id
            let clearance_id = req.body.clearance_id
            let department_id = req.body.department_id
            let message = req.body.message
            let files = req.files

            await Requirements.findOne({_id: requirements_id}).exec(async (error, requirements)=>{
                if(error) return res.status(500).json({ response: false, message: error.message })
                if(requirements){
                    requirements.files.forEach(requirement => {
                        fs.unlinkSync(requirement.get('path'));
                    });
                    requirements.files = files
                    requirements.message.push(message)
                    requirements.updated_at = Date.now()

                    requirements.save(async error=>{
                        if(error) return res.status(500).json({ response: false, message: error.message })
                        await Clearance.findOne({_id: clearance_id, request_approved: true, outdated: false})
                        .exec(async (error, clearance) => {
                            if(error) return res.status(500).json({ response: false, message: error.message })
                            if(clearance){
                                if(clearance.departments_pending.includes(department_id)){
                                    return res.status(500).json({ response: false, message: 'Already requested for this department.' })
                                }
                                const index = clearance.departments_disapproved.indexOf(department_id)
                                if(index > -1){
                                    clearance.departments_disapproved.splice(index,1)
                                }
                                clearance.departments_pending.push(department_id)
                                clearance.updated_at = Date.now()
                                let updatedClearance = await clearance.save(async error=>{
                                    if(error) return res.status(500).json({ response: false, message: error.message })
                                    return await res.json({ response: true, message: 'Signature Requested.', data: updatedClearance })
                                })
                            }else{
                                return res.status(500).json({ response: false, message: 'Clearance not found.' })
                            }
                        })
                    })
                }else{
                    return res.status(500).json({ response: false, message: 'nothing found!' })
                }
            })
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }
    },
    // get student who requested signature
    getStudentRequest: async (req, res) => {
        try {
            let searchString = req.body.searchString
            let course = req.body.course
            let year_level = req.body.year_level

            await HeadDepartment.findOne({user_id:res.user.id}).exec(async (err, foundDept) => {
                if(err) return res.status(500).json({response:false, message: err.message})
                if(foundDept){
                    await Clearance.find({
                        $and: [
                            { departments_pending: foundDept._id },
                            { 
                                $and: [
                                    { course: { $in: course } },
                                    { year_level: { $in: year_level } }
                                ]
                            }
                        ]
                    })
                    .populate('student',['first_name','last_name','email'])
                    .exec(async (err, clearance) => {
                        if(err) return res.status(500).json({ response: false, message: err.message })
                        if(clearance.length>0){
                            let filteredClearanceByStudentDetails = await clearance.filter(item=>{
                                return (
                                    item.student.first_name.toLowerCase().includes(searchString.toLowerCase()) ||
                                    item.student.last_name.toLowerCase().includes(searchString.toLowerCase())
                                )
                            })
                            return res.json({ response: true, data: filteredClearanceByStudentDetails})
                        }else{
                            return res.json({ response: true, data: [] })
                        }
                    })
                }else{
                    res.json({response:false, message: 'not found', data: []})
                }
            })
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }
    },
    // get approved students by department
    getApprovedStudentsByDept: async (req, res) => {
        try {
            
            let searchString = req.body.searchString
            let section = req.body.section
            let course = req.body.course
            let semester = req.body.semester
            let year_level = req.body.year_level
            let academic_year = req.body.academic_year
            

            await HeadDepartment.findOne({user_id:res.user.id}).exec(async (err, foundDept) => {
                if(err) return res.status(500).json({response:false, message: err.message})
                if(foundDept){
                    await Clearance.find({
                        $and: [
                            { request_approved: true },
                            { 'departments_approved.dept_id': foundDept._id },
                            { 
                                $and: [
                                    { course: { $in: course } },
                                    { section: { $in: section } },
                                    { year_level: { $in: year_level } },
                                    { semester: { $in: semester } },
                                    { academic_year: { $in: academic_year } }
                                ]
                            }
                        ]
                    })
                    .populate('student',['first_name','last_name','email'])
                    .exec(async (err, clearance) => {
                        if(err) return res.status(500).json({ response: false, message: err.message })
                        if(clearance.length>0){
                            let filteredClearanceByStudentDetails = await clearance.filter(item=>{
                                return (
                                    item.student.first_name.toLowerCase().includes(searchString.toLowerCase()) ||
                                    item.student.last_name.toLowerCase().includes(searchString.toLowerCase())
                                )
                            })
                            return res.json({ response: true, data: filteredClearanceByStudentDetails})
                        }else{
                            return res.json({ response: true, data: [] })
                        }
                    })
                }else{
                    res.json({response:false, message: 'not found', data: []})
                }
            })
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }
    },
    // approve student request
    approveSignatureRequest: async (req, res) => {
        try {
            let clearance_id = req.body.clearance_id
            let user_id = res.user.id

            await HeadDepartment.findOne({user_id: user_id}).exec(async (err, foundDept) => {
                if(err) return res.status(500).json({response:false, message: err.message})
                if(foundDept){
                    await Clearance.findOne({
                        _id: clearance_id,
                        request_approved: true, 
                        outdated: false, 
                        departments_pending: foundDept._id
                    })
                    .populate('student',['first_name','last_name','email'])
                    .exec(async (err, clearance) => {
                        if(err) return res.status(500).json({ response: false, message: err.message })
                        if(clearance){
                            const index = clearance.departments_pending.indexOf(foundDept._id)
                            if(index > -1){
                                clearance.departments_pending.splice(index,1)
                            }
                            clearance.departments_approved.push({
                                dept_id: foundDept._id,
                                signature:foundDept.signature
                            })
                            let updatedClearance = await clearance.save()

                            // check if clearance is completed
                            if(clearance.departments_approved.length === 6){
                                clearance.completed = true;
                                await clearance.save()
                            }
                            // socket io
                            // console.log(clearance.student.email)
                            req.io.emit(clearance.student.email, `${foundDept.department_name} has been approved your signature request.`)

                            return res.json({ response: true, data: updatedClearance })
                        }else{
                            return res.json({ response: false, data: [] })
                        }
                    })
                }else{
                    res.json({response:false, message: 'not found', data: []})
                }
            })
        } catch (error) {
            res.status(500).json({response:false, message: error.message})
        }
    },
    getStudentRequirements: async (req, res) => {
        try {
            let department_id = req.body.department_id
            let clearance_id = req.body.clearance_id

            await Requirements.findOne({
                $and: [{department: department_id}, {clearance: clearance_id}]
            })
            .populate('clearance', ['academic_year','semester'])
            .populate('student')
            .exec((error, requirements)=>{
                if(error) return res.status(500).json({response:false, message: error.message})
                if(requirements){
                    return res.status(200).json({response: true, data: requirements, message: 'success' })
                }else{
                    return res.json({response: true, data: [] })
                }
            })
        } catch (error) {
            return res.status(500).json({response:false, message: error.message})
        }
    },
    getAvailableAcademicYear: async (req, res) => {
        try {
           await Clearance.find({}).select({"academic_year":1,"_id":0}).exec(async (error,clearance)=>{
               if(error) return res.status(500).json({response: false, message: error.message})
               let acad_year = []
               await clearance.forEach(item => {
                   acad_year.push(item.academic_year)
               });

               return res.status(200).json({response:true,data:[...new Set(acad_year)]})
           })
        } catch (error) {
            return res.status(500).json({response: false, message: error.message})
        }
    },
    // get complete clearance
    getCompletedClearance: async (req, res) =>{
        try {
            let student = req.body.student

            await Clearance.aggregate([
                {
                    $match: {
                        $and:[
                            {student:new mongoose.Types.ObjectId(student)},
                            // {completed:true}
                        ]
                    }
                },
                {
                    $lookup:{ from: 'students', localField: 'student', foreignField: '_id', as: 'student_info' }
                },
                {
                    $lookup:{ 
                        from: 'headdepartments', 
                        // localField: 'departments_approved', 
                        let: { dept_id: '$departments_approved.dept_id' },
                        // foreignField: '_id', 
                        'pipeline':[
                            { '$match': {}}
                        ],
                        as: 'departments' }
                }
            ]).exec(async (error, clearance) => {
                if(error) return res.json({response: false, message: error.message})
                if(clearance.length>0){
                    await QRCode.toDataURL(`${process.env.CLIENT_URL}/clearance/viewer/${clearance[0]._id}`, function (error, url) {
                        if(error) return res.status(500).json({ response: false, message: error.message })
                        return res.json({
                            response: true, 
                            data: clearance,
                            qr: url
                        })
                    })
                }else{
                    return res.json({ response: false, message: 'nothing found!' })
                }
            })
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }
    },
    // view clearance
    viewClearance: async (req, res) => {
        try{
            let clearance_id = req.params.id

            await Clearance.aggregate([
                {
                    $match: {
                        $and:[
                            {_id:new mongoose.Types.ObjectId(clearance_id)},
                        ]
                    }
                },
                {
                    $lookup:{ from: 'students', localField: 'student', foreignField: '_id', as: 'student_info' }
                },
                {
                    $lookup:{ 
                        from: 'headdepartments', 
                        // localField: 'departments_approved', 
                        let: { dept_id: '$departments_approved.dept_id' },
                        // foreignField: '_id', 
                        'pipeline':[
                            { '$match': {}}
                        ],
                        as: 'departments' }
                }
            ]).exec(async (error, clearance) => {
                if(error) return res.json({response: false, message: error.message})
                if(clearance.length>0){
                    await QRCode.toDataURL(`${process.env.CLIENT_URL}/clearance/viewer/${clearance[0]._id}`, function (error, url) {
                        if(error) return res.status(500).json({ response: false, message: error.message })
                        return res.json({
                            response: true, 
                            data: clearance,
                            qr: url
                        })
                    })
                }else{
                    return res.json({ response: false, message: 'nothing found!' })
                }
            })
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }
    },
    disapproveSignatureRequest: async (req, res) =>{
        try {
            let clearance_id = req.body.clearance_id
            let disapproved_message = req.body.disapproved_message
            let requirements_id = req.body.requirements_id
            let user_id = res.user.id

            await HeadDepartment.findOne({user_id: user_id}).exec(async (err, foundDept) => {
                if(err) return res.status(500).json({response:false, message: err.message})
                if(foundDept){
                    await Clearance.findOne({
                        _id: clearance_id,
                        request_approved: true, 
                        outdated: false, 
                        departments_pending: foundDept._id
                    })
                    .populate('student',['first_name','last_name','email'])
                    .exec(async (err, clearance) => {
                        if(err) return res.status(500).json({ response: false, message: err.message })
                        if(clearance){
                            const index = clearance.departments_pending.indexOf(foundDept._id)
                            if(index > -1){
                                clearance.departments_pending.splice(index,1)
                            }
                            clearance.departments_disapproved.push(foundDept._id)
                            let updatedClearance = await clearance.save(async error =>{
                                if(error) return res.status(500).json({ response: false, message: error.message })
                                await Requirements.findOne({_id: requirements_id}).exec(async(error,requirements)=>{
                                    if(error) return res.status(500).json({ response: false, message: error.message })
                                    if(requirements){
                                        requirements.disapproved_message.push(disapproved_message)
                                        await requirements.save(async error=>{
                                            if(error) return res.status(500).json({ response: false, message: error.message })
                                            // socket io
                                            // console.log(clearance.student.email)
                                            req.io.emit(clearance.student.email, `${foundDept.department_name} has been disapproved your signature request.`)
                                            return res.json({ response: true, data: updatedClearance })
                                        })
                                    }else{
                                        return res.json({response:false, message: 'requirements not found.'})
                                    }
                                })
                            })
                        }else{
                            return res.json({ response: false, data: [] })
                        }
                    })
                }else{
                    return res.json({response:false, message: 'not found', data: []})
                }
            })
        } catch (error) {
            return res.status(500).json({response:false, message: error.message})
        }
    },
    getCurrentClearanceDataByDept: async (req, res) => {
        try {
            let id = res.user.id
            let academic_year = req.body.academic_year
            let semester = req.body.semester
            await HeadDepartment.findOne({user_id: id}).exec(async (error,department)=>{
                if(error) return res.status(500).json({response: false, message:error.message})
                if(department){
                    const aprroved = await Clearance.countDocuments({
                        $and: [
                            {'departments_approved.dept_id': department._id},
                            {academic_year: academic_year},
                            {semester: semester},
                        ]
                    })
                    const disapproved = await Clearance.countDocuments({
                        $and: [
                            {departments_disapproved: department._id},
                            {academic_year: academic_year},
                            {semester: semester},
                        ]
                    })
                    const pending = await Clearance.countDocuments({
                        $and: [
                            {departments_pending: department._id},
                            {academic_year: academic_year},
                            {semester: semester},
                        ]
                    })

                    res.status(200).json({response:true, data: [aprroved,disapproved,pending]})
                }else{
                    res.status(200).json({response:true, data: [0,0,0]})
                }
            })
        } catch (error) {
            return res.status(500).json({response: false, message:error.message})
        }
    },
    getClearanceDataByDept: async (req, res) => {
        try {
            let id = res.user.id
            await HeadDepartment.findOne({user_id: id}).exec(async (error,department)=>{
                if(error) return res.status(500).json({response: false, message:error.message})
                if(department){
                    const aprroved = await Clearance.countDocuments({
                        'departments_approved.dept_id': department._id
                    })
                    const disapproved = await Clearance.countDocuments({
                        departments_disapproved: department._id
                    })
                    const pending = await Clearance.countDocuments({
                        departments_pending: department._id
                    })
                    res.status(200).json({response:true, data: [aprroved,disapproved,pending]})
                }else{
                    res.status(200).json({response:true, data: [0,0,0]})
                }
            })
        } catch (error) {
            return res.status(500).json({response: false, message:error.message})
        }
    },
    getApprovedStudentsByDeptForPrint: async (req, res) => {
        try {
            let semester = req.body.semester
            let academic_year = req.body.academic_year

            await HeadDepartment.findOne({user_id:res.user.id}).exec(async (err, foundDept) => {
                if(err) return res.status(500).json({response:false, message: err.message})
                if(foundDept){
                    await Clearance.find({
                        $and: [
                            { request_approved: true },
                            { 'departments_approved.dept_id': foundDept._id },
                            { 
                                $and: [
                                    { semester: { $in: semester } },
                                    { academic_year: { $in: academic_year } }
                                ]
                            }
                        ]
                    })
                    .populate('student',['first_name','last_name','email'])
                    .exec(async (err, clearance) => {
                        if(err) return res.status(500).json({ response: false, message: err.message })
                        if(clearance.length>0){
                            return res.json({ response: true, data: clearance})
                        }else{
                            return res.json({ response: true, data: [] })
                        }
                    })
                }else{
                    res.json({response:false, message: 'not found', data: []})
                }
            })
        } catch (error) {
            return res.status(500).json({ response: false, message: error.message })
        }
    },
    getClearanceCountByDept: async (req, res) => {
        try {
            let department_names = []
            let department_ids = []
            let pending_clearances = []
            let approved_clearances = []
            let disapproved_clearances = []
            await HeadDepartment.find({}).exec(async (error,depts)=>{
                if(error) return res.status(500).json({response:false, message:error.message})
                if(depts){
                    depts.forEach(dept => {
                        if(dept.department_name.includes('BSIT')){
                            department_names.push('IT Head')
                        }else if(dept.department_name.includes('BSOA')){
                            department_names.push('OA Head')
                        }else{
                            department_names.push(dept.department_name)
                        }
                        department_ids.push(dept._id)
                    });

                    let approved1 = await Clearance.countDocuments({ 'departments_approved.dept_id': department_ids[0]})
                    let approved2 = await Clearance.countDocuments({ 'departments_approved.dept_id': department_ids[1]})
                    let approved3 = await Clearance.countDocuments({ 'departments_approved.dept_id': department_ids[2]})
                    let approved4 = await Clearance.countDocuments({ 'departments_approved.dept_id': department_ids[3]})
                    let approved5 = await Clearance.countDocuments({ 'departments_approved.dept_id': department_ids[4]})
                    let approved6 = await Clearance.countDocuments({ 'departments_approved.dept_id': department_ids[5]})
                    let approved7 = await Clearance.countDocuments({ 'departments_approved.dept_id': department_ids[6]})
                    approved_clearances = [approved1,approved2,approved3,approved4,approved5,approved6,approved7]

                    let pending1 = await Clearance.countDocuments({ departments_pending: department_ids[0]})
                    let pending2 = await Clearance.countDocuments({ departments_pending: department_ids[1]})
                    let pending3 = await Clearance.countDocuments({ departments_pending: department_ids[2]})
                    let pending4 = await Clearance.countDocuments({ departments_pending: department_ids[3]})
                    let pending5 = await Clearance.countDocuments({ departments_pending: department_ids[4]})
                    let pending6 = await Clearance.countDocuments({ departments_pending: department_ids[5]})
                    let pending7 = await Clearance.countDocuments({ departments_pending: department_ids[6]})
                    pending_clearances = [pending1,pending2,pending3,pending4,pending5,pending6,pending7]

                    let disapproved1 = await Clearance.countDocuments({ departments_disapproved: department_ids[0]})
                    let disapproved2 = await Clearance.countDocuments({ departments_disapproved: department_ids[1]})
                    let disapproved3 = await Clearance.countDocuments({ departments_disapproved: department_ids[2]})
                    let disapproved4 = await Clearance.countDocuments({ departments_disapproved: department_ids[3]})
                    let disapproved5 = await Clearance.countDocuments({ departments_disapproved: department_ids[4]})
                    let disapproved6 = await Clearance.countDocuments({ departments_disapproved: department_ids[5]})
                    let disapproved7 = await Clearance.countDocuments({ departments_disapproved: department_ids[6]})
                    disapproved_clearances = [disapproved1,disapproved2,disapproved3,disapproved4,disapproved5,disapproved6,disapproved7]

                    return res.status(200).json({response:true, approved:approved_clearances, pending:pending_clearances, disapproved: disapproved_clearances, departments: department_names})
                }
            })
        } catch (error) {
            return res.status(500).json({response:false, message:error.message})
        }
    }
}
