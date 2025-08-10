const DonorEligibility = require("../models/Donors");

// @desc    Add new donor eligibility record
// @route   POST /api/donor-eligibility
// @access  Public
const addDonorEligibility = async (req, res) => {
  try {
    const {
      bloodType,
      district,
      ageCriteria,
      donationGap,
      hemoglobin,
      healthCondition,
    } = req.body;

    // Validation
    if (
      !bloodType ||
      !district ||
      !req.file ||
      ageCriteria === undefined ||
      donationGap === undefined ||
      hemoglobin === undefined ||
      healthCondition === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All fields including district and identity proof are required" });
    }

    // Allowed Sri Lankan districts
    const allowedDistricts = [
      "Ampara",
      "Anuradhapura",
      "Badulla",
      "Batticaloa",
      "Colombo",
      "Galle",
      "Gampaha",
      "Hambantota",
      "Jaffna",
      "Kalutara",
      "Kandy",
      "Kegalle",
      "Kilinochchi",
      "Kurunegala",
      "Mannar",
      "Matale",
      "Matara",
      "Monaragala",
      "Mullaitivu",
      "Nuwara Eliya",
      "Polonnaruwa",
      "Puttalam",
      "Ratnapura",
      "Trincomalee",
      "Vavuniya",
    ];

    if (!allowedDistricts.includes(district)) {
      return res.status(400).json({ message: "Invalid district" });
    }

    // Create new donor record
    const newDonorEligibility = new DonorEligibility({
      bloodType,
      district,
      ageCriteria: ageCriteria === "true" || ageCriteria === true,
      donationGap: donationGap === "true" || donationGap === true,
      hemoglobin: hemoglobin === "true" || hemoglobin === true,
      healthCondition: healthCondition === "true" || healthCondition === true,
      identityProof: req.file.path, // multer file path
    });

    await newDonorEligibility.save();

    res.status(201).json({
      message: "Donor eligibility added successfully",
      donorEligibility: newDonorEligibility,
    });
  } catch (error) {
    console.error("Error adding donor eligibility:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addDonorEligibility };
