import { loggerService } from "../../services/logger.service.js";
import { makeId, readJsonFile } from "../../services/util.service.js";
import fs from "fs";
import dayjs from "dayjs";

const BUGS_PER_PAGE = 5

let bugs = readJsonFile("data/data.json").bugs
let labels = readJsonFile("data/data.json").labels

export const bugService = {
    query,
    getById,
    remove,
    save,
    reset
}

async function query(filterBy) {
    console.log('filterBy bug.service', filterBy)
    let bugsToReturn = bugs
    try {
        if (filterBy?.title) {
            const regex = new RegExp(`^${filterBy.title}`, 'i')
            bugsToReturn = bugsToReturn.filter(bug => regex.test(bug.title))
        }
        if (filterBy?.severity) {
            bugsToReturn = bugsToReturn.filter(bug => bug.severity == filterBy.severity)
        }
        if (filterBy?.createdAt) {
            bugsToReturn = bugsToReturn.filter(bug => dayjs(bug.createdAt).isSame(dayjs(filterBy.createdAt), 'day'))
        }

        if (filterBy?.labels && filterBy.labels.length > 0) {
            bugsToReturn = bugsToReturn.filter(bug =>
                bug.labelIds.some(labelId => filterBy.labels.includes(labelId))
            )
        }
        if (filterBy?.sortBy) {
            switch (filterBy.sortBy) {
                case 'severity':
                    bugsToReturn = bugsToReturn.sort((a, b) => a.severity - b.severity)
                    break
                case 'createdAt':
                    bugsToReturn = bugsToReturn.sort((a, b) => dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? 1 : -1)
                    break
                case 'title':
                    bugsToReturn = bugsToReturn.sort((a, b) => a.title.localeCompare(b.title))
                    break
                default:
                    bugsToReturn = bugsToReturn.sort((a, b) => dayjs(a[filterBy.sortBy]).isAfter(dayjs(b[filterBy.sortBy])) ? 1 : -1)
            }
        }
        if (filterBy?.isPaginated === 'true' && filterBy?.page) {
            const page = parseInt(filterBy.page)
            const bugsToSlice = bugsToReturn.slice((page - 1) * BUGS_PER_PAGE, page * BUGS_PER_PAGE)
            bugsToReturn = bugsToSlice
        }
        const data = {
            bugs: bugsToReturn,
            totalBugs: bugs.length,
            pageSize: BUGS_PER_PAGE,
            labels
        }
        return data
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
    const bugLabels = bug.labelIds.map(labelId => labels.find(label => label.id === labelId))
    bug.labels = bugLabels
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