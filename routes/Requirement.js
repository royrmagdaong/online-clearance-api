const express = require('express')
const router = express.Router()
const RequirementsController = require('../controllers/RequirementsController')
const authRole = require('../middlewares/authRole')
const checkEmail = require('../middlewares/checkEmail')
const authenticate = require('../middlewares/authenticate')

// for file uploads
const multer  = require('multer')
const upload = multer({ dest: 'uploads/requirements' })

// get requirements
router.post('/',
    authenticate,
    authRole(['head-department', 'student']),
    RequirementsController.getRequirements
)

// view requirement
router.get('/view/:id',
    RequirementsController.viewRequirements
)

// upload requirements
router.post('/upload-requirements',
    authenticate,
    authRole(['head-department']),
    upload.single('requirements'),
    RequirementsController.uploadRequirements
)

// update requirements
router.post('/update-requirements',
    authenticate,
    authRole(['head-department']),
    upload.single('requirements'),
    RequirementsController.updateRequirements
)

module.exports = router