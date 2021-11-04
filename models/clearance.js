const mongoose = require('mongoose')
const Schema = mongoose.Schema

const clearanceSchema = Schema({
    student: {
        type: Schema.Types.ObjectId, 
        ref: 'Student'
    },
    course: {
        type: String,
        default: null
    },
    section: {
        type: String,
        default: null
    },
    year_level: {
        type: String,
        default: null
    },
    departments_approved:[{
        type: Map,
        of: String
    }],
    departments_pending:[String],
    departments_disapproved:[String],
    academic_year: {
        type: String,
        default: null
    },
    semester:{
        type: String,
        default: null
    },
    completed:{
        type: Boolean, 
        default: false
    },
    request_approved:{
        type: Boolean, 
        default: false
    },
    outdated: {
        type: Boolean, 
        default: false
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

module.exports = mongoose.model('Clearance', clearanceSchema)