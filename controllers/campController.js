const Camp = require('../models/Camp');

exports.addCamp = async (req, res) => {
  try {
    console.log("🔍 Debug - addCamp called with body:", req.body);
    console.log("🔍 Debug - hospital ID:", req.hospital?.id);
    console.log("🔍 Debug - file:", req.file);

    const { title, hospital, date, time, location, description, contact } = req.body;

    // Validate required fields
    if (!title || !hospital || !date || !time || !location || !description || !contact) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!req.hospital?.id) {
      return res.status(401).json({ error: "Hospital authentication required" });
    }

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

    console.log("🔍 Debug - New camp object:", newCamp);

    await newCamp.save();
    console.log("🔍 Debug - Camp saved successfully");
    res.status(201).json({ message: "Camp created successfully", newCamp });
  } catch (err) {
    console.error("❌ Error in addCamp:", err);
    res.status(500).json({ error: "Failed to create camp" });
  }
};

exports.getUserCamps = async (req, res) => {
  try {
    console.log("🔍 Debug - getUserCamps called for hospital ID:", req.hospital?.id);
    
    if (!req.hospital?.id) {
      return res.status(401).json({ error: "Hospital authentication required" });
    }

    const camps = await Camp.find({ addedBy: req.hospital.id });
    console.log("🔍 Debug - Found camps:", camps.length);
    
    res.status(200).json({ camps });
  } catch (err) {
    console.error("❌ Error in getUserCamps:", err);
    res.status(500).json({ error: "Failed to fetch camps" });
  }
};

exports.getAllCamps = async (req, res) => {
  try {
    const camps = await Camp.find({});
    res.status(200).json({ camps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch all camps" });
  }
};

exports.deleteCamp = async (req, res) => {
  try {
    const campId = req.params.id;

    // Ensure the camp belongs to the hospital making the request
    const camp = await Camp.findOne({ _id: campId, addedBy: req.hospital.id });
    if (!camp) {
      return res.status(404).json({ error: "Camp not found or you don't have permission to delete it" });
    }

    await Camp.findByIdAndDelete(campId);
    res.status(200).json({ message: "Camp deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete camp" });
  }
};
