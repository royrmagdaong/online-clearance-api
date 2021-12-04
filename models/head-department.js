const mongoose = require('mongoose')
const Schema = mongoose.Schema

const headDepartmentSchema = Schema({
    user_id: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    signature:{
        type: Map,
        of: String,
        default: {}
    },
    profile_pic:{
        type: Map,
        of: String,
        default: {}
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

module.exports = mongoose.model('HeadDepartment', headDepartmentSchema)