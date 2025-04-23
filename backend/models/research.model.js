import mongoose from "mongoose";

// Co-PI Schema (Sub-document)
const coPISchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  affiliation: {
    type: String,
    trim: true,
  },
});

// Publication Schema (Sub-document)
const publicationSchema = new mongoose.Schema({
  publicationType: {
    type: String,
    enum: ["Journal", "Conference", "Book", "Book Chapter", "Report", "Other"],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Under Review", "In Preparation", "Revise and Resubmit", "Published", "Accepted"],
    required: true,
  },
  journalName: {
    type: String,
    trim: true,
  },
  publicationStatus: {
    type: String,
    enum: ["In Progress", "Published", "Accepted"],
    required: true,
  },
  authors: [String],
  year: Number,
  doi: String,
  url: String,
  citation: String,
  notes: String,
});

// Grant Schema (Sub-document)
const grantSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Research Grant", "Contract", "Non-Funded Research", "Funded Research", "Other Funding", "Conference"],
    required: true,
  },
  client: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  contractNumber: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    trim: true,
  },
  totalAmount: {
    type: Number,
    min: 0,
  },
  yourShare: {
    type: Number,
    min: 0,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  coPIs: [coPISchema],
  notes: {
    type: String,
    trim: true,
  },
});

// Conference Schema (Sub-document)
const conferenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  location: String,
  role: String,
  presentationTitle: String,
  notes: String,
});

// Research Schema (Main document)
const researchSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    publications: [publicationSchema],
    grants: [grantSchema],
    nonFundedResearch: [grantSchema],
    fundedResearch: [grantSchema],
    otherFunding: [grantSchema],
    conferences: [conferenceSchema],
    additionalNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for calculating total number of publications
researchSchema.virtual('publicationCount').get(function() {
  return this.publications.length;
});

// Virtual for calculating total grant amount
researchSchema.virtual('totalGrantAmount').get(function() {
  return this.grants.reduce((total, grant) => {
    return total + (grant.totalAmount || 0);
  }, 0);
});

// Virtual for calculating your total grant share
researchSchema.virtual('totalGrantShare').get(function() {
  return this.grants.reduce((total, grant) => {
    return total + (grant.yourShare || 0);
  }, 0);
});

// Set virtuals to be included when converting to JSON
researchSchema.set("toJSON", { virtuals: true });
researchSchema.set("toObject", { virtuals: true });

const Research = mongoose.model("Research", researchSchema);

export default Research;