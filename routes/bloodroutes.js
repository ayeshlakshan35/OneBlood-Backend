const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const hospitalBloodController = require("../controllers/hospitalBloodController");

// Add blood data
router.post("/add-blood", verifyToken, (req, res, next) => {
  next();
}, hospitalBloodController.addBloodUnits);

// View own submitted blood units
router.get("/my-blood", verifyToken, hospitalBloodController.getHospitalBlood);

// Get overall blood summary
router.get("/summary", verifyToken, hospitalBloodController.getOverallBloodSummary);

// View history (by hospital)
router.get("/history", verifyToken, hospitalBloodController.getBloodHistory);

// Get blood data for all hospitals
router.get("/all-hospitals", verifyToken, hospitalBloodController.getAllHospitalsBloodData);

// Test endpoint to check database status (no auth required)
router.get("/test-data", async (req, res) => {
  try {
    const Hospital = require("../models/Hospital");
    const HospitalBloodUnit = require("../models/HospitalBlood");
    
    const totalHospitals = await Hospital.countDocuments();
    const totalBloodUnits = await HospitalBloodUnit.countDocuments();
    
    console.log("🔍 Debug - Database status:", { totalHospitals, totalBloodUnits });
    
    res.json({
      totalHospitals,
      totalBloodUnits,
      message: "Database status check"
    });
  } catch (err) {
    console.error("❌ Error checking database status:", err);
    res.status(500).json({ error: "Database check failed" });
  }
});

// Add blood units (increase stock) - Use hospital-specific controller
router.post("/add", verifyToken, hospitalBloodController.addBloodUnits);


// Reduce blood units (decrease stock)
router.post("/reduce", verifyToken, async (req, res) => {
  try {
    const updates = req.body.bloodData; // [{ bloodType, units }, ...]

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "Invalid bloodData format" });
    }

    let bloodDoc = await Blood.findOne();
    if (!bloodDoc) {
      return res.status(404).json({ message: "Blood stock not found" });
    }

    updates.forEach(update => {
      if (typeof update.units !== "number" || update.units <= 0) {
        throw new Error(`Units must be a positive number for ${update.bloodType}`);
      }

      const record = bloodDoc.bloodData.find(b => b.bloodType === update.bloodType);

      if (!record) {
        throw new Error(`Blood type ${update.bloodType} not found`);
      }

      if (record.units < update.units) {
        throw new Error(`Insufficient units for blood type ${update.bloodType}`);
      }

      // Subtract units
      record.units -= update.units;
    });

    await bloodDoc.save();

    res.status(200).json({ message: "Blood units reduced successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to reduce blood units" });
  }
});

module.exports = router;
