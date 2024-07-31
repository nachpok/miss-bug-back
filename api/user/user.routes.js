import express from 'express'
import { getUsers, getUser, updateUser, removeUser } from './user.controller.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:userId', getUser)
router.put('/', updateUser)
router.delete('/:userId', removeUser)
router.post('/', updateUser)

export const userRoutes = router
