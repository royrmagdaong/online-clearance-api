const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schoolYearSchema = Schema({
    ACADEMIC_YEAR: {type: String, required: true},
    SEMESTER: {type: String, required: true},
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

module.exports = mongoose.model('SchoolYear', schoolYearSchema)