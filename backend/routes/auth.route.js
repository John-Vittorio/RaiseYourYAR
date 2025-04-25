import express from "express";
import { registerUser, loginUser, getUserProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Get user profile (protected route)
router.get("/profile", protect, getUserProfile);

export default router;