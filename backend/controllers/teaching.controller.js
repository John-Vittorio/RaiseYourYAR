// teaching.controller.js
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

    // Changed to search by reportId at the top level, not in courses
    const teaching = await Teaching.findOne({ reportId: reportId });

    if (!teaching) {
      return res.status(404).json({ message: "Teaching data not found" });
    }

    res.json(teaching);
  } catch (error) {
    console.error("Error in getTeaching:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create or update teaching data
export const postTeaching = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { courses, taughtOutsideDept, sectionNotes } = req.body; // Add sectionNotes to destructuring

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Validate course data before saving
    const validatedCourses = courses.map(course => {
      // Set default values for required fields if they're empty
      return {
        name: course.name || "Untitled Course",
        credits: Number(course.credits) || 0,
        enrollment: Number(course.enrollment) || 0,
        studentCreditHours: Number(course.studentCreditHours) || 0,
        evaluationScore: course.evaluationScore || "",
        adjustedEvaluationScore: course.adjustedEvaluationScore || "",
        commEngaged: course.commEngaged || false,
        updatedCourse: course.updatedCourse || false,
        outsideDept: course.outsideDept || false,
        notes: course.notes || "",
        quarter: course.quarter || "Autumn",
        year: Number(course.year) || new Date().getFullYear(),
        reportId: reportId
      };
    });

    // Check if teaching data already exists for this report
    let teachingData = null;
    if (report.teachingSection) {
      teachingData = await Teaching.findById(report.teachingSection);
    }

    if (teachingData) {
      // Update existing teaching data
      teachingData.courses = validatedCourses;
      teachingData.taughtOutsideDept = taughtOutsideDept; // Store this value too
      teachingData.sectionNotes = sectionNotes || ""; // Ensure sectionNotes is stored
      const updatedTeaching = await teachingData.save();

      // Also update the teaching notes in the report
      report.teachingNotes = sectionNotes || "";
      await report.save();

      res.json(updatedTeaching);
    } else {
      // Create new teaching data
      const newTeaching = await Teaching.create({
        facultyId: req.user._id,
        reportId: reportId,
        courses: validatedCourses,
        taughtOutsideDept: taughtOutsideDept, // Store this value too
        sectionNotes: sectionNotes || "" // Store section notes
      });

      // Update the report with the teaching section ID and notes
      report.teachingSection = newTeaching._id;
      report.teachingNotes = sectionNotes || "";
      await report.save();

      res.status(201).json(newTeaching);
    }
  } catch (error) {
    console.error("Error in postTeaching:", error);

    // Better error handling
    if (error.name === 'ValidationError') {
      // Handle mongoose validation errors
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: error.message });
  }
};

// Create or update a single course
export const postCourse = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Validate course data
    const courseData = {
      name: req.body.name || "Untitled Course",
      credits: Number(req.body.credits) || 0,
      enrollment: Number(req.body.enrollment) || 0,
      studentCreditHours: Number(req.body.studentCreditHours) || 0,
      evaluationScore: req.body.evaluationScore || "",
      adjustedEvaluationScore: req.body.adjustedEvaluationScore || "",
      commEngaged: req.body.commEngaged || false,
      updatedCourse: req.body.updatedCourse || false,
      outsideDept: req.body.outsideDept || false,
      notes: req.body.notes || "",
      quarter: req.body.quarter || "Autumn",
      year: Number(req.body.year) || new Date().getFullYear()
    };

    // Find teaching data for the report
    let teachingData = null;
    if (report.teachingSection) {
      teachingData = await Teaching.findById(report.teachingSection);
    }

    if (teachingData) {
      // Check if this course already exists (by ID if provided)
      if (req.body._id) {
        const existingCourseIndex = teachingData.courses.findIndex(
          c => c._id && c._id.toString() === req.body._id
        );

        if (existingCourseIndex !== -1) {
          // Update existing course
          teachingData.courses[existingCourseIndex] = courseData;
        } else {
          // Add new course
          teachingData.courses.push(courseData);
        }
      } else {
        // No ID provided, just add as new course
        teachingData.courses.push(courseData);
      }

      // Make sure we preserve the section notes during single course updates
      // (the sectionNotes field should have already existed on the teachingData)
      const updatedTeaching = await teachingData.save();
      res.json(updatedTeaching);
    } else {
      // Create new teaching entry with the course
      const newTeaching = await Teaching.create({
        facultyId: req.user._id,
        reportId: reportId,
        courses: [courseData],
        sectionNotes: "" // Initialize with empty section notes
      });

      // Update the report with the teaching section ID
      report.teachingSection = newTeaching._id;
      await report.save();

      res.status(201).json(newTeaching);
    }
  } catch (error) {
    console.error("Error in postCourse:", error);

    if (error.name === 'ValidationError') {
      // Handle mongoose validation errors
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: error.message });
  }
};