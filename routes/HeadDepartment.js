const express = require('express')
const router = express.Router()
const HeadDepartmentController = require('../controllers/HeadDepartmentController')
const authRole = require('../middlewares/authRole')
const checkEmail = require('../middlewares/checkEmail')
const authenticate = require('../middlewares/authenticate')

// get all departments
router.post('/',
    authenticate,
    authRole(['admin','student']),
    HeadDepartmentController.getAllDepartments
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

module.exports = router