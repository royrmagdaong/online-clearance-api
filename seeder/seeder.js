require('dotenv').config()
const seeder = require('mongoose-seed');
const bcrypt = require('bcrypt')
const Role = require('../models/role');
const generateCode = require('../middlewares/generateCode')
const User = require('../models/user')
const HeadDepartment = require('../models/head-department')
const Student = require('../models/student')
const Course = require('../models/course')

let password = 'password'

seeder.connect(process.env.DATABASE_URL, { useUnifiedTopology: true, useNewUrlParser: true }, async function() {
    await Role.deleteMany({}).exec(async (err)=>{
        if(err) console.log(err)
        console.log('roles collection cleared.')
        const roles = await new Role(
            {
                ADMIN: 'admin',
                HEAD_DEPARTMENT: 'head-department',
                STUDENT: 'student'
            }
        )

        await roles.save( async (err, newRoles) => {
            if(err) console.log(err)
            if(newRoles) console.log('roles created.')

            await bcrypt.hash(password, 10, async (err, hashPassword) => {
                if(err){
                    console.log(err)
                }else{
                    
                    // load models
                    await seeder.loadModels([
                        './models/user',
                        './models/student',
                        './models/head-department',
                        './models/course',
                        './models/clearance'
                    ])
                
                    // clear models
                    await seeder.clearModels([
                        'User',
                        'Student',
                        'HeadDepartment',
                        'Course',
                        'Clearance'
                    ], async ()=> {

                        let user = await new User({
                            role: roles.ADMIN,
                            email: "admin@ptc.com",
                            password: hashPassword,
                            verificationCode: generateCode(),
                            is_verified: true
                        })
                        await user.save(async(err, newUser)=>{
                            if(err){ return console.log('failed to create user admin.') }
                            else{
                                console.log('User Admin created.')
                            }
                        })
                        
                        // populate user and department
                        for(let i = 0; i<department.length;i++){
                            let user = await new User({
                                role: roles.HEAD_DEPARTMENT,
                                email: department[i].email,
                                password: hashPassword,
                                verificationCode: generateCode(),
                                is_verified: true
                            })
                            user.save(async (err, newUser)=>{
                                if(err){ return console.log('failed to create user department.') }
                                if(newUser){
                                    let dept = await new HeadDepartment({
                                        user_id: newUser._id,
                                        department_name: department[i].name,
                                        in_charge: department[i].in_charge,
                                        mobile_number: `0945875346${i}`,
                                        telephone_number: `56533${i}`,
                                        email: department[i].email
                                    })
                                    await dept.save(async (err, newDept) =>{
                                        if(err){ return console.log('failed to create user department.') }
                                        if(newDept){
                                            console.log(newDept.department_name + ' department created.')
                                        }else{
                                            return console.log('failed to create user department.') 
                                        }
                                    })
                                }else{
                                    return console.log('failed to create user department.') 
                                }
                            })
                        }
                        
                        // populate user and student
                        for(let i = 0; i<student.length;i++){
                            let user = await new User({
                                role: roles.STUDENT,
                                email: student[i].email,
                                password: hashPassword,
                                verificationCode: generateCode(),
                                is_verified: true
                            })
                            user.save(async (err, newUser)=>{
                                if(err){ return console.log('failed to create user student.') }
                                if(newUser){
                                    let stdt = await new Student({
                                        user_id: newUser._id,
                                        email: student[i].email,
                                        first_name: student[i].first_name,
                                        last_name: student[i].last_name,
                                        course: student[i].course,
                                        section: student[i].section,
                                        year_level: student[i].year_level
                                    })
                                    await stdt.save(async (err, newStudent) =>{
                                        if(err){ return console.log('failed to create user student.') }
                                        if(newStudent){
                                            console.log(newStudent.email + ' student created.')
                                        }else{
                                            return console.log('failed to create user student.') 
                                        }
                                    })
                                }else{
                                    return console.log('failed to create user student.') 
                                }
                            })
                        }

                        // populate course
                        for(let i = 0; i<course.length;i++){
                            let course_ = await new Course({
                                code: course[i].code,
                                description: course[i].description
                            })
                            await course_.save(async (err, newCourse) =>{
                                if(err){ return console.log('failed to create course.') }
                                if(newCourse){
                                    console.log(newCourse.code + ' course created.')
                                }else{
                                    return console.log('failed to create course.') 
                                }
                            })
                        }

                        setTimeout(()=>{
                            seeder.disconnect();
                        }, 2000)
                        
                    })
                }
            })
        })
    })
})

const department = [
    {
        name: "Library",
        in_charge: "Lesley Manalac",
        email: "library@ptc.com"
    },
    {
        name: "Registrar",
        in_charge: "Alice Meli",
        email: "registrar@ptc.com"
    },
    {
        name: "Accounting",
        in_charge: "Josephine Alexa",
        email: "accounting@ptc.com"
    },
    {
        name: "Guidance",
        in_charge: "Peterson Canry",
        email: "guidance@ptc.com"
    },
    {
        name: "Student Affairs",
        in_charge: "Judith Minoza",
        email: "studentaffairs@ptc.com"
    },
    {
        name: "Head Department (BSIT,CCS,CHS)",
        in_charge: "James Smith",
        email: "ithead@ptc.com"
    },
    {
        name: "Head Department (BSOA,COA,CHRM)",
        in_charge: "Meliza Qorazon",
        email: "oahead@ptc.com"
    }
]

const student = [
    {
        email: 'johndoe@gmail.com',
        first_name: 'John',
        last_name: 'Doe',
        course: 'BSIT',
        section: 'B',
        year_level: '1st'
    },
    {
        email: 'janedoe@gmail.com',
        first_name: 'Jane',
        last_name: 'Doe',
        course: 'BSOA',
        section: 'A',
        year_level: '1st'
    },
    {
        email: 'mariateresa@gmail.com',
        first_name: 'Maria',
        last_name: 'Teresa',
        course: 'BSOA',
        section: 'A',
        year_level: '4th'
    }
]

const course = [
    {
        code: "BSIT",
        description: "BS in Information Technology"
    },
    {
        code: "BSOA",
        description: "BS in Office Administration"
    },
    {
        code: "COA",
        description: "Certificate in Office Administration"
    },
    {
        code: "CCS",
        description: "Certificate in Computer Science"
    },
    {
        code: "CHS",
        description: "Computer Hardware Servicing NCII"
    },
    {
        code: "CHRM",
        description: "Certificate in Hotel and Restaurant Management"
    }
]
