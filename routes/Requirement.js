const express = require('express')
const router = express.Router()
const RequirementsController = require('../controllers/RequirementsController')
const authRole = require('../middlewares/authRole')
const checkEmail = require('../middlewares/checkEmail')
const authenticate = require('../middlewares/authenticate')

// for file uploads
const multer  = require('multer')
const upload = multer({ dest: 'uploads/requirements' })

// get requirement
router.get('/:id',
    RequirementsController.getRequirements
)

// upload requirements
router.post('/upload-requirements',
    authenticate,
    authRole(['head-department']),
    upload.single('requirements'),
    RequirementsController.uploadRequirements
)

module.exports = router