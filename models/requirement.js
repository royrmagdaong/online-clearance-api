const mongoose = require('mongoose')
const Schema = mongoose.Schema

const requirementSchema = Schema({
    user_id: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    student: {
        type: Schema.Types.ObjectId, 
        ref: 'Student'
    },
    clearance:{
        type: Schema.Types.ObjectId, 
        ref: 'Clearance'
    },
    department: {
        type: Schema.Types.ObjectId, 
        ref: 'HeadDepartment'
    },
    message: {
        type: String,
        default: null
    },
    files: [
        {
            type: Map,
            of: String
        }
    ],
    title:{
        type: String,
        default: null
    },
    instructions:{
        type: String,
        default: null
    },
    originalFileName:{
        type: String,
        default: null
    },
    mimetype:{
        type: String,
        default: null
    },
    filename:{
        type: String,
        default: null
    },
    path:{
        type: String,
        default: null
    },
    created_at:{
        type: Date,
        required: true,
        default: Date.now
    },
    updated_at:{
        type: Date,
        default: null
    },
    deleted_at:{
        type: Date,
        default: null
    }
})

module.exports = mongoose.model('Requirements', requirementSchema)