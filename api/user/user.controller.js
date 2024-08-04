import { userService } from './user.service.js'

export async function getUsers(req, res) {
    try {
        const users = await userService.query()
        res.send(users)
    } catch (err) {
        res.status(500).send(err)
    }
}

export async function getUser(req, res) {
    try {
        const { userId } = req.params
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        res.status(500).send(err)
    }
}

export async function updateUser(req, res) {
    try {
        const user = userService.save(req.body)
        res.send(user)
    } catch (err) {
        loggerService.error('Failed to update user', err)
        res.status(400).send({ err: 'Failed to update user' })
    }
}

export async function removeUser(req, res) {
    try {
        const { userId } = req.params
        const user = userService.remove(userId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        loggerService.error('Failed to delete user', err)
        res.status(400).send({ err: 'Failed to delete user' })
    }
}
