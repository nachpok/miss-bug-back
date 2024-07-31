import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { bugRoutes } from './api/bug/bug.routes.js'
import { userRoutes } from './api/user/user.routes.js'

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
app.use(express.json())
app.use(cookieParser())
app.use('/api/bug', bugRoutes)
app.use('/api/user', userRoutes)

app.get('/api/visit-count', (req, res) => {
    let visitCount = req.cookies.visitCount || 0
    visitCount++
    res.cookie('visitCount', visitCount)
    res.send(`You have visited this page ${visitCount} times.`)
})


const port = 3030
app.listen(port, () =>
    // loggerService.info(`Server listening on port http://localhost:${port}/`)
    console.log(`Server listening on port http://localhost:${port}/`)
)
