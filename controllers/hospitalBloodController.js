const HospitalBloodUnit = require("../models/HospitalBlood");
const Hospital = require("../models/Hospital");
const mongoose = require("mongoose");


// Test model functionality
try {
  const testModel = new HospitalBloodUnit({
    hospital: new mongoose.Types.ObjectId(),
    bloodType: "A+",
    units: 1
  });
  console.log("🔍 Debug - Test model created successfully");
} catch (error) {
  console.error("❌ Error testing HospitalBloodUnit model:", error);
}

// 🩸 Add blood
exports.addBloodUnits = async (req, res) => {
 
  
  const hospitalId = req.hospital.id; // Use req.hospital.id from authMiddleware (JWT token contains 'id')
  console.log("🔍 Debug - hospitalId:", hospitalId);
  
  // Convert string ID to ObjectId if needed
  const hospitalObjectId = mongoose.Types.ObjectId.isValid(hospitalId) 
    ? new mongoose.Types.ObjectId(hospitalId) 
    : hospitalId;
  console.log("🔍 Debug - hospitalObjectId:", hospitalObjectId);
  
  // Verify hospital exists
  try {
    const hospitalExists = await Hospital.findById(hospitalObjectId);
    if (!hospitalExists) {
      console.log("🔍 Debug - Hospital not found:", hospitalObjectId);
      return res.status(404).json({ message: "Hospital not found" });
    }
    console.log("🔍 Debug - Hospital found:", hospitalExists.hospitalName);
  } catch (error) {
    console.error("❌ Error checking hospital:", error);
    return res.status(500).json({ error: "Error verifying hospital" });
  }
  
  try {
    const bloodData = req.body.bloodData; // Frontend sends bloodData array
    console.log("🔍 Debug - bloodData:", bloodData);
    
    if (!bloodData || !Array.isArray(bloodData)) {
      console.log("🔍 Debug - Invalid blood data format");
      return res.status(400).json({ message: "Invalid blood data format" });
    }

    // Validate each blood entry
    for (const entry of bloodData) {
      if (!entry.bloodType || !entry.units || typeof entry.units !== 'number' || entry.units <= 0) {
        console.log("🔍 Debug - Invalid blood entry:", entry);
        return res.status(400).json({ message: "Invalid blood entry format" });
      }
    }

    const entries = bloodData.map(({ bloodType, units }) => ({
      hospital: hospitalObjectId,
      bloodType: bloodType.replace(/[−–—]/g, '-'), // Normalize different types of minus signs to regular hyphen
      units,
    }));
    
    console.log("🔍 Debug - entries to insert:", entries);

    await HospitalBloodUnit.insertMany(entries);
    console.log("🔍 Debug - Blood units inserted successfully");
    res.status(200).json({ message: "Blood units added successfully" });
  } catch (error) {
    console.error("❌ Error adding blood units:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};


// 🧾 View own entries - Aggregated by blood type
exports.getHospitalBlood = async (req, res) => {
  const hospitalId = req.hospital.id; // Use req.hospital.id from authMiddleware (JWT token contains 'id')
  
  // Convert string ID to ObjectId if needed
  const hospitalObjectId = mongoose.Types.ObjectId.isValid(hospitalId) 
    ? new mongoose.Types.ObjectId(hospitalId) 
    : hospitalId;

  try {
    // Get aggregated blood data for this hospital
    const aggregatedData = await HospitalBloodUnit.aggregate([
      { $match: { hospital: hospitalObjectId } },
      {
        $group: {
          _id: "$bloodType",
          totalUnits: { $sum: "$units" },
          entryCount: { $sum: 1 },
          lastUpdated: { $max: "$createdAt" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get detailed history for this hospital
    const detailedHistory = await HospitalBloodUnit.find({ hospital: hospitalObjectId })
      .sort({ createdAt: -1 })
      .limit(10); // Limit to last 10 entries

    res.status(200).json({
      aggregated: aggregatedData,
      history: detailedHistory
    });
  } catch (err) {
    console.error("❌ Error fetching hospital blood:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📊 Get overall summary
exports.getOverallBloodSummary = async (req, res) => {
  try {
    const summary = await HospitalBloodUnit.aggregate([
      {
        $group: {
          _id: "$bloodType",
          totalUnits: { $sum: "$units" },
        },
      },
    ]);

    // Convert array of objects to simple object with blood types as keys
    const formattedSummary = {};
    summary.forEach(item => {
      formattedSummary[item._id] = item.totalUnits;
    });

    res.status(200).json(formattedSummary);
  } catch (err) {
    console.error("❌ Error generating summary:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🕘 Get blood history
exports.getBloodHistory = async (req, res) => {
  try {
    const history = await HospitalBloodUnit.find().sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 📦 Get blood data for all hospitals
exports.getAllHospitalsBloodData = async (req, res) => {
  try {
    const result = await HospitalBloodUnit.aggregate([
      {
        $group: {
          _id: { hospital: "$hospital", bloodType: "$bloodType" },
          totalUnits: { $sum: "$units" },
        },
      },
      {
        $group: {
          _id: "$_id.hospital",
          bloodData: {
            $push: {
              bloodType: "$_id.bloodType",
              totalUnits: "$totalUnits"
            }
          }
        }
      }
    ]);

    // Populate hospital names and district
    const withHospitalDetails = await Promise.all(
      result.map(async (entry) => {
        const hospital = await Hospital.findById(entry._id).select("hospitalName district");
        return {
          hospitalId: entry._id,
          hospitalName: hospital?.hospitalName || "Unknown Hospital",
          district: hospital?.district || "Unknown District",
          bloodData: entry.bloodData
        };
      })
    );

    console.log("🔍 Debug - All hospitals blood data response:", withHospitalDetails);
    res.status(200).json(withHospitalDetails);
  } catch (err) {
    console.error("❌ Error fetching all hospital blood data:", err);
    res.status(500).json({ message: "Server error" });
  }
};
