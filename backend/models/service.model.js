import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the Student schema
const StudentSchema = new Schema({
  name: { 
    type: String 
  },
  role: { 
    type: String 
  }
});

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
      'Admissions Committee',
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
  notes: { 
    type: String 
  },
  // Fields for thesis committees
  committeeName: {
    type: String
  },
  degreeType: {
    type: String,
    enum: ['Undergraduate', 'Graduate', 'Ph.D.', '']
  },
  students: [StudentSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the 'updatedAt' field on save
ServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Service = mongoose.model('Service', ServiceSchema);
export default Service;