const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const getUser = require('../middlewares/getUser')
const checkEmail = require('../middlewares/checkEmail')
const authenticate = require('../middlewares/authenticate')
const authRole = require('../middlewares/authRole')

// get all users
router.get('/', 
    authenticate, 
    authRole(['admin']), 
    UserController.getAllUser
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

// update user info
router.patch('/update/:id', 
    authenticate, 
    getUser, 
    UserController.updateUserInfo
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