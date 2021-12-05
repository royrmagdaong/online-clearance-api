const SchoolYear = require('../models/schoolyear')

module.exports = {
    getSchoolYear: async (req,res) => {
        try {
            await SchoolYear.findOne({}).exec(async (error,schoolyear)=>{
                if(error) res.status(500).json({response:false, message:error.message})
                if(schoolyear){
                    return res.status(200).json({response:true,data:schoolyear})
                }else{
                    return res.status(200).json({response:false, message:'nothing found'})
                }
            })
        } catch (error) {
            return res.status(500).json({response:false, message:error.message})
        }
    }
}