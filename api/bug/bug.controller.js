import dayjs from 'dayjs'
import { bugService } from './bug.service.js'
import { getCountOfVisitedBugs } from '../../services/util.service.js'
import { userService } from '../user/user.service.js'
export const getBugs = async (req, res) => {
    const { title, severity, createdAt, sortBy, isPaginated, page, labels, creator } = req.query
    const filterBy = {}

    if (title && title.trim() !== '') filterBy.title = title
    if (severity && severity.trim() !== '') filterBy.severity = severity
    if (createdAt && createdAt.trim() !== '') filterBy.createdAt = createdAt
    if (sortBy && sortBy.trim() !== '') filterBy.sortBy = sortBy
    if (isPaginated && isPaginated.trim() !== '') filterBy.isPaginated = isPaginated
    if (page && page.trim() !== '') filterBy.page = page
    if (labels) filterBy.labels = labels
    if (creator) filterBy.creator = creator
    console.log("getBugs", filterBy)
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
    console.log('controller removeBug', req.params)
    const { bugId } = req.params

    if (!bugId) {
        res.status(400).send('Bug ID is required')
        return
    }

    try {
        const bug = await bugService.getById(bugId)
        const isCreator = req.loggedinUser._id === bug?.creator?._id
        const user = await userService.getById(req.loggedinUser._id)
        const isAdmin = user.role === 'admin'
        if (!isCreator && !isAdmin) {
            res.status(403).send(`User does not match creator`)
            return
        }
        await bugService.remove(bugId)
        res.send('Bug removed')
    } catch (error) {
        res.status(404).send(error)
    }
}

export const addBug = async (req, res) => {

    const { title, description, severity, labels, creator } = req.body
    console.log('controller addBug 1', req.body)
    console.log('controller addBug 1', title, description, severity, labels, creator)
    if (!title || !description || !severity || !labels || !creator) {
        res.status(400).send('All fields are required')
        return
    }
    console.log('controller addBug 2  ', title, description, severity, labels, creator)
    const bug = { title, description, severity, labels, createdAt: new Date().toISOString(), creator }

    if (req.loggedinUser._id !== creator._id) {
        res.status(403).send(`User does not match creator`)
        return
    }

    try {
        const newBug = await bugService.save(bug)
        res.json({message: 'Bug added',bug: newBug})
    } catch (error) {
        res.status(404).send(error)
    }
}

//TODO move logic to service
export const updateBug = async (req, res) => {
    const { _id, title, description, severity, labels } = req.body

    if (!_id) {
        res.status(400).send('Bug ID is required')
        return
    }
    try {
        const bug = await bugService.getById(_id)

        if (!bug) {
            res.status(404).send('Bug not found')
            return
        }
        const user = await userService.getById(req.loggedinUser._id)

        if (!user) {
            res.status(404).send('User not found')
            return
        }

        if (req.loggedinUser._id !== bug.creator._id && user.role !== 'admin') {
            res.status(403).send(`User does not match creator`)
            return
        }
        const updatedBug = await bugService.save({ _id, title, description, severity, labels })
        res.json({message: 'Bug updated', bug: updatedBug})
    } catch (error) {
        res.status(404).send(error)
    }
}