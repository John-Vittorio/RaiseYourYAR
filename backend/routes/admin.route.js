import express from 'express';
import { 
  getAllFacultyWithReports, 
  getFacultyReports, 
  getFacultyReport,
  updateReportStatus 
} from '../controllers/admin.controller.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all faculty members with their report summaries (admin only)
router.get('/faculty', protect, admin, getAllFacultyWithReports);

// Get all reports for a specific faculty member (admin only)
router.get('/faculty/:facultyId/reports', protect, admin, getFacultyReports);

// Get a specific report for a faculty member (admin only)
router.get('/faculty/:facultyId/report/:reportId', protect, admin, getFacultyReport);

// Update report status (admin only) - for approving/reviewing reports
router.put('/report/:reportId/status', protect, admin, updateReportStatus);

export default router;