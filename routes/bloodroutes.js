const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
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

module.exports = router;
