import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    netId: {
      type: String,
      required: [true, "Net ID is required"],
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: function() {
        return `${this.netId}@uw.edu`;
      }
    },
    department: {
      type: String,
      default: "Department of Urban Design and Planning",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["faculty", "admin", "department_head"],
      default: "faculty",
    },
  },
  {
    timestamps: true,
  }
);

// Create a virtual property for the YAR reports relationship
userSchema.virtual("reports", {
  ref: "Report",
  localField: "_id",
  foreignField: "user",
});

// Set virtuals to be included when converting to JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);

export default User;