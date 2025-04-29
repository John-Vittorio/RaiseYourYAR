import express from 'express';
import { getTeaching, postTeaching, postCourse } from '../controllers/teaching.controller.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/:reportId", protect, faculty, getTeaching);
router.post("/:reportId", protect, faculty, postTeaching);
// Add this new route for individual course saving
router.post("/course/:reportId", protect, faculty, postCourse);

export default router;