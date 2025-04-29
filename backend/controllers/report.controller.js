import Report from "../models/Report.model.js";
import Faculty from "../models/faculty.model.js";
import mongoose from "mongoose";

// Get all reports for a faculty member
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ facultyId: req.user._id })
      .populate('teachingSection')
      .populate('researchSection')
      .populate('serviceSection');
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific report by ID
export const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }
    
    const report = await Report.findById(reportId)
      .populate('teachingSection')
      .populate('researchSection')
      .populate('serviceSection');
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    // Check if user is authorized to view this report
    if (report.facultyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to view this report" });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { academicYear, notes } = req.body;
    
    // Create a new report
    const newReport = await Report.create({
      facultyId: req.user._id,
      academicYear,
      notes,
      status: "draft"
    });
    
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a report
export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { academicYear, notes, status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }
    
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    // Check if user is authorized to update this report
    if (report.facultyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to update this report" });
    }
    
    // Update report fields
    report.academicYear = academicYear || report.academicYear;
    report.notes = notes || report.notes;
    
    // Only allow status update if all sections are complete
    if (status === "submitted" && report.isComplete()) {
      report.status = "submitted";
      report.submittedDate = new Date();
    } else if (status === "approved" && req.user.role === "admin") {
      report.status = "approved";
      report.approvedDate = new Date();
    }
    
    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a report
export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }
    
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    // Only admins can delete reports
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete reports" });
    }
    
    await report.remove();
    res.json({ message: "Report removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};