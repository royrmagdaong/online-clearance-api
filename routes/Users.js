const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const getUser = require('../middlewares/getUser')
const checkEmail = require('../middlewares/checkEmail')
const authenticate = require('../middlewares/authenticate')
const authRole = require('../middlewares/authRole')

// get all users
router.post('/', 
    authenticate, 
    authRole(['admin']), 
    UserController.getAllUser
)

// get user counts
router.get('/total-users',
    authenticate,
    authRole(['admin']),
    UserController.getUserCounts
)

// sign in user
router.post('/signin', 
    UserController.signInUser
)

// create user
router.post('/create', 
    authenticate, 
    checkEmail,
    authRole(['admin']),
    UserController.createUser
)

// deactivate user
router.post('/delete/:id', 
    authenticate, 
    authRole(['admin']),
    getUser,
    UserController.deleteUser
)

// get deleted users
router.get('/deleted', 
    authenticate, 
    authRole(['admin']),
    UserController.getDeletedUsers
)

// reactivate user
router.post('/reactivate/:id', 
    authenticate, 
    authRole(['admin']), 
    UserController.reactivateUser
)

module.exports = router