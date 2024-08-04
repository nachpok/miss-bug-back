import { makeId, readJsonFile, writeJsonFile } from "../../services/util.service.js";
import { loggerService } from "../../services/logger.service.js";
let data = await readJsonFile("data/user.json")

export const userService = {
    query,
    getById,
    remove,
    save,
    reset,
    getByUsername
}

function query() {
    return data;
}

function getById(userId) {
    const user = data.find(user => user._id === userId)
    return user
}

function remove(userId) {
    data = data.filter(user => user._id !== userId)
    _saveUserToFile()
}

function save(user) {
    if (user._id) {
        const idx = data.findIndex(user => user._id === user._id)
        data[idx] = user
    } else {
        user._id = makeId()
        data.push(user)
    }
    _saveUserToFile()
}
function reset() {
    data = readJsonFile("data/defaultUser.json")
    _saveUserToFile()
}
function getByUsername(username) {
    const user = data.find(user => user.username === username)
    return user
}

function _saveUserToFile() {
    writeJsonFile("data/user.json", data)
}