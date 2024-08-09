import dayjs from "dayjs";
import { bugService } from "./bug.service.js";
import { getCountOfVisitedBugs } from "../../services/util.service.js";
import { userService } from "../user/user.service.js";
export const getBugs = async (req, res) => {
  const { title, severity, createdAt, sortBy, pageIdx, labels, creator } =
    req.query;
  const filterBy = {};
  console.log("pageIdx: ", pageIdx);
  if (title && title.trim() !== "") filterBy.title = title;
  if (severity && severity.trim() !== "") filterBy.severity = severity;
  if (createdAt && createdAt.trim() !== "") filterBy.createdAt = createdAt;
  if (sortBy && sortBy.trim() !== "") filterBy.sortBy = sortBy;
  if (pageIdx && pageIdx.trim() !== "") filterBy.pageIdx = pageIdx;
  if (labels) filterBy.labels = labels;
  if (creator) filterBy.creator = creator;

  try {
    const bugs = await bugService.query(filterBy);
    res.send(bugs);
  } catch (error) {
    res.status(404).send(error);
  }
};

export const getBug = async (req, res) => {
  const { bugId } = req.params;

  if (!bugId) {
    res.status(400).send("Bug ID is required");
    return;
  }

  try {
    const bug = await bugService.getById(bugId);
    res.send(bug);
  } catch (error) {
    res.status(404).send(error);
  }
};

export const removeBug = async (req, res) => {
  const { bugId } = req.params;

  if (!bugId) {
    res.status(400).send("Bug ID is required");
    return;
  }

  try {
    await bugService.remove(bugId);
    res.send("Bug removed");
  } catch (error) {
    res.status(404).send(error);
  }
};

export const addBug = async (req, res) => {
  const { title, description, severity, labels, creator } = req.body;

  if (!title || !description || !severity || !labels || !creator) {
    res.status(400).send("All fields are required");
    return;
  }
  const bug = {
    title,
    description,
    severity,
    labels,
    createdAt: new Date().toISOString(),
    creator,
  };

  if (req.loggedinUser._id !== creator._id) {
    res.status(403).send(`User does not match creator`);
    return;
  }

  try {
    const newBug = await bugService.add(bug);
    console.log("controller newBug: ", newBug);
    res.json({ message: "Bug added", bug: newBug });
  } catch (error) {
    res.status(404).send(error);
  }
};

//TODO move logic to service
export const updateBug = async (req, res) => {
  const { _id, title, description, severity, labels } = req.body;

  if (!_id) {
    res.status(400).send("Bug ID is required");
    return;
  }
  try {
    // if (req.loggedinUser._id !== bug.creator._id && user.role !== "admin") {
    //   res.status(403).send(`User does not match creator`);
    //   return;
    // }
    console.log("controller update");

    const updatedBug = await bugService.update({
      _id,
      title,
      description,
      severity,
      labels,
    });
    res.json({ message: "Bug updated", bug: updatedBug });
  } catch (error) {
    res.status(404).send(error);
  }
};
