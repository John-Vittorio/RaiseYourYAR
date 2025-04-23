import mongoose from "mongoose";
import { User } from "../models/index.js";

// Create a new user
export const createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if user with the same netId already exists
    const existingUser = await User.findOne({ netId: userData.netId });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User with this Net ID already exists", 
        userId: existingUser._id 
      });
    }
    
    // Create new user
    const newUser = new User(userData);
    await newUser.save();
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user by Net ID
export const getUserByNetId = async (req, res) => {
  try {
    const { netId } = req.params;
    
    // Find user
    const user = await User.findOne({ netId });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user by Net ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};