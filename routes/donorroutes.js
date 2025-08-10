// routes/donorEligibilityRoutes.js
const express = require("express");
const router = express.Router();
const { 
  addDonorEligibility, 
  getHospitalDonorRequests, 
  respondToDonorRequest,
  getDonorRequestsByPhone
} = require("../controllers/donorRoutesController");
const upload = require("../middleware/upload"); // your multer config middleware
const { verifyToken } = require("../middleware/authMiddleware");

// Public route for donor to submit eligibility
router.post("/add-donor", upload.single("identityProof"), addDonorEligibility);

// Public route for donors to check their request status
router.get("/my-requests/:phone", getDonorRequestsByPhone);

// Protected routes for hospitals
router.get("/hospital-requests", verifyToken, getHospitalDonorRequests);
router.put("/respond-request/:requestId", verifyToken, respondToDonorRequest);

module.exports = router;
