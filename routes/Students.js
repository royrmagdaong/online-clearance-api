const express = require('express')
const router = express.Router()
const StudentController = require('../controllers/StudentController')
const authRole = require('../middlewares/authRole')
const checkEmail = require('../middlewares/checkEmail')
const authenticate = require('../middlewares/authenticate')

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
    authenticate,
    authRole(['admin']),
    StudentController.verifyStudent
)

module.exports = router