// models/HospitalBlood.js

const mongoose = require("mongoose");

const hospitalBloodSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    bloodType: {
      type: String,
      required: true,
    },
    units: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // ✅ This automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("HospitalBloodUnit", hospitalBloodSchema);
