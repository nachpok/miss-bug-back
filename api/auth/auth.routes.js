import express from 'express'
import { login, logout, signup, validateUserByCookie } from './auth.controller.js'

const router = express.Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.post('/validate', validateUserByCookie)

export const authRoutes = router