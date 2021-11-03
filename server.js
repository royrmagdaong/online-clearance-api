require('dotenv').config()

const express = require('express')
var cors = require('cors');
const app = express()
const mongoose = require('mongoose')

app.use(express.json())
app.use(cors());


// Database connection
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

// import routes
const UserRoutes = require('./routes/Users')
const StudentRoutes = require('./routes/Students')
const DepartmentRoutes = require('./routes/HeadDepartment')
const ClearanceRoutes = require('./routes/Clearance')
const CourseRoutes = require('./routes/Course')

// Routes
app.use('/user', UserRoutes)
app.use('/student', StudentRoutes)
app.use('/head-department', DepartmentRoutes)
app.use('/clearance', ClearanceRoutes)
app.use('/course', CourseRoutes)


app.listen(process.env.PORT, () => console.log(`Server Started at port ${process.env.PORT}`))
