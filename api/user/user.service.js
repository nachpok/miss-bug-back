import {
  makeId,
  readJsonFile,
  writeJsonFile,
} from "../../services/util.service.js";
import { ObjectId } from "mongodb";
import { loggerService } from "../../services/logger.service.js";
import { dbService } from "../../services/db.service.js";
let data = await readJsonFile("data/user.json");

export const userService = {
  query,
  getById,
  remove,
  update,
  reset,
  getByUsername,
  add,
};

async function query() {
  try {
    const collection = await dbService.getCollection("user");
    const users = await collection.find().toArray();
    return users;
  } catch (e) {
    throw Error("user.service.getById.e: ", e);
  }
}

async function getById(userId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(userId) };
    const collection = await dbService.getCollection("user");

    const user = await collection.findOne(criteria);
    return user;
  } catch (e) {
    throw Error("user.service.getById.e: ", e);
  }
}

async function remove(userId) {
  const collection = await dbService.getCollection("user");

  const criteria = { _id: ObjectId.createFromHexString(userId) };

  //TODO if (!loggedinUser.isAdmin) {
  // if (!loggedinUser.isAdmin) {
  //   criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id);
  // }
  const { deletedCount } = await collection.deleteOne(criteria);
  return deletedCount;
}

async function add(user) {
  try {
    const collection = await dbService.getCollection("user");
    const res = await collection.insertOne(user);
    return res;
  } catch (err) {
    console.log("err", err);
    throw err;
  }
}
async function update(user) {
  const criteria = { _id: ObjectId.createFromHexString(user._id) };
  const userToSave = { ...user };
  delete userToSave._id;
  delete userToSave.role;
  try {
    console.log("__ service, user to update: ", userToSave);
    const collection = await dbService.getCollection("user");
    const res = await collection.updateOne(criteria, { $set: userToSave });
    console.log("res: ", res);
    if (res.acknowledged) {
      console.log("returning user: ", user);
      return user;
    } else {
      throw Error("Error updating user");
    }
  } catch (err) {
    console.log("err", err);
    throw err;
  }
}

function reset() {
  data = readJsonFile("data/defaultUser.json");
  _saveUserToFile();
}

async function getByUsername(username) {
  const collection = await dbService.getCollection("user");
  const user = await collection.findOne({ username });
  return user;
}

function _saveUserToFile() {
  writeJsonFile("data/user.json", data);
}
