const Camp = require('../models/Camp');

exports.addCamp = async (req, res) => {
  try {
    const { title, hospital, date, time, location, description, contact } = req.body;

    const newCamp = new Camp({
      title,
      hospital,
      date,
      time,
      location,
      description,
      contact,
      documentPath: req.file?.path,
      addedBy: req.hospital.id,
    });

    await newCamp.save();
    res.status(201).json({ message: "Camp created successfully", newCamp });
  } catch (err) {
    res.status(500).json({ error: "Failed to create camp" });
  }
};

exports.getUserCamps = async (req, res) => {
  try {
    const camps = await Camp.find({ addedBy: req.hospital.id });
    res.status(200).json({ camps });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch camps" });
  }
};

exports.getAllCamps = async (req, res) => {
  try {
    const camps = await Camp.find({});
    res.status(200).json({ camps });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all camps" });
  }
};
