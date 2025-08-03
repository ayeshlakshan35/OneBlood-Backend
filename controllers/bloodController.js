

// exports.addBlood = async (req, res) => {
//   const {bloodData } = req.body;

//   try {
//     const newEntry = new Blood({
//       bloodData,
//     });

//     await newEntry.save();

//     res.status(201).json({ message: "✅ Blood data added successfully." });
//   } catch (error) {
//     console.error("Error saving blood data:", error);
//     res.status(500).json({ message: "❌ Failed to add blood data." });
//   }
// };

// exports.getBloodHistory = async (req, res) => {
//   try {
//     const history = await Blood.find().sort({ addedAt: -1 });
//     res.json(history);
//   } catch (error) {
//     console.error("Error fetching history:", error);
//     res.status(500).json({ message: "❌ Failed to fetch history." });
//   }
// };

// exports.getOverallBloodSummary = async (req, res) => {


//   try {
//     const allEntries = await Blood.find();

//     const summary = {};

//     allEntries.forEach(entry => {
//       entry.bloodData.forEach(unit => {
//         if (!summary[unit.bloodType]) {
//           summary[unit.bloodType] = 0;
//         }
//         summary[unit.bloodType] += unit.units;
//       });
//     });

//     res.status(200).json(summary);
//   } catch (error) {
//     console.error("Error getting overall summary:", error);
//     res.status(500).json({ message: "❌ Failed to fetch summary." });
//   }
// };

