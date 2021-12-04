const express = require('express')
const router = express.Router()
const HeadDepartmentController = require('../controllers/HeadDepartmentController')
const authRole = require('../middlewares/authRole')
const checkEmail = require('../middlewares/checkEmail')
const authenticate = require('../middlewares/authenticate')

// for file uploads
const multer  = require('multer')
const upload = multer({ dest: 'uploads/signature' })
const upload_pic = multer({ dest: 'uploads/profile_pic' })


// get all departments
router.post('/',
    authenticate,
    authRole(['admin','student']),
    HeadDepartmentController.getAllDepartments
)
// get department
router.post('/department',
    authenticate,
    authRole(['admin','head-department']),
    HeadDepartmentController.getDepartment
)
// get all departments by course
router.post('/departments-bycourse',
    authenticate,
    authRole(['student']),
    HeadDepartmentController.getAllDepartmentsByCourse
)
// get department counts
router.get('/total-departments',
    authenticate,
    authRole(['admin']),
    HeadDepartmentController.getDepartmentsCounts
)
// create department
router.post('/create',
    authenticate, 
    checkEmail,
    authRole(['admin']),
    HeadDepartmentController.registerDepartment
)
// update department details
router.post('/update/:id',
    authenticate,
    authRole(['admin']),
    HeadDepartmentController.updateDepartmentDetails
)

// update department details
router.post('/upload-signature',
    authenticate,
    authRole(['admin']),
    upload.single('signature'),
    HeadDepartmentController.uploadSignatureImg
)
// view pic
router.get('/view/:id',
    HeadDepartmentController.viewProfPic
)
// Change prof pic
router.post('/change-prof-pic',
    authenticate,
    authRole(['head-department']),
    upload_pic.single('profilepicture'),
    HeadDepartmentController.changeProfilePic
)

module.exports = router