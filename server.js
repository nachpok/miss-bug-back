import express from "express";
import cors from 'cors'
import { bugService } from './services/bug.service.js'

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
app.use(express.static('public'))

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get('/api/bug', async (req, res) => {
    const { title, severity } = req.query
    const filterBy = {
        title,
        severity: +severity
    }
    try {
        const bugs = await bugService.query(filterBy)
        res.send(bugs)
    } catch (err) {
        res.status(500).send(err)
    }
})

app.get('/api/bug/save', async (req, res) => {
    const { _id, title, severity } = req.query
    const bugToSave = { _id, title, severity: +severity }
    try {
        const savedBug = await bugService.save(bugToSave)
        res.send(savedBug)
    } catch (err) {
        res.status(500).send(err)
    }
})

app.get('/api/bug/reset', async (req, res) => {
    try {
        await bugService.reset()
        res.send("Bugs reset")
    } catch (err) {
        res.status(500).send("Could not reset bugs")
    }
})

app.get('/api/bug/:bugId', async (req, res) => {
    const { bugId } = req.params
    try {
        console.log(bugId)
        const bug = await bugService.getById(bugId)
        console.log(bug)
        res.send(bug)
    } catch (err) {
        console.log(err)
        res.status(400).send("Could not find bug")
    }
})
app.get('/api/bug/:bugId/remove', async (req, res) => {
    const { bugId } = req.params
    try {
        await bugService.remove(bugId)
        res.send("Bug removed")
    } catch (err) {
        res.status(500).send(err)
    }
})



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});