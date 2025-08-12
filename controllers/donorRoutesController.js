const DonorEligibility = require("../models/Donors");
const DonorRequest = require("../models/DonorRequest");
const Hospital = require("../models/Hospital");

// @desc    Add new donor eligibility record
// @route   POST /api/donor-eligibility
// @access  Public
const addDonorEligibility = async (req, res) => {
  try {
    const {
      bloodType,
      hospital,
      ageCriteria,
      donationGap,
      hemoglobin,
      healthCondition,
      donorName,
      donorPhone,
      donorEmail,
    } = req.body;

    // Validation
    if (
      !bloodType ||
      !hospital ||
      !req.file ||
      ageCriteria === undefined ||
      donationGap === undefined ||
      hemoglobin === undefined ||
      healthCondition === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All fields including hospital and identity proof are required" });
    }

    // Validate that the hospital exists
    const hospitalExists = await Hospital.findById(hospital);
    if (!hospitalExists) {
      return res.status(400).json({ message: "Invalid hospital selected" });
    }

    // Create new donor request
    const newDonorRequest = new DonorRequest({
      donor: {
        bloodType,
        hospital,
        ageCriteria: ageCriteria === "true" || ageCriteria === true,
        donationGap: donationGap === "true" || donationGap === true,
        hemoglobin: hemoglobin === "true" || hemoglobin === true,
        healthCondition: healthCondition === "true" || healthCondition === true,
        identityProof: req.file.path,
        contactInfo: {
          name: donorName || "Anonymous",
          phone: donorPhone || "",
          email: donorEmail || "",
        },
      },
      status: "pending",
    });

    await newDonorRequest.save();

    res.status(201).json({
      message: "Donor request submitted successfully! The hospital will review your application and contact you.",
      donorRequest: newDonorRequest,
    });
  } catch (error) {
    console.error("Error adding donor request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get donor requests for a hospital
// @route   GET /api/donors/hospital-requests
// @access  Private (Hospital only)
const getHospitalDonorRequests = async (req, res) => {
  try {
    const hospitalId = req.hospital.id;
    
    const requests = await DonorRequest.find({
      "donor.hospital": hospitalId,
    })
    .populate("donor.hospital", "hospitalName district")
    .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching hospital donor requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Respond to donor request
// @route   PUT /api/donors/respond-request/:requestId
// @access  Private (Hospital only)
const respondToDonorRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { accepted, scheduledDate, scheduledTime, message } = req.body;
    const hospitalId = req.hospital.id;

    const donorRequest = await DonorRequest.findById(requestId);
    
    if (!donorRequest) {
      return res.status(404).json({ message: "Donor request not found" });
    }

    // Verify the request belongs to this hospital
    if (donorRequest.donor.hospital.toString() !== hospitalId) {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }

    // Update the request
    donorRequest.status = accepted ? "accepted" : "rejected";
    donorRequest.hospitalResponse = {
      accepted,
      scheduledDate: accepted ? new Date(scheduledDate) : null,
      scheduledTime: accepted ? scheduledTime : null,
      message,
      respondedAt: new Date(),
    };

    await donorRequest.save();

    res.status(200).json({
      message: accepted ? "Donor request accepted successfully" : "Donor request rejected",
      donorRequest,
    });
  } catch (error) {
    console.error("Error responding to donor request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reject donor request specifically
// @route   PUT /api/donors/reject-request/:requestId
// @access  Private (Hospital only)
const rejectDonorRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { message } = req.body;
    const hospitalId = req.hospital.id;

    const donorRequest = await DonorRequest.findById(requestId);
    
    if (!donorRequest) {
      return res.status(404).json({ message: "Donor request not found" });
    }

    // Verify the request belongs to this hospital
    if (donorRequest.donor.hospital.toString() !== hospitalId) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    // Check if request is already processed
    if (donorRequest.status !== 'pending') {
      return res.status(400).json({ message: "Request has already been processed" });
    }

    // Update the request to rejected
    donorRequest.status = "rejected";
    donorRequest.hospitalResponse = {
      accepted: false,
      scheduledDate: null,
      scheduledTime: null,
      message: message || "Your donation request has been rejected by the hospital.",
      respondedAt: new Date(),
    };

    await donorRequest.save();

    res.status(200).json({
      message: "Donor request rejected successfully",
      donorRequest,
    });
  } catch (error) {
    console.error("Error rejecting donor request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get rejected donor requests for a hospital
// @route   GET /api/donors/rejected-requests
// @access  Private (Hospital only)
const getRejectedDonorRequests = async (req, res) => {
  try {
    const hospitalId = req.hospital.id;
    
    const requests = await DonorRequest.find({
      "donor.hospital": hospitalId,
      status: "rejected"
    })
    .populate("donor.hospital", "hospitalName district")
    .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching rejected donor requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get donor requests by phone number with status filter (for donors to check their status)
// @route   GET /api/donors/my-requests/:phone
// @access  Public
const getDonorRequestsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const { status } = req.query; // Add status filter
    
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    let query = {
      "donor.contactInfo.phone": phone,
    };

    // Add status filter if provided
    if (status && ['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
      query.status = status;
    }

    const requests = await DonorRequest.find(query)
    .populate("donor.hospital", "hospitalName district")
    .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching donor requests by phone:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get rejected donor requests by phone number (for donors to check their rejected requests)
// @route   GET /api/donors/rejected-requests/:phone
// @access  Public
const getRejectedDonorRequestsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const requests = await DonorRequest.find({
      "donor.contactInfo.phone": phone,
      status: "rejected"
    })
    .populate("donor.hospital", "hospitalName district")
    .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching rejected donor requests by phone:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  addDonorEligibility, 
  getHospitalDonorRequests, 
  respondToDonorRequest,
  getDonorRequestsByPhone,
  rejectDonorRequest,
  getRejectedDonorRequests,
  getRejectedDonorRequestsByPhone
};
