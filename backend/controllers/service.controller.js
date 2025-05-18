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

    // Validate required fields based on service type
    if (type === 'Thesis / Dissertation Committee') {
      if (!committeeName) {
        return res.status(400).json({ message: "Committee name is required for thesis/dissertation committees" });
      }
      if (!degreeType) {
        return res.status(400).json({ message: "Degree type is required for thesis/dissertation committees" });
      }
    }

    // Create service object with common fields
    const serviceData = {
      facultyId: req.user._id,
      reportId: reportId,
      type,
      role,
      description,
      notes
    };
    
    // Add department only if it's a regular service (not thesis committee)
    if (type !== 'Thesis / Dissertation Committee' && department) {
      serviceData.department = department;
    }

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

    // Check if we're changing to or updating a thesis committee type
    if (type === 'Thesis / Dissertation Committee' || service.type === 'Thesis / Dissertation Committee') {
      if (type === 'Thesis / Dissertation Committee' && (!committeeName || !degreeType)) {
        return res.status(400).json({ 
          message: "Committee name and degree type are required for thesis/dissertation committees" 
        });
      }
    }

    // Update common fields
    service.type = type || service.type;
    service.role = role || service.role;
    service.description = description !== undefined ? description : service.description;
    service.notes = notes !== undefined ? notes : service.notes;
    
    // Handle department field based on service type
    if (type !== 'Thesis / Dissertation Committee') {
      service.department = department !== undefined ? department : service.department;
    } else {
      // For thesis committees, we don't want the department field
      service.department = undefined;
    }

    // Update thesis/dissertation committee specific fields if applicable
    if (type === 'Thesis / Dissertation Committee') {
      service.committeeName = committeeName !== undefined ? committeeName : service.committeeName;
      service.degreeType = degreeType !== undefined ? degreeType : service.degreeType;
      
      // Only update students array if it's provided in the request
      if (students !== undefined) {
        service.students = students;
      }
    } else {
      // Clear thesis committee fields if this is no longer a thesis committee
      service.committeeName = undefined;
      service.degreeType = undefined;
      service.students = [];
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