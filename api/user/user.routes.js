import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  removeUser,
  addUser,
} from "./user.controller.js";
import { requireAuth } from "../../middlewares/require-auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getUsers);
router.get("/:userId", requireAuth, getUser);
router.put("/", requireAuth, updateUser);
router.delete("/:userId", requireAuth, removeUser);
router.post("/", requireAuth, addUser);

export const userRoutes = router;
