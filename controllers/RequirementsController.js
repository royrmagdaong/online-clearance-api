const Requirements = require('../models/requirement')
const fs = require('fs')

module.exports = {
    getRequirements: async (req, res) => {
        try {
            let id = res.user.id
            await Requirements.find({user_id:id}).exec((error, requirements) => {
                if(error) return res.status(500).json({response: false, message: error.message})
                return res.status(200).json({response: true, data: requirements})
            })
        } catch (error) {
            return res.status(500).json({response: false, message: error.message})
        }
    },
    viewRequirements: async (req, res) => {
        try {
            let file_name = req.params.id
            // let mime_type = params.mime_type

            var stream = fs.createReadStream(`uploads/requirements/${file_name}`)
            stream.on('error',(error)=>{
                return res.status(404).json({ response: false, message: error.message })
            })
            var filename = file_name; 
            // Be careful of special characters

            filename = encodeURIComponent(filename);
            // Ideally this should strip them

            res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
            // res.setHeader('Content-type', mime_type);

            stream.pipe(res);
        } catch (error) {
            return res.json({response: false, message: error.message})
        }
    },
    uploadRequirements: async (req, res) => {
        try {
            let user_id = req.body.user_id
            let title = req.body.title
            let instructions = req.body.instructions
            let originalFileName = req.file.originalname
            let mimetype = req.file.mimetype
            let filename = req.file.filename
            let path = req.file.path

            requirements = new Requirements({
                user_id: user_id,
                title: title,
                instructions: instructions,
                originalFileName: originalFileName,
                mimetype: mimetype,
                filename: filename,
                path: path
            })

            await requirements.save((error, newRequirement) => {
                if(error) return res.json({response: false, message: error.message})
                if(newRequirement){
                    return res.json({response: true, message: 'Requirements Uploaded successfully.'})
                }
            })
        } catch (error) {
            return res.json({response: false, message: error.message})
        }
    },
}
