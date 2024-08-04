import { loggerService } from "../../services/logger.service.js";
import { makeId, readJsonFile, writeJsonFile } from "../../services/util.service.js";
import fs from "fs";
import dayjs from "dayjs";

const BUGS_PER_PAGE = 5


let bugs = []
let labels = []

async function loadData() {
    try {
        const data = await readJsonFile("data/data.json");
        bugs = data.bugs;
        labels = data.labels;
    } catch (err) {
        console.error('Error loading data:', err);
        bugs = [];
        labels = [];
    }
}

loadData();


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
            console.log(filterBy.labels)
            bugsToReturn = bugsToReturn.filter(bug => {
                return bug.labelIds?.some(labelId => filterBy.labels.includes(labelId))
            })
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
            totalBugs: bugs?.length,
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
    try {
        await _saveBugsToFile();
    } catch (err) {
        console.error('Error saving bugs to file after removal:', err);
        throw err; // or handle it as appropriate for your application
    }
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
    await _saveBugsDefaultBugsToFile()
}

function _saveBugsToFile(path = "data/data.json") {
    const dataToSave = {
        bugs: bugs,
        labels: labels
    };
    writeJsonFile(path, dataToSave);
}
///Users/nach/Documents/GitHub/miss-bug-back/data/data.json

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
            resolve()
        })
    })
}