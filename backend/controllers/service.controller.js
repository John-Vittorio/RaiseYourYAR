import Service from "../models/service.model.js";
import Report from "../models/Report.model.js";
import mongoose from "mongoose";

// Get service data for a specific report
export const getService = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    // Find the report first
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // If report has serviceSection, find all services by their IDs
    if (report.serviceSection && report.serviceSection.length > 0) {
      const services = await Service.find({
        _id: { $in: report.serviceSection }
      });

      res.json(services);
    } else {
      res.json([]);  // Return empty array if no services found
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new service entry
export const createService = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { type, role, department, description, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const newService = await Service.create({
      facultyId: req.user._id,  // Add faculty ID
      reportId: reportId,       // Changed from reportID to reportId
      type,
      role,
      department,
      description,
      notes
    });

    // If this is the first service entry, update the report
    if (!report.serviceSection) {
      report.serviceSection = [newService._id];  // Changed to array since serviceSection is an array
      await report.save();
    } else {
      // Add this service to the serviceSection array
      report.serviceSection.push(newService._id);
      await report.save();
    }

    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a service entry
export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { type, role, department, description, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.type = type || service.type;
    service.role = role || service.role;
    service.department = department || service.department;
    service.description = description || service.description;
    service.notes = notes || service.notes;

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a service entry
export const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Use findByIdAndDelete instead of remove()
    await Service.findByIdAndDelete(serviceId);
    res.json({ message: "Service removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};