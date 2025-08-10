const mongoose = require('mongoose');

const DonorEligibilitySchema = new mongoose.Schema({
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  },
  district: {
    type: String,
    required: true,
    enum: [
      'Ampara',
      'Anuradhapura',
      'Badulla',
      'Batticaloa',
      'Colombo',
      'Galle',
      'Gampaha',
      'Hambantota',
      'Jaffna',
      'Kalutara',
      'Kandy',
      'Kegalle',
      'Kilinochchi',
      'Kurunegala',
      'Mannar',
      'Matale',
      'Matara',
      'Monaragala',
      'Mullaitivu',
      'Nuwara Eliya',
      'Polonnaruwa',
      'Puttalam',
      'Ratnapura',
      'Trincomalee',
      'Vavuniya',
    ],
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
