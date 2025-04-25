import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    associatedFaculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    academicYear: {
        type: String,
        required: true,
        default: () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            // If it's after September, then the academic year is current year to next year
            if (month >= 8) {
                return `${year} -${year + 1}`;
            }
            // If it's before September, then the academic year is previous year to current year
            return `${year - 1} -${year}`;
        },
    },
    status: {
        type: String,
        enum: ["draft", "submitted", "reviewed", "approved"],
        default: "draft",
    },
    submittedDate: {
        type: Date,
    },
    approvedDate: {
        type: Date,
    },
    teachingSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teaching",
    },
    researchSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Research",
    },
    serviceSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
    },
    notes: {
        type: String,
    }
});

reportSchema.methods.isComplete = function () {
    return (
      this.teachingSection !== undefined &&
      this.researchSection !== undefined &&
      this.serviceSection !== undefined
    );
  };
  
  reportSchema.methods.submit = function () {
    if (this.isComplete()) {
      this.status = "submitted";
      this.submittedDate = new Date();
      return true;
    }
    return false;
  };
  
  const Report = mongoose.model("Report", reportSchema);
  
  export default Report;