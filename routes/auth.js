// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// POST: Register new user
router.post("/register", authController.registerUser);
// POST: Login user
router.post("/login", authController.loginUser);
// PUT: Update user profile
router.put("/update-profile", authMiddleware, authController.updateProfile);

module.exports = router;
