const express = require('express')
const router = express.Router()
const SchoolYearController = require('../controllers/SchoolYearController')
const authenticate = require('../middlewares/authenticate')
const authRole = require('../middlewares/authRole')

// get school year
router.post('/', 
    authenticate, 
    authRole(['admin','head-department','student']), 
    SchoolYearController.getSchoolYear
)
// update school year
router.post('/update', 
    authenticate, 
    authRole(['admin']), 
    SchoolYearController.updateSchoolYear
)

module.exports = router