import mongoose from "mongoose";
import { User, Report, Teaching, Research, Service } from "../models/index.js";

// Get all reports for a user
export const getUserReports = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find all reports for the user
    const reports = await Report.find({ user: userId })
      .populate("teachingSection")
      .populate("researchSection")
      .populate("serviceSection");

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error getting user reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { userId, academicYear } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a report for this academic year already exists
    const existingReport = await Report.findOne({ 
      user: userId, 
      academicYear: academicYear 
    });

    if (existingReport) {
      return res.status(400).json({ 
        message: "A report for this academic year already exists",
        reportId: existingReport._id 
      });
    }

    // Create new report
    const newReport = new Report({
      user: userId,
      academicYear: academicYear,
      status: "draft"
    });

    await newReport.save();

    res.status(201).json({
      message: "Report created successfully",
      report: newReport
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Submit teaching data
export const submitTeachingData = async (req, res) => {
  try {
    const { reportId } = req.params;
    const teachingData = req.body;

    // Validate report ID
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    // Check if report exists
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Create or update teaching section
    let teachingSection;
    
    if (report.teachingSection) {
      // Update existing teaching data
      teachingSection = await Teaching.findByIdAndUpdate(
        report.teachingSection,
        { 
          ...teachingData,
          report: reportId 
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new teaching data
      teachingSection = new Teaching({
        ...teachingData,
        report: reportId
      });
      
      await teachingSection.save();
      
      // Update report with teaching section reference
      report.teachingSection = teachingSection._id;
      await report.save();
    }

    res.status(200).json({
      message: "Teaching data submitted successfully",
      teachingSection
    });
  } catch (error) {
    console.error("Error submitting teaching data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Submit research data
export const submitResearchData = async (req, res) => {
  try {
    const { reportId } = req.params;
    const researchData = req.body;

    // Validate report ID
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    // Check if report exists
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Create or update research section
    let researchSection;
    
    if (report.researchSection) {
      // Update existing research data
      researchSection = await Research.findByIdAndUpdate(
        report.researchSection,
        { 
          ...researchData,
          report: reportId 
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new research data
      researchSection = new Research({
        ...researchData,
        report: reportId
      });
      
      await researchSection.save();
      
      // Update report with research section reference
      report.researchSection = researchSection._id;
      await report.save();
    }

    res.status(200).json({
      message: "Research data submitted successfully",
      researchSection
    });
  } catch (error) {
    console.error("Error submitting research data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Submit service data
export const submitServiceData = async (req, res) => {
  try {
    const { reportId } = req.params;
    const serviceData = req.body;

    // Validate report ID
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    // Check if report exists
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Create or update service section
    let serviceSection;
    
    if (report.serviceSection) {
      // Update existing service data
      serviceSection = await Service.findByIdAndUpdate(
        report.serviceSection,
        { 
          ...serviceData,
          report: reportId 
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new service data
      serviceSection = new Service({
        ...serviceData,
        report: reportId
      });
      
      await serviceSection.save();
      
      // Update report with service section reference
      report.serviceSection = serviceSection._id;
      await report.save();
    }

    res.status(200).json({
      message: "Service data submitted successfully",
      serviceSection
    });
  } catch (error) {
    console.error("Error submitting service data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Submit the complete report
export const submitReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Validate report ID
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    // Find the report
    const report = await Report.findById(reportId)
      .populate("teachingSection")
      .populate("researchSection")
      .populate("serviceSection");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if all sections are completed
    if (!report.teachingSection || !report.researchSection || !report.serviceSection) {
      return res.status(400).json({ 
        message: "Cannot submit incomplete report. All sections must be completed.",
        completionStatus: {
          teaching: !!report.teachingSection,
          research: !!report.researchSection,
          service: !!report.serviceSection
        }
      });
    }

    // Update report status
    const submitted = report.submit();
    if (!submitted) {
      return res.status(400).json({ message: "Failed to submit report" });
    }

    await report.save();

    res.status(200).json({
      message: "Report submitted successfully",
      report
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single report with all sections
export const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Validate report ID
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    // Find the report with all sections populated
    const report = await Report.findById(reportId)
      .populate("user")
      .populate("teachingSection")
      .populate("researchSection")
      .populate("serviceSection");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error getting report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};