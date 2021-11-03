const express = require('express')
const router = express.Router()
const CourseController = require('../controllers/CourseController')
const authRole = require('../middlewares/authRole')
const authenticate = require('../middlewares/authenticate')

// get all courses
router.get('/',
    CourseController.getCourses
)

module.exports = router