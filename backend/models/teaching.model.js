import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Course name is required"],
    trim: true,
    default: "Untitled Course" // Provide a default value
  },
  credits: {
    type: Number,
    required: [true, "Credits are required"],
    min: 0,
    default: 0 // Provide a default value
  },
  enrollment: {
    type: Number,
    required: [true, "Enrollment count is required"],
    min: 0,
    default: 0 // Provide a default value
  },
  studentCreditHours: {
    type: Number,
    default: function () {
      return this.credits * this.enrollment;
    }
  },
  evaluationScore: {
    type: String,
    trim: true,
    default: "" // Provide a default value
  },
  adjustedEvaluationScore: {
    type: String,
    trim: true,
    default: ""
  },
  commEngaged: {
    type: Boolean,
    default: false
  },
  updatedCourse: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    default: ""
  },
  quarter: {
    type: String,
    enum: ["Autumn", "Winter", "Spring", "Summer"],
    required: true,
    default: "Autumn" // Provide a default value
  },
  year: {
    type: Number,
    required: true,
    default: new Date().getFullYear() // Current year as default
  },
  // Add reportId field to course schema to match frontend data structure
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report"
  }
});

const teachingSchema = new mongoose.Schema({
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
  courses: {
    type: [courseSchema],
    default: []
  },
  // Add taughtOutsideDept field to match frontend data
  taughtOutsideDept: {
    type: Boolean,
    default: false
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
teachingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Teaching = mongoose.model("Teaching", teachingSchema);
export default Teaching;