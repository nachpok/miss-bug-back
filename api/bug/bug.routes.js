import express from 'express'
import { addBug, getBugs, getBug, updateBug, removeBug } from './bug.controller.js'
import { log } from '../../middlewares/log.middleware.js'

const router = express.Router()

router.get('/', log, getBugs)
router.get('/:bugId', log, getBug)
router.delete('/:bugId', log, removeBug)
router.post('/', log, addBug)
router.put('/:bugId', log, updateBug)

export const bugRoutes = router
