// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST: Register new user
router.post("/register", authController.registerUser);
// POST: Login user
router.post("/login", authController.loginUser);

module.exports = router;
