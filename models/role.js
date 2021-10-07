const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roleSchema = Schema({
    ADMIN: {type: String, required: true, default: 'admin'},
    HEAD_DEPARTMENT: {type: String, required: true, default: 'head-department'},
    STUDENT: {type: String, required: true, default: 'student'}
})

module.exports = mongoose.model('Role', roleSchema)