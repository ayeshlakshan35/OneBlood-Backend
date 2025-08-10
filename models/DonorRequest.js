const mongoose = require('mongoose');

const DonorRequestSchema = new mongoose.Schema({
  donor: {
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
      type: String,
      required: true,
    },
    contactInfo: {
      name: String,
      phone: String,
      email: String,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  hospitalResponse: {
    accepted: {
      type: Boolean,
      default: false,
    },
    scheduledDate: {
      type: Date,
    },
    scheduledTime: {
      type: String,
    },
    message: {
      type: String,
    },
    respondedAt: {
      type: Date,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
DonorRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DonorRequest', DonorRequestSchema);
