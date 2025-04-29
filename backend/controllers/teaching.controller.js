import Teaching from "../models/teaching.model.js";
import Report from "../models/Report.model.js";
import mongoose from "mongoose";

// Get teaching data for a specific report
export const getTeaching = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const teaching = await Teaching.findOne({ "courses.reportId": reportId });

    if (!teaching) {
      return res.status(404).json({ message: "Teaching data not found" });
    }

    res.json(teaching);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update teaching data
export const postTeaching = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { courses, taughtOutsideDept } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Format courses with the reportID
    const formattedCourses = courses.map(course => ({
      ...course,
      reportId: reportId  // Changed from reportID to reportId
    }));

    // Check if teaching data already exists for this report
    let teachingData = null;
    if (report.teachingSection) {
      teachingData = await Teaching.findById(report.teachingSection);
    }

    if (teachingData) {
      // Update existing teaching data
      teachingData.courses = formattedCourses;
      const updatedTeaching = await teachingData.save();
      res.json(updatedTeaching);
    } else {
      // Create new teaching data
      const newTeaching = await Teaching.create({
        facultyId: req.user._id,  // Add faculty ID
        reportId: reportId,       // Changed from reportID to reportId
        courses: formattedCourses
      });

      // Update the report with the teaching section ID
      report.teachingSection = newTeaching._id;
      await report.save();

      res.status(201).json(newTeaching);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};