import Faculty from "../models/faculty.model.js";
import mongoose from 'mongoose';

// Get all faculty members (admin only)
export const getAllFaculty = async (req, res) => {
  try {
    // Only allow admins to get all faculty
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized as an admin" });
    }
    
    const faculty = await Faculty.find({}).select("-password");
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get faculty member by ID
export const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid faculty ID" });
    }
    
    const faculty = await Faculty.findById(id).select("-password");
    
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    
    // Only allow admins or the faculty member themselves to view their profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update faculty member
export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { netID, name, email, role } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid faculty ID" });
    }
    
    const faculty = await Faculty.findById(id);
    
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    
    // Only allow admins or the faculty member themselves to update their profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // Only admins can change roles
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to change roles" });
    }
    
    faculty.netID = netID || faculty.netID;
    faculty.name = name || faculty.name;
    faculty.email = email || faculty.email;
    
    // Only update role if it's provided and user is admin
    if (role && req.user.role === 'admin') {
      faculty.role = role;
    }
    
    const updatedFaculty = await faculty.save();
    
    res.json({
      _id: updatedFaculty._id,
      netID: updatedFaculty.netID,
      name: updatedFaculty.name,
      email: updatedFaculty.email,
      role: updatedFaculty.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete faculty member (admin only)
export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow admins to delete faculty
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized as an admin" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid faculty ID" });
    }
    
    const faculty = await Faculty.findById(id);
    
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    
    await faculty.remove();
    res.json({ message: "Faculty removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
