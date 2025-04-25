import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Service Schema
const ServiceSchema = new Schema({
  reportID: { 
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
      'Admissions Committee', // Adding this since it was in your initial data
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