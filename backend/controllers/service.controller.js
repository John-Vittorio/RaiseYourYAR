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
    const { 
      type, 
      role, 
      department, 
      description, 
      notes,
      // Thesis/dissertation committee specific fields
      committeeName,
      degreeType,
      students
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Create service object with all possible fields
    const serviceData = {
      facultyId: req.user._id,
      reportId: reportId,
      type,
      role,
      department,
      description,
      notes
    };

    // Add thesis/dissertation committee specific fields if applicable
    if (type === 'Thesis / Dissertation Committee') {
      serviceData.committeeName = committeeName;
      serviceData.degreeType = degreeType;
      serviceData.students = students || [];
    }

    const newService = await Service.create(serviceData);

    // If this is the first service entry, initialize the serviceSection array
    if (!report.serviceSection) {
      report.serviceSection = [newService._id];
    } else {
      // Add this service to the serviceSection array
      report.serviceSection.push(newService._id);
    }
    await report.save();

    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a service entry
export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { 
      type, 
      role, 
      department, 
      description, 
      notes,
      // Thesis/dissertation committee specific fields
      committeeName,
      degreeType,
      students
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Update common fields
    service.type = type || service.type;
    service.role = role || service.role;
    service.department = department || service.department;
    service.description = description !== undefined ? description : service.description;
    service.notes = notes !== undefined ? notes : service.notes;

    // Update thesis/dissertation committee specific fields if applicable
    if (type === 'Thesis / Dissertation Committee') {
      service.committeeName = committeeName !== undefined ? committeeName : service.committeeName;
      service.degreeType = degreeType !== undefined ? degreeType : service.degreeType;
      
      // Only update students array if it's provided in the request
      if (students !== undefined) {
        service.students = students;
      }
    }

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

    // Find the report and remove this service from its serviceSection array
    const report = await Report.findById(service.reportId);
    if (report && report.serviceSection) {
      report.serviceSection = report.serviceSection.filter(
        id => id.toString() !== serviceId
      );
      await report.save();
    }

    // Delete the service
    await Service.findByIdAndDelete(serviceId);
    res.json({ message: "Service removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};