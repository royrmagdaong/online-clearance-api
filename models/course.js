const mongoose = require('mongoose')
const Schema = mongoose.Schema

const courseSchema = Schema({
    code:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    sections:{
        type: Array,
        required: true
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

module.exports = mongoose.model('Course', courseSchema)