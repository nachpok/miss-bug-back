import { userService } from "./user.service.js";
import { bugService } from "../bug/bug.service.js";

export async function getUsers(req, res) {
  try {
    _isAdmin(req, res, async () => {
      const users = await userService.query();
      res.send(users);
    });
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function getUser(req, res) {
  try {
    const { userId } = req.params;
    _isAdmin(req, res, async () => {
      const user = await userService.getById(userId);
      res.send(user);
    });
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function updateUser(req, res) {
  try {
    _isAdmin(req, res, async () => {
      const user = userService.save(req.body);
      res.send(user);
    });
  } catch (err) {
    loggerService.error("Failed to update user", err);
    res.status(400).send({ err: "Failed to update user" });
  }
}

export async function addUser(req, res) {
  try {
    const user = userService.addUser(req.body);
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function removeUser(req, res) {
  console.log("removeUser", req.params);

  try {
    _isAdmin(req, res, async () => {
      const hasBugs = await bugService.query({ userId: req.params.userId });
      if (
        hasBugs?.bugs?.some((bug) => bug?.creator?._id === req.params.userId)
      ) {
        res.status(403).send("User has bugs");
        return;
      }
      const { userId } = req.params;
      const user = userService.remove(userId);
      res.send({ msg: "Deleted successfully" });
    });
  } catch (err) {
    loggerService.error("Failed to delete user", err);
    res.status(400).send({ err: "Failed to delete user" });
  }
}

async function _isAdmin(req, res, next) {
  try {
    const user = await userService.getById(req.loggedinUser._id);
    if (user.role !== "admin") {
      res.status(403).send("Admin required");
      return;
    }
    next();
  } catch (err) {
    res.status(500).send(err);
  }
}
