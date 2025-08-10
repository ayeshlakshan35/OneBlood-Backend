const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { registerHospital, loginHospital, getHospitalProfile, getAllHospitals } = require("../controllers/routeshospitalController");

// POST: Register hospital (with file upload)
router.post("/register", upload.single("validDocuments"), registerHospital);

// POST: Login hospital
router.post("/login", loginHospital);

// GET: Get hospital profile (protected route)
router.get("/profile", getHospitalProfile);

// GET: Get all hospitals (public route - no authentication required)
router.get("/all-hospitals", getAllHospitals);

module.exports = router; 