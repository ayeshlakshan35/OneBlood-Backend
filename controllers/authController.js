// controllers/authController.js
const User = require("../models/User"); // adjust path to your User model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      phone,
      nic,
      address,
      city,
      state,
      postalCode,
      email,
      password,
    } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Check if NIC already exists
    const existingNIC = await User.findOne({ nic });
    if (existingNIC) {
      return res.status(400).json({ message: "NIC number is already registered" });
    }

    // // Hash password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      dob,
      phone,
      nic,
      address,
      city,
      state,
      postalCode,
      email,
      password,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📥 Login request body:", { email, password });

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("No user found for email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch, "Provided password:", password, "Stored hash:", user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log("🔍 Debug - Update Profile Request:");
    console.log("🔍 User from token:", req.user);
    console.log("🔍 Request body:", req.body);
    
    const userId = req.user.id;
    console.log("🔍 User ID to update:", userId);
    
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }
    
    const updateData = { ...req.body };

    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;
    delete updateData.email; // Email should not be changed via this endpoint

    console.log("🔍 Data to update:", updateData);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return updated user data (excluding password)
    const userResponse = {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      dob: updatedUser.dob,
      phone: updatedUser.phone,
      nic: updatedUser.nic,
      address: updatedUser.address,
      city: updatedUser.city,
      state: updatedUser.state,
      postalCode: updatedUser.postalCode,
      email: updatedUser.email,
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse
    });
  } catch (err) {
    console.error("Profile Update Error:", err.message);
    res.status(500).json({ message: "Server error during profile update" });
  }
};