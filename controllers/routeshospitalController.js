const Hospital = require("../models/Hospital"); // Adjust path if needed
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// -------------------- REGISTER HOSPITAL --------------------
const registerHospital = async (req, res) => {
  try {
    const { hospitalName, address, district, phoneNumber, email, password } =
      req.body;

    // Validate fields + file presence
    if (
      !hospitalName ||
      !address ||
      !district ||
      !req.file ||
      !phoneNumber ||
      !email ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check for existing hospital email
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Create and save new hospital
    const newHospital = new Hospital({
      hospitalName,
      address,
      district,
      phoneNumber,
      email,
      password, // ✅ Save hashed password
      validDocuments: req.file.filename, // uploaded file
    });

    await newHospital.save();

    res.status(201).json({ message: "Hospital registered successfully." });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// -------------------- LOGIN HOSPITAL --------------------
const loginHospital = async (req, res) => {
  try {
    console.log("Login request body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const hospital = await Hospital.findOne({ email });
    if (!hospital) {
      console.log("No hospital found for email:", email);
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, hospital.password);
    console.log("Password match:", isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // ✅ Generate JWT token
    console.log("🔍 Debug - Hospital login: About to generate token");
    console.log(
      "🔍 Debug - Hospital login: JWT_SECRET exists:",
      !!process.env.JWT_SECRET
    );

    const token = jwt.sign(
      { id: hospital._id, email: hospital.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(
      "🔍 Debug - Hospital login: Token generated successfully:",
      !!token
    );

    // ✅ Set secure cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax", // or 'None' if cross-site with HTTPS
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // ✅ Send login success response with token
    console.log(
      "🔍 Debug - Hospital login: Token generated:",
      token ? token.substring(0, 20) + "..." : "No token"
    );
    console.log("🔍 Debug - Hospital login: Sending response with token");

    const response = {
      message: "Login successful",
      token: token, // Include token in response body
      hospital: {
        id: hospital._id,
        email: hospital.email,
        hospitalName: hospital.hospitalName,
      },
    };

    console.log("🔍 Debug - Hospital login: Response object:", response);
    res.status(200).json(response);
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

//.....................get Hospital name ..................
const getHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.hospital.id).select("hospitalName");
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.status(200).json({ hospitalName: hospital.hospitalName });
  } catch (error) {
    console.error("Error fetching hospital profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//.....................get All Hospitals ..................
const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).select("hospitalName district address phoneNumber");
    res.status(200).json(hospitals);
  } catch (error) {
    console.error("Error fetching all hospitals:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// -------------------- LOGOUT HOSPITAL --------------------
exports.logoutHospital = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  registerHospital,
  loginHospital,
  getHospitalProfile,
  getAllHospitals,
};
