const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { registerHospital, loginHospital, getHospitalProfile } = require("../controllers/routeshospitalController");

// POST: Register hospital (with file upload)
router.post("/register", upload.single("validDocuments"), registerHospital);

// POST: Login hospital (no file upload needed)
router.post("/login", loginHospital);

// GET: Get hospital profile (protected route)
router.get("/profile", getHospitalProfile);

module.exports = router; 