require('dotenv').config()
const seeder = require('mongoose-seed');
const bcrypt = require('bcrypt')
const Role = require('../models/role');
const generateCode = require('../middlewares/generateCode')
const User = require('../models/user')
const HeadDepartment = require('../models/head-department')
const Student = require('../models/student')
const Course = require('../models/course')
const Requirements = require('../models/requirement')
const fs = require('fs')
const path = require('path');

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
                        './models/clearance',
                        './models/requirement',
                    ])
                
                    // clear models
                    await seeder.clearModels([
                        'User',
                        'Student',
                        'HeadDepartment',
                        'Course',
                        'Clearance',
                        'Requirements'
                    ], async ()=> {

                        // create admin user
                        await createAdminUser(roles, hashPassword)

                        // populate user and department
                        await populateUserDepartment(roles, hashPassword)
                        
                        // populate user and student
                        await populateUserStudent(roles, hashPassword)

                        // populate course
                        await populateCourse()

                        // clear all files from requirements directory
                        await clearRequirements()

                        await setTimeout(()=>{
                            seeder.disconnect();
                        }, 1000)
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
        name: "Department Head (BSOA,COA,CHRM)",
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
        description: "BS in Information Technology",
        sections: ['A','B','C','D'],
        number_of_years: ['1st','2nd','3rd','4th']
    },
    {
        code: "BSOA",
        description: "BS in Office Administration",
        sections: ['A','B','C','D'],
        number_of_years: ['1st','2nd','3rd','4th']
    },
    {
        code: "COA",
        description: "Certificate in Office Administration",
        sections: ['A','B','C','D'],
        number_of_years: ['1st','2nd']
    },
    {
        code: "CCS",
        description: "Certificate in Computer Science",
        sections: ['A','B','C','D'],
        number_of_years: ['1st','2nd']
    },
    {
        code: "CHS",
        description: "Computer Hardware Servicing NCII",
        sections: ['A','B','C','D'],
        number_of_years: ['1st','2nd']
    },
    {
        code: "CHRM",
        description: "Certificate in Hotel and Restaurant Management",
        sections: ['A','B','C','D'],
        number_of_years: ['1st','2nd']
    }
]

const populateCourse = async () => {
    for(let i = 0; i<course.length;i++){
        let course_ = await new Course({
            code: course[i].code,
            description: course[i].description,
            sections: course[i].sections,
            number_of_years: course[i].number_of_years
        })
        await course_.save((err, newCourse) =>{
            if(err){ return console.log('failed to create course.') }
            if(newCourse){
                console.log(newCourse.code + ' course created.')
            }else{
                return console.log('failed to create course.') 
            }
        })
    }
}

const populateUserStudent = async (roles, hashPassword) => {
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
                    year_level: student[i].year_level,
                })
                stdt.profile_pic.set('type', 'img/png')
                stdt.profile_pic.set('base', 'base64')
                stdt.profile_pic.set('path', `./uploads/profile_pic/student`)
                stdt.profile_pic.set('filename', `student.png`)
                
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
}

const populateUserDepartment = async (roles, hashPassword) => {
    for(let i = 0; i<department.length;i++){
        let user = await new User({
            role: roles.HEAD_DEPARTMENT,
            email: department[i].email,
            password: hashPassword,
            verificationCode: generateCode(),
            is_verified: true
        })

        await user.save(async (err, newUser)=>{
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

                dept.signature.set('type', 'img/png')
                dept.signature.set('base', 'base64')
                dept.signature.set('path', `./uploads/signature/${department[i].email}`)
                dept.signature.set('img', await fs.readFileSync(`./uploads/signature/${department[i].email}.png`).toString('base64'))

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
}

const createAdminUser = async (roles, hashPassword) => {
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
}

const clearRequirements = async () => {
    const directory = 'uploads/requirements';

    fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
            console.log(`${file} from uploads/requirements is deleted.`)
        });
    }
    });
}