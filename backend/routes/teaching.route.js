import express from 'express';
import { getTeaching, postTeaching } from '../controllers/teaching.controller.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/:reportId", protect, faculty, getTeaching);
router.post("/:reportId", protect, faculty, postTeaching);

export default router;