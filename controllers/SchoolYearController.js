const SchoolYear = require('../models/schoolyear')

module.exports = {
    getSchoolYear: async (req,res) => {
        try {
            await SchoolYear.findOne({}).exec(async (error,schoolyear)=>{
                if(error) res.status(500).json({response:false, message:error.message})
                if(schoolyear){
                    return res.status(200).json({response:true,data:schoolyear})
                }else{
                    return res.json({response:false, message:'nothing found'})
                }
            })
        } catch (error) {
            return res.status(500).json({response:false, message:error.message})
        }
    },
    updateSchoolYear: async (req, res) => {
        try {
            let semester = req.body.semester
            let academic_year = req.body.academic_year

            await SchoolYear.findOne({}).exec(async (error,schoolyear)=>{
                if(error) res.status(500).json({response:false, message:error.message})
                if(schoolyear){
                    schoolyear.SEMESTER = semester
                    schoolyear.ACADEMIC_YEAR = academic_year
                    schoolyear.updated_at = Date.now()
                    schoolyear.save(async error=>{
                        if(error) return res.status(500).json({response:false, message:error.message})
                        return res.status(200).json({response:true, message: 'School year updated successfully!'})
                    })
                }else{
                    return res.json({response:false, message:'nothing found'})
                }
            })
        } catch (error) {
            return res.status(500).json({response:false, message:error.message})
        }
    }
}