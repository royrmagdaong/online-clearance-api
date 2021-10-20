require('dotenv').config()
const seeder = require('mongoose-seed');
const bcrypt = require('bcrypt')
const Role = require('../models/role');
const generateCode = require('../middlewares/generateCode')
const User = require('../models/user')
const Student = require('../models/student')
const HeadDepartment = require('../models/head-department')

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
            await Role.findOne({ADMIN: 'admin'}).exec( async (err, roles) => {
                if(err) console.log(err)
                await bcrypt.hash(password, 10, async (err, hashPassword) => {
                    if(err){
                        console.log(err)
                    }else{
                        
                        const Users = {
                            'model': 'User',
                            'documents': [
                                {
                                    role: roles.ADMIN,
                                    name: "admin",
                                    email: "admin@gmail.com",
                                    password: hashPassword,
                                    verificationCode: generateCode(),
                                    is_verified: true
                                }
                            ]
                        }

                        for(let i = 1; i<4; i++){
                            console.log('hello world')
                            Users.documents.push({
                                role: roles.HEAD_DEPARTMENT,
                                name: `head department ${i}`,
                                email: `headdepartment${i}@gmail.com`,
                                password: hashPassword,
                                verificationCode: generateCode(),
                                is_verified: true
                            })

                            Users.documents.push({
                                role: roles.STUDENT,
                                name: `student ${i}`,
                                email: `student${i}@gmail.com`,
                                password: hashPassword,
                                verificationCode: generateCode(),
                                is_verified: true
                            })
                        }
            
                        data.push(Users)
                        
                        // load models
                        await seeder.loadModels([
                            './models/user'
                        ])
                    
                        // clear models
                        await seeder.clearModels([
                            'User',
                            'Student',
                            'HeadDepartment'
                        ], async ()=> {
                            // populate models
                            await seeder.populateModels(data, async () => {
                                seeder.disconnect();
                            })
                        })
                        
                        
                    }
                })
            })
        })
    })
})

var data = [
];