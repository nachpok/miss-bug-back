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
import { log } from "../../middlewares/log.middleware.js";

const PAGE_SIZE = 5;
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

  try {
    const criteria = {};
    const sort = {};

    if (filterBy?.title) {
      criteria.title = { $regex: `^${filterBy.title}`, $options: "i" };
    }

    if (filterBy?.severity) {
      criteria.severity = parseInt(filterBy.severity);
    }

    if (filterBy?.createdAt) {
      const startOfDay = dayjs(filterBy.createdAt).startOf("day").toISOString();
      const endOfDay = dayjs(filterBy.createdAt).endOf("day").toISOString();
      criteria.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    if (filterBy?.labels && filterBy.labels.length > 0) {
      try {
        if (Array.isArray(filterBy.labels) && filterBy.labels.length > 0) {
          criteria.labels = { $in: filterBy.labels };
        }
      } catch (error) {
        console.error("Error parsing labels:", error);
        // Handle the error as needed
      }
    }

    if (filterBy?.creator) {
      try {
        if (/^[0-9a-fA-F]{24}$/.test(filterBy.creator)) {
          const creatorId = ObjectId.createFromHexString(filterBy.creator);
          criteria["creator._id"] = creatorId;
        } else {
          console.warn("Invalid creator ID format:", filterBy.creator);
        }
      } catch (e) {
        throw Error("Error with creator id");
      }
    }

    if (filterBy?.sortBy) {
      switch (filterBy.sortBy) {
        case "severity":
        case "createdAt":
        case "title":
          sort[filterBy.sortBy] = 1;
          break;
        default:
          sort[filterBy.sortBy] = 1;
      }
    }

    const collection = await dbService.getCollection("bug");
    let bugCursor = await collection.find(criteria, { sort });
    const totalBugs = await bugCursor.count();

    if (filterBy.pageIdx !== undefined) {
      bugCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE);
    }

    const bugs = await bugCursor.toArray();
    const allLabels = bugs.flatMap((bug) => bug.labels || []);
    const uniqueLabels = [...new Set(allLabels)];

    const hasNextPage = (filterBy.pageIdx + 1) * PAGE_SIZE < totalBugs;

    const data = {
      bugs: bugs,
      totalBugs: totalBugs,
      pageSize: PAGE_SIZE,
      labels: uniqueLabels,
      hasNextPage: hasNextPage,
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
