const mongoose = require('mongoose')
const Schema = mongoose.Schema

const studentSchema = Schema({
    user_id: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    first_name:{
        type: String,
        default: null
    },
    last_name:{
        type: String,
        default: null
    },
    email:{
        type: String,
        required: true
    },
    course:{
        type: String,
        default: null
    },
    year_level:{
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

module.exports = mongoose.model('Student', studentSchema)