const Clearance = require('../models/clearance')

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
    createClearance: async (req, res) => {
        try {
            let student = req.body.student
            let academic_year = req.body.academic_year
            let semester = req.body.semester
            let course = req.body.course
            let section = req.body.section
            let year_level = req.body.year_level
            let existing = false

            await Clearance.find({student:student}, async(err, clearances)=>{
                if(err){ res.status(500).json({ response: false, message:err.message})}
                if(clearances){
                    for(let i=0;i<clearances.length;i++){
                        if(academic_year === clearances[i].academic_year){
                            if(semester === clearances[i].semester){
                                existing = true
                            }
                        }
                    }
                    if(!existing){
                        clearance = new Clearance({
                            student: student,
                            academic_year: academic_year,
                            semester: semester,
                            course: course,
                            section: section,
                            year_level: year_level
                        })
                        await clearance.save((err, newClearance) => {
                            if(err){ res.status(500).json({ response: false, message:err.message}) }
                            if(newClearance){
                                res.status(201).json({response: true, message: 'Request Successful'})
                            }
                        })
                    }else{
                        res.json({ response: false, message:'You have already requested a clearance form for this semester on this academic year.'})
                    }
                }
            })
        } catch (error) {
            res.status(500).json({ response: false, message: error.message })
        }
    },
    getClearanceFormRequests: async (req, res) => {
        try {
            await Clearance.find({request_approved: false})
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
    }
}
