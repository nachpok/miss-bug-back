import express from 'express'
import { addBug, getBugs, getBug, updateBug, removeBug } from './bug.controller.js'

const router = express.Router()

router.get('/', getBugs)
router.get('/:bugId', getBug)
router.delete('/:bugId', removeBug)
router.post('/', addBug)
router.put('/:bugId', updateBug)

export const bugRoutes = router
