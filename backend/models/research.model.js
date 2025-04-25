import mongoose from "mongoose";

const CoPISchema = new mongoose.Schema({
  name: { type: String },
  affiliation: { type: String }
});

const PublicationSchema = new mongoose.Schema({
  publicationType: { 
    type: String, 
    enum: ['Journal', 'Conference', 'Book', 'Book Chapter', 'Report'],
    required: true 
  },
  title: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Under Review', 'In Preparation', 'Revise and Resubmit'],
    default: 'Under Review' 
  },
  journalName: { type: String, required: true },
  publicationStatus: { 
    type: String, 
    enum: ['In Progress', 'Published', 'Accepted'],
    default: 'In Progress' 
  },
  createdAt: { type: Date, default: Date.now }
});

const GrantSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['Grant', 'NonFundedResearch', 'FundedResearch', 'OtherFunding'],
    required: true 
  },
  client: { type: String },
  title: { type: String },
  contractNumber: { type: String },
  role: { type: String },
  totalAmount: { type: Number },
  yourShare: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  coPIs: [CoPISchema],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ConferenceSchema = new mongoose.Schema({
  name: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ResearchSchema = new mongoose.Schema({
  reportID: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
  publications: [PublicationSchema],
  grants: [GrantSchema],
  conferences: [ConferenceSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ResearchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Research = mongoose.model('Research', ResearchSchema);
export default Research;