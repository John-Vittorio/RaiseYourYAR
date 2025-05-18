import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Service Schema
const ServiceSchema = new Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true
  },
  reportId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Report", 
    required: true 
  },
  type: { 
    type: String, 
    enum: [
      'Department Committee', 
      'College Committee', 
      'University Committee', 
      'Professional Service', 
      'Community Service',
      'Thesis / Dissertation Committee',
      'Other'
    ],
    required: true 
  },
  role: { 
    type: String 
  },
  department: { 
    type: String 
  },
  description: { 
    type: String 
  },
  // Thesis/dissertation committee specific fields
  committeeName: {
    type: String,
    // Make it required only when type is 'Thesis / Dissertation Committee'
    validate: {
      validator: function(v) {
        return this.type !== 'Thesis / Dissertation Committee' || (v && v.trim().length > 0);
      },
      message: 'Committee name is required for thesis/dissertation committees'
    }
  },
  degreeType: {
    type: String,
    enum: ['Undergraduate', 'Graduate', 'Ph.D.', ''],
    // Make it required only when type is 'Thesis / Dissertation Committee'
    validate: {
      validator: function(v) {
        return this.type !== 'Thesis / Dissertation Committee' || (v && v.trim().length > 0);
      },
      message: 'Degree type is required for thesis/dissertation committees'
    }
  },
  students: {
    type: [String],
    default: []
  },
  notes: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});