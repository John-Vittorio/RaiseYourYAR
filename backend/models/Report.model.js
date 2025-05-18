// Fix for Report.model.js - Remove any pre-delete hooks that restrict deletion

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  teachingSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teaching'
  },
  researchSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Research'
  },
  serviceSection: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  notes: {
    type: String
  },
  serviceNotes: {
    type: String
  },
  teachingNotes: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'reviewed'],
    default: 'draft'
  },
  submittedDate: {
    type: Date
  },
  approvedDate: {
    type: Date
  },
  reviewedDate: {
    type: Date
  }
}, { timestamps: true });

// Remove any pre-delete hooks that might be checking report status
// If your model has something like this, it needs to be modified:
/*
reportSchema.pre('deleteOne', async function(next) {
  const report = await this.model.findOne(this.getQuery());
  if (report.status !== 'draft') {
    throw new Error('Only drafts can be deleted');
  }
  next();
});
*/

// Add a method to check if report is complete (if needed)
reportSchema.methods.isComplete = function() {
  return this.teachingSection && this.researchSection && this.serviceSection.length > 0;
};

const Report = mongoose.model('Report', reportSchema);

export default Report;