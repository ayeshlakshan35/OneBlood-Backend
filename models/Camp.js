const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  title: String,
  hospital: String,
  date: Date,
  time: String,
  location: String,
  description: String,
  contact: String,
  documentPath: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
  }
}, { timestamps: true });

module.exports = mongoose.model('Camp', campSchema);
