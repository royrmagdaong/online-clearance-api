const express = require('express')
const router = express.Router()
const ClearanceController = require('../controllers/ClearanceController')
const authRole = require('../middlewares/authRole')
const authenticate = require('../middlewares/authenticate')

// for file uploads
const multer  = require('multer')
const upload = multer({ dest: 'uploads/requirements' })

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
    authRole(['student','admin','head-department']),
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
    upload.array('requirements', 10),
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
// disapprove signature request
router.post('/disapprove-signature-request',
    authenticate,
    authRole(['head-department']),
    ClearanceController.disapproveSignatureRequest
)
// get student requirements
router.post('/student-requirements',
    authenticate,
    authRole(['head-department']),
    ClearanceController.getStudentRequirements
)

// get student requirements
router.get('/acad-year',
    ClearanceController.getAvailableAcademicYear
),
// get completed clearance
router.post('/completed-clearance',
    authenticate,
    authRole(['student']),
    ClearanceController.getCompletedClearance
)

// check clearance
router.get('/viewer/:id',
    ClearanceController.viewClearance
)

module.exports = router