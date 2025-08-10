// routes/donorEligibilityRoutes.js
const express = require("express");
const router = express.Router();
const { addDonorEligibility } = require("../controllers/donorRoutesController");
const upload = require("../middleware/upload"); // your multer config middleware

router.post("/add-donor", upload.single("identityProof"), addDonorEligibility);

module.exports = router;
