const express = require('express')
const router = express.Router()
const CourseController = require('../controllers/CourseController')
const authRole = require('../middlewares/authRole')
const authenticate = require('../middlewares/authenticate')

// get all courses
router.get('/',
    CourseController.getCourses
)
// add course
router.post('/create',
    authenticate,
    authRole(['admin']),
    CourseController.addCourse
)
// update course
router.post('/update',
    authenticate,
    authRole(['admin']),
    CourseController.updateCourse
)

module.exports = router