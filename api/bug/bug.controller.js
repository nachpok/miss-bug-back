import dayjs from 'dayjs'
import { bugService } from './bug.service.js'
import { getCountOfVisitedBugs } from '../../services/util.service.js'

//TODO add filter

let visitedBugs = []
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

        // const countOfVisitedBugs = getCountOfVisitedBugs(visitedBugs)
        const bug = await bugService.getById(bugId)
        const newCookie = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : [];
        visitedBugs.push(...newCookie)
        const countOfVisitedBugs = getCountOfVisitedBugs(visitedBugs)
        console.log('countOfVisitedBugs', countOfVisitedBugs)
        if (countOfVisitedBugs >= 3) {
            res.status(403).send('You have visited 3 bugs in the last 3 hours. Please wait before visiting more bugs.')
            return
        }
        const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const existingIndex = visitedBugs.findIndex(visit => visit.bugId === bugId);
        if (existingIndex !== -1) {
            visitedBugs[existingIndex].timestamp = currentTime;
        } else {
            visitedBugs.push({ bugId, timestamp: currentTime });
        }

        res.cookie('visitedBugs', JSON.stringify(visitedBugs), {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: false,
            secure: false, // false for development
            sameSite: 'lax',
            path: '/',
        });


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
    const { title, description, severity, labels } = req.body
    if (!title || !description || !severity || !labels) {
        res.status(400).send('All fields are required')
        return
    }
    const bug = { title, description, severity, labels, createdAt: new Date().toISOString() }

    try {
        await bugService.addBug(bug)
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