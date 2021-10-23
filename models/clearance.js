const mongoose = require('mongoose')
const moment = require('moment')
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
    departments_approved:[String],
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
    oudated: {
        type: Boolean, 
        default: false
    },
    created_at:{
        type: Date,
        required: true,
        default: moment(new Date()).format()
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