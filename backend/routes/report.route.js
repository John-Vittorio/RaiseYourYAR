import express from "express";
import { getReports, getReport, createReport, updateReport, deleteReport } from "../controllers/report.controller.js";
import { protect, faculty, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, faculty, getReports);
router.post("/", protect, faculty, createReport);
router.get("/:reportId", protect, faculty, getReport);
router.put("/:reportId", protect, faculty, updateReport);
router.delete("/delete/:reportId", protect, faculty, deleteReport);

export default router;