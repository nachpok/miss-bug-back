import { loggerService } from "./logger.service.js";
import { makeId, readJsonFile } from "./util.service.js";
import fs from "fs";


const bugs = readJsonFile("data/data.json")

export const bugService = {
    query,
    getById,
    remove,
    save,
    reset
}

async function query(filterBy) {
    let bugsToReturn = bugs
    try {
        if (filterBy.title) {
            const regex = new RegExp(`^${filterBy.title}`, 'i')
            bugsToReturn = bugsToReturn.filter(bug => regex.test(bug.title))
        }
        if (filterBy.severity) {
            bugsToReturn = bugsToReturn.filter(bug => bug.severity === filterBy.severity)
        }
        if (filterBy.createdAt) {
            bugsToReturn = bugsToReturn.filter(bug => bug.createdAt === filterBy.createdAt)
        }
        return bugsToReturn
    } catch (err) {
        loggerService.error(err)
        throw err
    }
}

async function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) {
        throw new Error("Could not find bug with id: " + bugId)
    }
    return bug
}

async function remove(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) {
        throw new Error("Could not find bug with id: " + bugId)
    }
    const bugIndex = bugs.indexOf(bug)
    bugs.splice(bugIndex, 1)
    await _saveBugsToFile()
}

async function save(bug) {
    if (bug._id) {
        const bugIdx = bugs.findIndex(b => b._id === bug._id)
        bugs[bugIdx] = bug
    } else {
        bug._id = makeId()
        bugs.push(bug)
    }
    await _saveBugsToFile()
    return bug
}

async function reset() {
    console.log("Resetting bugs..."); // Add logging
    await _saveBugsDefaultBugsToFile()
}

function _saveBugsToFile(path = "data/data.json") {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile(path, data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}

function _saveBugsDefaultBugsToFile() {
    const defaultBugs = readJsonFile("data/defaultData.json")
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(defaultBugs, null, 4)
        fs.writeFile("data/data.json", data, (err) => {
            if (err) {
                console.error("Error writing to data.json:", err); // Add logging
                return reject(err)
            }
            bugs = defaultBugs
            console.log("Bugs successfully reset to default"); // Add logging
            resolve()
        })
    })
}