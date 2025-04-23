import express from "express";
const router = express.Router();

import { 
  getUserReports,
  createReport,
  submitTeachingData,
  submitResearchData,
  submitServiceData,
  submitReport,
  getReport
} from "../controllers/report.controller.js";

// Get all reports for a user
router.get("/user/:userId", getUserReports);

// Get a specific report
router.get("/:reportId", getReport);

// Create a new report
router.post("/", createReport);

// Submit teaching data
router.post("/:reportId/teaching", submitTeachingData);

// Submit research data
router.post("/:reportId/research", submitResearchData);

// Submit service data
router.post("/:reportId/service", submitServiceData);

// Submit the complete report
router.post("/:reportId/submit", submitReport);

export default router;