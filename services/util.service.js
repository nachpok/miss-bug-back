import dayjs from 'dayjs'
import fs from 'fs/promises';

export function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

export async function readJsonFile(path) {
    try {
        const str = await fs.readFile(path, 'utf8');
        const json = JSON.parse(str);
        return json;
    } catch (err) {
        console.error('Error reading JSON file:', err);
        throw err;
    }
}

export function writeJsonFile(path, data) {
    return fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}


export function getCountOfVisitedBugs(visitedBugs, timeframe = 3) {
    const filteredBugs = visitedBugs.filter(bug => dayjs().diff(bug.timestamp, 'hours') < timeframe);
    return filteredBugs.length
}