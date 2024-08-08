import { loggerService } from "../../services/logger.service.js";
import { ObjectId } from "mongodb";

import {
  makeId,
  readJsonFile,
  writeJsonFile,
} from "../../services/util.service.js";
import fs from "fs";
import dayjs from "dayjs";
import { dbService } from "../../services/db.service.js";
import { asyncLocalStorage } from "../../services/als.service.js";
import { updateBug } from "./bug.controller.js";

const BUGS_PER_PAGE = 5;
let bugs = [];
let labels = [];

async function loadData() {
  try {
    // const data = await readJsonFile("data/data.json");
    // bugs = data.bugs;
    // labels = data.labels;
    const collection = await dbService.getCollection("bug");
    const bugs = await collection.find().toArray();
    const allLabels = bugsToReturn.flatMap((bug) => bug.labels || []);
    const labels = [...new Set(allLabels)];

    console.log("bugs", bugs);
  } catch (err) {
    console.error("Error loading data:", err);
    bugs = [];
    labels = [];
  }
}

// loadData();

export const bugService = {
  query,
  getById,
  remove,
  save,
  reset,
  add,
  update,
};

async function query(filterBy) {
  console.log("filterBy", filterBy);
  // const criteria = _buildCriteria(filterBy)
  const collection = await dbService.getCollection("bug");
  let bugsToReturn = await collection.find().toArray();

  try {
    if (filterBy?.title) {
      const regex = new RegExp(`^${filterBy.title}`, "i");
      bugsToReturn = bugsToReturn.filter((bug) => regex.test(bug.title));
    }
    if (filterBy?.severity) {
      bugsToReturn = bugsToReturn.filter(
        (bug) => bug.severity == filterBy.severity
      );
    }
    if (filterBy?.createdAt) {
      bugsToReturn = bugsToReturn.filter((bug) =>
        dayjs(bug.createdAt).isSame(dayjs(filterBy.createdAt), "day")
      );
    }

    if (filterBy?.labels && filterBy.labels.length > 0) {
      bugsToReturn = bugsToReturn.filter((bug) => {
        return bug.labels?.some((labelId) => filterBy.labels.includes(labelId));
      });
    }

    if (filterBy?.sortBy) {
      switch (filterBy.sortBy) {
        case "severity":
          bugsToReturn = bugsToReturn.sort((a, b) => a.severity - b.severity);
          break;
        case "createdAt":
          bugsToReturn = bugsToReturn.sort((a, b) =>
            dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? 1 : -1
          );
          break;
        case "title":
          bugsToReturn = bugsToReturn.sort((a, b) =>
            a.title.localeCompare(b.title)
          );
          break;
        default:
          bugsToReturn = bugsToReturn.sort((a, b) =>
            dayjs(a[filterBy.sortBy]).isAfter(dayjs(b[filterBy.sortBy]))
              ? 1
              : -1
          );
      }
    }

    if (filterBy?.isPaginated === "true" && filterBy?.page) {
      const page = parseInt(filterBy.page);
      const bugsToSlice = bugsToReturn.slice(
        (page - 1) * BUGS_PER_PAGE,
        page * BUGS_PER_PAGE
      );
      bugsToReturn = bugsToSlice;
    }

    if (filterBy?.creator) {
      bugsToReturn = bugsToReturn.filter(
        (bug) => bug?.creator?._id === filterBy.creator
      );
    }

    const allLabels = bugsToReturn.flatMap((bug) => bug.labels || []);
    const uniqueLabels = [...new Set(allLabels)];

    const data = {
      bugs: bugsToReturn,
      totalBugs: bugsToReturn?.length,
      pageSize: BUGS_PER_PAGE,
      labels: uniqueLabels,
    };
    return data;
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}

async function getById(bugId) {
  const criteria = { _id: ObjectId.createFromHexString(bugId) };
  const collection = await dbService.getCollection("bug");

  const bug = await collection.findOne(criteria);
  console.log("__get service");
  if (!bug) {
    throw new Error("Could not find bug with id: " + bugId);
  }

  return bug;
}

async function remove(bugId) {
  console.log("service.remove.id: ", bugId);
  try {
    const collection = await dbService.getCollection("bug");

    const criteria = { _id: ObjectId.createFromHexString(bugId) };

    //TODO if (!loggedinUser.isAdmin) {
    // if (!loggedinUser.isAdmin) {
    //   criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id);
    // }
    const { deletedCount } = await collection.deleteOne(criteria);
    return deletedCount;
  } catch (err) {
    console.error("Error saving bugs to file after removal:", err);
    throw err; // or handle it as appropriate for your application
  }
}

async function save(bug) {
  console.log("bug", bug);
  if (bug._id) {
    // const bugIdx = bugs.findIndex((b) => b._id === bug._id);
    // bugs[bugIdx] = { ...bugs[bugIdx], ...bug };
  } else {
    const bugToAdd = {
      title: bug.title,
      severity: bug.severity,
      description: bug.description,
      labels: bug.labels,
      createdAt: dayjs().toISOString(),
      creator: {
        _id: ObjectId.createFromHexString(bug.creator._id),
        fullname: bug.creator.fullname,
      },
    };
    console.log("bugToAdd", bugToAdd);
    const collection = await dbService.getCollection("bug");
    console.log("collection", collection);
    const res = await collection.insertOne(bugToAdd);

    console.log("res", res);
    return reviewToAdd;
  }

  return bug;
}

async function add(bug) {
  //   const { loggedinUser } = asyncLocalStorage.getStore();
  //TODO get creatore from als
  const bugToAdd = {
    title: bug.title,
    severity: bug.severity,
    description: bug.description,
    labels: bug.labels,
    createdAt: dayjs().toISOString(),
    creator: {
      _id: ObjectId.createFromHexString(bug.creator._id),
      fullname: bug.creator.fullname,
    },
  };

  try {
    const collection = await dbService.getCollection("bug");
    const res = await collection.insertOne(bugToAdd);
    return res;
  } catch (e) {
    console.error("bug.service addBug, e:", e);
    throw Error("Failed to add but");
  }
}

async function update(bug) {
  console.log("__update");

  const criteria = { _id: ObjectId.createFromHexString(bug._id) };
  delete bug._id;
  const bugToSave = { ...bug };
  try {
    const collection = await dbService.getCollection("bug");
    await collection.updateOne(criteria, { $set: bugToSave });
    return bug;
  } catch (e) {
    throw Error("bug.service.update.e: ", e);
  }
}

async function reset() {}
