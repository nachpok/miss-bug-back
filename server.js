import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { bugRoutes } from './api/bug/bug.routes.js'

const app = express();

const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5174'
    ],
    credentials: true
}


app.use(cors(corsOptions))
app.use(express.json()) // for parsing application/json
app.use(cookieParser())

app.use('/api/bug', bugRoutes)



const port = 3030
app.listen(port, () =>
    // loggerService.info(`Server listening on port http://localhost:${port}/`)
    console.log(`Server listening on port http://localhost:${port}/`)
)


// app.use('/api/bug', bugRoutes)

// app.get("/", (req, res) => {
//     res.send("Hello World");
// });

// app.get(`${baseUrl}`, async (req, res) => {
//     const { title, severity } = req.query
//     const filterBy = {
//         title,
//         severity: +severity
//     }
//     try {
//         const bugs = await bugService.query(filterBy)
//         res.send(bugs)
//     } catch (err) {
//         res.status(500).send(err)
//     }
// })

// app.get(`${baseUrl}/save`, async (req, res) => {
//     const { _id, title, severity, description } = req.query
//     const bugToSave = { _id, title, severity: +severity, description }
//     try {
//         const savedBug = await bugService.save(bugToSave)
//         res.send(savedBug)
//     } catch (err) {
//         res.status(500).send(err)
//     }
// })

// app.get(`${baseUrl}/reset`, async (req, res) => {
//     try {
//         await bugService.reset()
//         res.send("Bugs reset")
//     } catch (err) {
//         res.status(500).send("Could not reset bugs")
//     }
// })

// app.get(`${baseUrl}/:bugId`, async (req, res) => {
//     const { bugId } = req.params
//     try {
//         const bug = await bugService.getById(bugId)
//         res.send(bug)
//     } catch (err) {
//         console.log(err)
//         res.status(400).send("Could not find bug")
//     }
// })
// app.get(`${baseUrl}/:bugId/remove`, async (req, res) => {
//     const { bugId } = req.params
//     try {
//         await bugService.remove(bugId)
//         res.send("Bug removed")
//     } catch (err) {
//         res.status(500).send(err)
//     }
// })



// app.listen(3030, () => {
//     console.log("Server is running on port 3030");
// });