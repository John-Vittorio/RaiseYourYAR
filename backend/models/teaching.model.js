import mongoose from "mongoose";

// Course Schema (Sub-document)
const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Course name is required"],
    trim: true,
  },
  credits: {
    type: Number,
    required: [true, "Credits are required"],
    min: 0,
  },
  enrollment: {
    type: Number,
    required: [true, "Enrollment count is required"],
    min: 0,
  },
  studentCreditHours: {
    type: Number,
    default: function() {
      return this.credits * this.enrollment;
    },
  },
  evaluationScore: {
    type: String,
    trim: true,
  },
  commEngaged: {
    type: Boolean,
    default: false,
  },
  updatedCourse: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    trim: true,
    default: "N/A",
  },
  quarter: {
    type: String,
    enum: ["Autumn", "Winter", "Spring", "Summer"],
    required: true
  },
  year: {
    type: Number,
    required: true
  }
});

// Teaching Schema (Main document)
const teachingSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    courses: [courseSchema],
    taughtOutsideDept: {
      type: Boolean,
      default: false,
    },
    outsideDeptCourses: {
      type: String,
      trim: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
    totalStudentCreditHours: {
      type: Number,
      default: function() {
        return this.courses.reduce((total, course) => total + (course.studentCreditHours || 0), 0);
      }
    }
  },
  {
    timestamps: true,
  }
);

// Virtual for calculating total number of courses
teachingSchema.virtual('courseCount').get(function() {
  return this.courses.length;
});

// Virtual for calculating average evaluation score
teachingSchema.virtual('averageEvalScore').get(function() {
  if (this.courses.length === 0) return 0;
  
  let totalScore = 0;
  let coursesWithScores = 0;
  
  this.courses.forEach(course => {
    // Extract numeric score from format like "3.4 (67%)"
    if (course.evaluationScore) {
      const numericScore = parseFloat(course.evaluationScore.split(' ')[0]);
      if (!isNaN(numericScore)) {
        totalScore += numericScore;
        coursesWithScores++;
      }
    }
  });
  
  return coursesWithScores > 0 ? (totalScore / coursesWithScores).toFixed(2) : 0;
});

// Set virtuals to be included when converting to JSON
teachingSchema.set("toJSON", { virtuals: true });
teachingSchema.set("toObject", { virtuals: true });

const Teaching = mongoose.model("Teaching", teachingSchema);

export default Teaching;