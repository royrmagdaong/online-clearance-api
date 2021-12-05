const express = require('express')
const router = express.Router()
const SchoolYearController = require('../controllers/SchoolYearController')
const authenticate = require('../middlewares/authenticate')
const authRole = require('../middlewares/authRole')

// get all users
router.post('/', 
    authenticate, 
    authRole(['admin','head-department','student']), 
    SchoolYearController.getSchoolYear
)

module.exports = router