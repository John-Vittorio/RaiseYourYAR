import express from 'express';
import { getService, createService, updateService, deleteService } from '../controllers/service.controller.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/:reportId", protect, faculty, getService);
router.post("/:reportId", protect, faculty, createService);
router.put("/:serviceId", protect, faculty, updateService);
router.delete("/:serviceId", protect, faculty, deleteService);

export default router;