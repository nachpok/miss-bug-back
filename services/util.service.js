import dayjs from 'dayjs'
import fs from 'fs'

export function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

export function readJsonFile(path) {
    const str = fs.readFileSync(path, 'utf8')
    const json = JSON.parse(str)
    return json
}

export function writeJsonFile(path, data) {
    // const str = JSON.stringify(data)
    // fs.writeFileSync(path, str)
}

export function getCountOfVisitedBugs(visitedBugs, timeframe = 3) {
    const filteredBugs = visitedBugs.filter(bug => dayjs().diff(bug.timestamp, 'hours') < timeframe);
    return filteredBugs.length
}