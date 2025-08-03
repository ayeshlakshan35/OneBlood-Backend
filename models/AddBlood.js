const mongoose = require("mongoose");

const bloodSchema = new mongoose.Schema({

  bloodData: [
    {
      bloodType: {
        type: String,
        required: true,
      },
      units: {
        type: Number,
        required: true,
      },
    },
  ],
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Blood", bloodSchema);
