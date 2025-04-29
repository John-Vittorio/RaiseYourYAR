import Research from "../models/research.model.js";
import Report from "../models/Report.model.js";
import mongoose from "mongoose";

// Get research data for a specific report
export const getResearch = async (req, res) => {
    try {
        const { reportId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({ message: "Invalid report ID" });
        }

        // First get the report to find the research section ID
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        // If there's no research section yet, return 404
        if (!report.researchSection) {
            return res.status(404).json({ message: "Research data not found" });
        }

        // Get the research data using the ID stored in the report
        const research = await Research.findById(report.researchSection);

        if (!research) {
            return res.status(404).json({ message: "Research data not found" });
        }

        res.json(research);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create or update research data
export const postResearch = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { publications, grants, conferences } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({ message: "Invalid report ID" });
        }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        // Check if research data already exists for this report
        let researchData = null;
        if (report.researchSection) {
            researchData = await Research.findById(report.researchSection);
        }

        if (researchData) {
            // Update existing research data
            researchData.publications = publications || researchData.publications;
            researchData.grants = grants || researchData.grants;
            researchData.conferences = conferences || researchData.conferences;

            const updatedResearch = await researchData.save();
            res.json(updatedResearch);
        } else {
            // Create new research data
            const newResearch = await Research.create({
                facultyId: req.user._id,  // Add faculty ID
                reportId: reportId,       // Changed from reportID to reportId
                publications: publications || [],
                grants: grants || [],
                conferences: conferences || []
            });

            // Update the report with the research section ID
            report.researchSection = newResearch._id;
            await report.save();

            res.status(201).json(newResearch);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};