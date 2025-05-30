import Faculty from "../models/faculty.model.js";
import Report from "../models/Report.model.js";
import Teaching from "../models/teaching.model.js";
import Research from "../models/research.model.js";
import Service from "../models/service.model.js";
import mongoose from 'mongoose';

// Get all faculty members with their report summaries
export const getAllFacultyWithReports = async (req, res) => {
  try {
    // Get all faculty members except the current admin
    const faculty = await Faculty.find({ 
      role: 'faculty' 
    }).select("-password");

    // For each faculty member, get their reports summary
    const facultyWithReports = await Promise.all(
      faculty.map(async (facultyMember) => {
        try {
          // Get all reports for this faculty member, sorted by most recent first
          const reports = await Report.find({ 
            facultyId: facultyMember._id 
          })
          .sort({ updatedAt: -1 })
          .select('academicYear status submittedDate approvedDate updatedAt createdAt');

          return {
            ...facultyMember.toObject(),
            reports,
            reportCount: reports.length,
            latestReport: reports[0] || null
          };
        } catch (error) {
          console.error(`Error fetching reports for faculty ${facultyMember._id}:`, error);
          return {
            ...facultyMember.toObject(),
            reports: [],
            reportCount: 0,
            latestReport: null
          };
        }
      })
    );

    res.json(facultyWithReports);
  } catch (error) {
    console.error('Error in getAllFacultyWithReports:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all reports for a specific faculty member
export const getFacultyReports = async (req, res) => {
  try {
    const { facultyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(facultyId)) {
      return res.status(400).json({ message: "Invalid faculty ID" });
    }

    // Verify faculty member exists
    const faculty = await Faculty.findById(facultyId).select("-password");
    if (!faculty) {
      return res.status(404).json({ message: "Faculty member not found" });
    }

    // Get all reports for this faculty member
    const reports = await Report.find({ facultyId })
      .sort({ updatedAt: -1 })
      .populate('teachingSection')
      .populate('researchSection')
      .populate('serviceSection');

    res.json({
      faculty,
      reports
    });
  } catch (error) {
    console.error('Error in getFacultyReports:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a specific report for a faculty member with full details
export const getFacultyReport = async (req, res) => {
  try {
    const { facultyId, reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(facultyId) || !mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid faculty ID or report ID" });
    }

    // Verify faculty member exists
    const faculty = await Faculty.findById(facultyId).select("-password");
    if (!faculty) {
      return res.status(404).json({ message: "Faculty member not found" });
    }

    // Get the specific report with all populated sections
    const report = await Report.findOne({ 
      _id: reportId, 
      facultyId: facultyId 
    })
    .populate('teachingSection')
    .populate('researchSection')
    .populate('serviceSection');

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Get detailed data for each section
    let teachingData = null;
    let researchData = null;
    let serviceData = [];

    try {
      if (report.teachingSection) {
        teachingData = await Teaching.findById(report.teachingSection._id);
      }
    } catch (error) {
      console.log('No teaching data found');
    }

    try {
      if (report.researchSection) {
        researchData = await Research.findById(report.researchSection._id);
      }
    } catch (error) {
      console.log('No research data found');
    }

    try {
      if (report.serviceSection && report.serviceSection.length > 0) {
        const serviceIds = report.serviceSection.map(service => 
          typeof service === 'object' ? service._id : service
        );
        serviceData = await Service.find({ _id: { $in: serviceIds } });
      }
    } catch (error) {
      console.log('No service data found');
    }

    res.json({
      faculty,
      report,
      teachingData,
      researchData,
      serviceData
    });
  } catch (error) {
    console.error('Error in getFacultyReport:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update report status (for admin approval/review)
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, comments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const validStatuses = ['draft', 'submitted', 'reviewed', 'approved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update status and set appropriate date
    report.status = status;
    
    if (status === 'approved') {
      report.approvedDate = new Date();
    } else if (status === 'reviewed') {
      report.reviewedDate = new Date();
    }

    // Add admin comments if provided
    if (comments) {
      if (!report.adminComments) {
        report.adminComments = [];
      }
      report.adminComments.push({
        comment: comments,
        adminId: req.user._id,
        adminName: req.user.name,
        date: new Date(),
        status: status
      });
    }

    const updatedReport = await report.save();

    res.json({
      message: `Report status updated to ${status}`,
      report: updatedReport
    });
  } catch (error) {
    console.error('Error in updateReportStatus:', error);
    res.status(500).json({ message: error.message });
  }
};