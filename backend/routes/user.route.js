import express from "express";
const router = express.Router();

import { 
  createUser,
  getUserById,
  getUserByNetId,
  updateUser
} from "../controllers/user.controller.js";

// Create a new user
router.post("/", createUser);

// Get user by ID
router.get("/:userId", getUserById);

// Get user by Net ID
router.get("/netid/:netId", getUserByNetId);

// Update user
router.put("/:userId", updateUser);

export default router;