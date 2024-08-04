import dayjs from 'dayjs'
import { bugService } from './bug.service.js'
import { getCountOfVisitedBugs } from '../../services/util.service.js'

export const getBugs = async (req, res) => {
    const { title, severity, createdAt, sortBy, isPaginated, page, labels } = req.query
    const filterBy = {}

    if (title && title.trim() !== '') filterBy.title = title
    if (severity && severity.trim() !== '') filterBy.severity = severity
    if (createdAt && createdAt.trim() !== '') filterBy.createdAt = createdAt
    if (sortBy && sortBy.trim() !== '') filterBy.sortBy = sortBy
    if (isPaginated && isPaginated.trim() !== '') filterBy.isPaginated = isPaginated
    if (page && page.trim() !== '') filterBy.page = page
    if (labels) filterBy.labels = labels

    try {
        const bugs = await bugService.query(filterBy)
        res.send(bugs)
    } catch (error) {
        res.status(404).send(error)
    }
}

export const getBug = async (req, res) => {
    const { bugId } = req.params

    if (!bugId) {
        res.status(400).send('Bug ID is required')
        return
    }

    try {
        // let visitedBugIds = req.cookies.visitedBugIds || []
        // if (!visitedBugIds.includes(bugId)) {
        //     visitedBugIds.push(bugId)
        //     res.cookie('visitedBugIds', visitedBugIds, { maxAge: 3 * 60 * 1000 })
        // }

        // if (visitedBugIds.length >= 3) {
        //     res.status(403).send('You have visited 3 bugs in the last 3 hours. Please wait before visiting more bugs.')
        //     return
        // }
        console.log("getBug", bugId)
        const bug = await bugService.getById(bugId)

        res.send(bug)
    } catch (error) {
        res.status(404).send(error)
    }
}

export const removeBug = async (req, res) => {
    const { bugId } = req.params

    if (!bugId) {
        res.status(400).send('Bug ID is required')
        return
    }

    try {
        await bugService.remove(bugId)
        res.send('Bug removed')
    } catch (error) {
        res.status(404).send(error)
    }
}

export const addBug = async (req, res) => {

    const { title, description, severity, labels, creator } = req.body
    if (!title || !description || !severity || !labels || !creator) {
        res.status(400).send('All fields are required')
        return
    }
    const bug = { title, description, severity, labels, createdAt: new Date().toISOString(), creator }

    try {
        await bugService.save(bug)
        res.send('Bug added')
    } catch (error) {
        res.status(404).send(error)
    }
}

export const updateBug = async (req, res) => {
    const { _id, title, description, severity, labels } = req.body

    if (!_id) {
        res.status(400).send('Bug ID is required')
        return
    }
    try {
        await bugService.save({ _id, title, description, severity, labels })
        res.send('Bug updated')
    } catch (error) {
        res.status(404).send(error)
    }
}