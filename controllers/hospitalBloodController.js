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

// 🩸 Add blood (positive to add, negative to subtract)
exports.addBloodUnits = async (req, res) => {
  const hospitalId = req.hospital.id;
  console.log("🔍 Debug - hospitalId:", hospitalId);

  const hospitalObjectId = mongoose.Types.ObjectId.isValid(hospitalId)
    ? new mongoose.Types.ObjectId(hospitalId)
    : hospitalId;

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
    const bloodData = req.body.bloodData;
    console.log("🔍 Debug - bloodData:", bloodData);

    if (!bloodData || !Array.isArray(bloodData)) {
      return res.status(400).json({ message: "Invalid blood data format" });
    }

    // Normalize blood types & validate
    for (const entry of bloodData) {
      if (
        !entry.bloodType ||
        typeof entry.units !== "number" ||
        entry.units === 0
      ) {
        console.log("🔍 Debug - Invalid blood entry:", entry);
        return res.status(400).json({ message: "Invalid blood entry format" });
      }

      // Normalize bloodType minus signs to ASCII hyphen-minus '-'
      const normalizedBloodType = entry.bloodType.replace(/[−–—]/g, "-");

      // Check current stock for this bloodType at this hospital
      const currentStock = await HospitalBloodUnit.aggregate([
        { $match: { hospital: hospitalObjectId, bloodType: normalizedBloodType } },
        { $group: { _id: null, total: { $sum: "$units" } } },
      ]);
      const stockTotal = currentStock[0]?.total || 0;

      if (stockTotal + entry.units < 0) {
        return res.status(400).json({
          message: `Not enough stock of ${normalizedBloodType} to remove ${Math.abs(
            entry.units
          )} units (current stock: ${stockTotal})`,
        });
      }

      // Update the entry bloodType to normalized version
      entry.bloodType = normalizedBloodType;
    }

    // Map entries to insert
    const entries = bloodData.map(({ bloodType, units }) => ({
      hospital: hospitalObjectId,
      bloodType,
      units,
    }));

    console.log("🔍 Debug - entries to insert:", entries);

    await HospitalBloodUnit.insertMany(entries);
    console.log("🔍 Debug - Blood units inserted successfully");
    res.status(200).json({ message: "Blood units updated successfully" });
  } catch (error) {
    console.error("❌ Error adding blood units:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧾 View own entries - Aggregated by blood type
exports.getHospitalBlood = async (req, res) => {
  const hospitalId = req.hospital.id;
  const hospitalObjectId = mongoose.Types.ObjectId.isValid(hospitalId)
    ? new mongoose.Types.ObjectId(hospitalId)
    : hospitalId;

  try {
    const aggregatedData = await HospitalBloodUnit.aggregate([
      { $match: { hospital: hospitalObjectId } },
      {
        $group: {
          _id: "$bloodType",
          totalUnits: { $sum: "$units" },
          entryCount: { $sum: 1 },
          lastUpdated: { $max: "$createdAt" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const detailedHistory = await HospitalBloodUnit.find({
      hospital: hospitalObjectId,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      aggregated: aggregatedData,
      history: detailedHistory,
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

    const formattedSummary = {};
    summary.forEach((item) => {
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
              totalUnits: "$totalUnits",
            },
          },
        },
      },
    ]);

    const withHospitalDetails = await Promise.all(
      result.map(async (entry) => {
        const hospital = await Hospital.findById(entry._id).select(
          "hospitalName district"
        );
        return {
          hospitalId: entry._id,
          hospitalName: hospital?.hospitalName || "Unknown Hospital",
          district: hospital?.district || "Unknown District",
          bloodData: entry.bloodData,
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
