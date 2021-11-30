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
    },
    addCourse: async (req, res) => {
        try {
            let code = req.body.code
            let description = req.body.description
            let sections = req.body.sections
            let number_of_years = req.body.number_of_years

            let course = await new Course({
                code,
                description,
                sections,
                number_of_years
            })

            course.save(async error=>{
                if(error) return res.status(500).json({response: false, message: error.message})
                return res.status(201).json({response: true, data: course, message:`${code} - ${description} successfully added.`})
            })

        } catch (error) {
            return res.status(500).json({response: false, message: error.message})
        }
    },
    updateCourse: async (req, res) => {
        try {
            let course_id = req.body.course_id
            let code = req.body.code
            let description = req.body.description
            let sections = req.body.sections
            let number_of_years = req.body.number_of_years

            Course.findOne({_id:course_id}).exec(async (error,course)=>{
                if(error) return res.status(500).json({response: false, message: error.message})
                if(course){
                    course.code = code
                    course.description = description
                    course.sections = sections
                    course.number_of_years = number_of_years
                    course.updated_at = Date.now()
                    course.save(error=>{
                        if(error) return res.status(500).json({response: false, message: error.message})
                        return res.status(200).json({response: true, message: 'Updated successfully.'})
                    })
                }else{
                    return res.status(500).json({response: false, message: 'Course not found.'})
                }
            })
        } catch (error) {
            return res.status(500).json({response: false, message: error.message})
        }
    }
}
