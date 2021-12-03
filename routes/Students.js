const express = require('express')
const router = express.Router()
const StudentController = require('../controllers/StudentController')
const authRole = require('../middlewares/authRole')
const checkEmail = require('../middlewares/checkEmail')
const authenticate = require('../middlewares/authenticate')

// for file uploads
const multer  = require('multer')
const upload_pic = multer({ dest: 'uploads/profile_pic' })

// get all students
router.post('/',
    authenticate,
    authRole(['admin']),
    StudentController.getAllStudents
)
// get student counts
router.get('/total-students',
    authenticate,
    authRole(['admin']),
    StudentController.getStudentCounts
)
// get student
router.post('/student-info',
    authenticate,
    authRole(['admin','student']),
    StudentController.getStudent
)
// register student
router.post('/create',
    checkEmail, 
    StudentController.registerStudent
)
// update student
router.patch('/update/:id',
    authenticate,
    authRole(['student']),
    StudentController.updateStudent
)
// verify student
router.post('/verify',
    StudentController.verifyStudent
)
// view pic
router.get('/view/:id',
    StudentController.viewProfPic
)
// Change prof pic
router.post('/change-prof-pic',
    authenticate,
    authRole(['student']),
    upload_pic.single('profilepicture'),
    StudentController.changeProfilePic
)

module.exports = router