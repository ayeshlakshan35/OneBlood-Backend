const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const HospitalSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  validDocuments: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: { type: String, required: true },
}, { timestamps: true });

// 🔐 Automatically hash password before saving
HospitalSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔐 Method to compare entered password with hashed password
HospitalSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Hospital',HospitalSchema);
