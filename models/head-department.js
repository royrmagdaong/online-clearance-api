const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema

const headDepartmentSchema = Schema({
    user_id: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    in_charge:{
        type: String,
        required: true
    },
    department_name:{
        type: String,
        required: true
    },
    telephone_number:{
        type: String,
        default: null
    },
    mobile_number:{
        type: String,
        default: null
    },
    email:{
        type: String,
        required: true
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

module.exports = mongoose.model('HeadDepartment', headDepartmentSchema)