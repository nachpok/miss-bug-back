import {
  makeId,
  readJsonFile,
  writeJsonFile,
} from "../../services/util.service.js";

import { loggerService } from "../../services/logger.service.js";
import { dbService } from "../../services/db.service.js";
let data = await readJsonFile("data/user.json");

export const userService = {
  query,
  getById,
  remove,
  save,
  reset,
  getByUsername,
  addUser,
};

function query() {
  return data;
}

function getById(userId) {
  const user = data.find((user) => user._id === userId);
  return user;
}

function remove(userId) {
  data = data.filter((user) => user._id !== userId);
  _saveUserToFile();
}

function save(user) {
  if (user._id) {
    const idx = data.findIndex((user) => user._id === user._id);
    data[idx] = user;
  } else {
    user._id = makeId();
    data.push(user);
  }
  _saveUserToFile();
  return user;
}

async function addUser(user) {
  try {
    const collection = await dbService.getCollection("user");
    const res = await collection.insertOne(user);
    return res;
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
  console.log("service username", username);
  const collection = await dbService.getCollection("user");
  console.log("service collection", collection);
  const user = await collection.findOne({ username });
  console.log("service user", user);
  // data = await readJsonFile("data/user.json")
  // const user = data.find(user => user.username === username)
  return user;
}

function _saveUserToFile() {
  writeJsonFile("data/user.json", data);
}
