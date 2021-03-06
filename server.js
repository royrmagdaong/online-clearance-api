require('dotenv').config()

const express = require('express')
var cors = require('cors');
const app = express()
const {createServer} = require('http')
const {Server} = require('socket.io')
const mongoose = require('mongoose')
const httpServer = createServer(app);
const io = new Server(httpServer, { cors:{ origin: '*'} });
var QRCode = require('qrcode')

app.use(express.json())
app.use(cors());

app.use((req, res, next)=>{
    req.io = io
    next()
})

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
const RequirementsRoutes = require('./routes/Requirement')
const SchoolYearRoutes = require('./routes/SchoolYear')

// Routes
app.use('/user', UserRoutes)
app.use('/student', StudentRoutes)
app.use('/head-department', DepartmentRoutes)
app.use('/clearance', ClearanceRoutes)
app.use('/course', CourseRoutes)
app.use('/requirements', RequirementsRoutes)
app.use('/school-year', SchoolYearRoutes)

// QR CODE URL PNG
// QRCode.toDataURL('youtube.com', function (err, url) {
//     console.log(url)
// })


// app.listen(process.env.PORT, () => console.log(`Server Started at port ${process.env.PORT}`))
httpServer.listen(process.env.PORT, () => console.log(`Server Started at port ${process.env.PORT}`))
