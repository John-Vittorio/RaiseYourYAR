import Report from "../models/Report.model.js";
import Teaching from "../models/teaching.model.js";
import Research from "../models/research.model.js";
import Service from "../models/service.model.js";
import Faculty from "../models/faculty.model.js";
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';

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
    const { academicYear, notes, status, serviceNotes, teachingNotes } = req.body;
    
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
    if (academicYear) report.academicYear = academicYear;
    if (notes !== undefined) report.notes = notes;
    if (serviceNotes !== undefined) report.serviceNotes = serviceNotes;
    if (teachingNotes !== undefined) report.teachingNotes = teachingNotes;
    
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

// Modified deleteReport function in backend/controllers/report.controller.js

export const deleteReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const session = await mongoose.startSession();
  
  try {
    // Start a MongoDB transaction
    session.startTransaction();

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    // Find the report with all populated sections to get their IDs
    const report = await Report.findById(reportId)
      .populate('teachingSection')
      .populate('researchSection')
      .populate('serviceSection')
      .session(session);

    if (!report) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Report not found" });
    }

    const isOwner = report.facultyId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    // Modified to allow faculty to delete their own drafts and submitted reports
    // Admins can delete any report
    if (!isOwner && !isAdmin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "You can only delete your own reports" });
    }

    // Only allow faculty to delete drafts and submitted reports
    // Admins can delete any report
    if (!isAdmin && report.status === 'approved') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Approved reports cannot be deleted by faculty" });
    }

    // Delete teaching section if exists
    if (report.teachingSection) {
      await Teaching.findByIdAndDelete(report.teachingSection._id).session(session);
    }

    // Delete research section if exists
    if (report.researchSection) {
      await Research.findByIdAndDelete(report.researchSection._id).session(session);
    }

    // Delete all service sections if they exist
    if (report.serviceSection && report.serviceSection.length > 0) {
      const serviceIds = report.serviceSection.map(service => 
        typeof service === 'object' ? service._id : service
      );
      await Service.deleteMany({ _id: { $in: serviceIds } }).session(session);
    }

    // Finally delete the report itself
    await Report.findByIdAndDelete(reportId).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ 
      message: "Report and all associated sections deleted successfully",
      deletedReport: reportId
    });
    
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error during report deletion:', error);
    res.status(500).json({ 
      message: "Failed to delete report and associated sections", 
      error: error.message 
    });
  }
});
