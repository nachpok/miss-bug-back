import { bugService } from './bug.service.js'

//TODO add filter
export const getBugs = async (req, res) => {
    const { title, severity, createdAt } = req.query
    const filterBy = {}

    if (title && title.trim() !== '') filterBy.title = title
    if (severity && severity.trim() !== '') filterBy.severity = severity
    if (createdAt && createdAt.trim() !== '') filterBy.createdAt = createdAt
    console.log('filterBy', filterBy)

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
        const bug = await bugService.getBug(bugId)
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
        await bugService.updateBug(_id, title, description, severity, labels)
        res.send('Bug updated')
    } catch (error) {
        res.status(404).send(error)
    }
}