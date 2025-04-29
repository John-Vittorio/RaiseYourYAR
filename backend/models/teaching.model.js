import mongoose from "mongoose";

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
        default: function () {
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