const express = require('express')
const router = express.Router()
const ClearanceController = require('../controllers/ClearanceController')
const authRole = require('../middlewares/authRole')
const authenticate = require('../middlewares/authenticate')

// get all clearances
router.post('/',
    authenticate,
    authRole(['admin']),
    ClearanceController.getAllClearance
)
// get all clearance form request
router.post('/clearance-form-request',
    authenticate,
    authRole(['admin']),
    ClearanceController.getClearanceFormRequests
)
// get clearance
router.post('/student-clearance',
    authenticate,
    authRole(['student','admin']),
    ClearanceController.getClearance
)
// request clearance
router.post('/create',
    authenticate, 
    authRole(['student']),
    ClearanceController.createClearance
)

module.exports = router