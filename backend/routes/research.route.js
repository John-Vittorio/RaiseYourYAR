import express from 'express';
import { getResearch, postResearch } from '../controllers/research.controller.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/:reportId", protect, faculty, getResearch);
router.post("/:reportId", protect, faculty, postResearch);

export default router;