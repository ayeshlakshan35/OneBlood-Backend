const mongoose = require('mongoose');

const DonorEligibilitySchema = new mongoose.Schema({
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  ageCriteria: {
    type: Boolean,
    required: true,
  },
  donationGap: {
    type: Boolean,
    required: true,
  },
  hemoglobin: {
    type: Boolean,
    required: true,
  },
  healthCondition: {
    type: Boolean,
    required: true,
  },
  identityProof: {
    type: String, // store file path or URL
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DonorEligibility', DonorEligibilitySchema);
