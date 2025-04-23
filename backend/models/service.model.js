import mongoose from "mongoose";

// Service Item Schema (Sub-document)
const serviceItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "Department Committee",
      "College Committee",
      "University Committee",
      "Professional Service",
      "Community Service",
      "Admissions Committee",
      "Other"
    ],
    required: true,
  },
  role: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    default: "Department of Urban Design and Planning",
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  impact: {
    type: String,
    enum: ["Departmental", "College", "University", "Professional", "Community"],
  },
});

// Service Schema (Main document)
const serviceSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    services: [serviceItemSchema],
    administrativeRoles: {
      type: String,
      trim: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for calculating total number of service items
serviceSchema.virtual('serviceCount').get(function() {
  return this.services.length;
});

// Virtual for calculating service items by type
serviceSchema.virtual('servicesByType').get(function() {
  const counts = {
    "Department Committee": 0,
    "College Committee": 0,
    "University Committee": 0,
    "Professional Service": 0,
    "Community Service": 0,
    "Admissions Committee": 0,
    "Other": 0
  };
  
  this.services.forEach(service => {
    if (counts[service.type] !== undefined) {
      counts[service.type]++;
    }
  });
  
  return counts;
});

// Set virtuals to be included when converting to JSON
serviceSchema.set("toJSON", { virtuals: true });
serviceSchema.set("toObject", { virtuals: true });

const Service = mongoose.model("Service", serviceSchema);

export default Service;