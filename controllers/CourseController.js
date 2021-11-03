const Course = require('../models/course')

module.exports = {
    getCourses: async (req,res) => {
        try {
            await Course.find({}).exec(async(err, courses)=>{
                if(err) return res.status(500).json({response: false, message: err.message})
                if(courses){
                    res.json({ response: true, data: courses })
                }else{
                    res.json({ response: true, data: [], message: 'course not found.' })
                }
            })
        } catch (error) {
            return res.status(500).json({response: false, message: error.message})
        }
    }
}
