import { userService } from './user.service.js'

export function getUsers(req, res) {
    const users = userService.query()
    res.send(users)
}

export function getUser(req, res) {
    const { userId } = req.params
    const user = userService.getById(userId)
    res.send(user)
}

export function updateUser(req, res) {
    const user = userService.save(req.body)
    res.send(user)
}

export function removeUser(req, res) {
    const { userId } = req.params
    const user = userService.remove(userId)
    res.send(user)
}
