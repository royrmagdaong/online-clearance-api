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
// approve clearance  
router.post('/approve-clearance',
    authenticate, 
    authRole(['admin']),
    ClearanceController.approveClearanceRequest
)
// request signature
router.post('/request-signature',
    authenticate,
    authRole(['student']),
    ClearanceController.requestSignature
)
// get all student who requested signature
router.post('/students-signature-request',
    authenticate,
    authRole(['head-department']),
    ClearanceController.getStudentRequest
)
// get all approved students by department
router.post('/approved-students',
    authenticate,
    authRole(['head-department']),
    ClearanceController.getApprovedStudentsByDept
)
// approve signature request
router.post('/approve-signature-request',
    authenticate,
    authRole(['head-department']),
    ClearanceController.approveSignatureRequest
)

module.exports = router