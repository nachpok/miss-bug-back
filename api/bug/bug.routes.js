import express from 'express'
import { addBug, getBugs, getBug, updateBug, removeBug } from './bug.controller.js'
import { log } from '../../middlewares/log.middleware.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'
const router = express.Router()

router.get('/', log, getBugs)
router.get('/:bugId', log, getBug)
router.delete('/:bugId', log, requireAuth, removeBug)
router.post('/', log, requireAuth, addBug)
router.put('/:bugId', log, requireAuth, updateBug)

export const bugRoutes = router
