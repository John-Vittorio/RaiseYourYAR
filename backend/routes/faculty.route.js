import express from 'express';
import { getAllFaculty, getFacultyById, updateFaculty, deleteFaculty } from '../controllers/faculty.controller.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all faculty (admin only)
router.get('/', protect, admin, getAllFaculty);

// Get faculty by ID
router.get('/:id', protect, getFacultyById);

// Update faculty member
router.put('/:id', protect, updateFaculty);

// Delete faculty member (admin only)
router.delete('/:id', protect, admin, deleteFaculty);

export default router;