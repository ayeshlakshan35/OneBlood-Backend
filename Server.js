require("dotenv").config();
console.log("🔍 Debug - Server startup: JWT_SECRET loaded:", !!process.env.JWT_SECRET);
console.log("🔍 Debug - Server startup: MONGO_URI loaded:", !!process.env.MONGO_URI);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const app = express();

// Constants
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const CLIENT_ORIGIN_ALT = "http://localhost:5174";
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// Validate MONGO_URI
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not defined in .env");
  process.exit(1); // Exit the app
}

// Middleware

app.use(
  cors({
    origin: [CLIENT_ORIGIN, CLIENT_ORIGIN_ALT], // Allow both ports
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use("/uploads", express.static("uploads"));

// Add cookie parser before routes
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const hospitalRoutes = require("./routes/routeshospital");
app.use("/api/routeshospital", hospitalRoutes);

const bloodRoutes = require("./routes/bloodroutes");
app.use("/api/bloodroutes", bloodRoutes);

const campRoutes = require("./routes/campRoutes");
app.use("/api/camp", campRoutes);

const donorRoutes = require("./routes/donorroutes");
app.use("/api/donors", donorRoutes);



// Multer error handling middleware — AFTER routes but BEFORE global error handler
app.use((err, req, res, next) => {
  if (
    err instanceof multer.MulterError ||
    err.message === "Only PDF or image files are allowed!"
  ) {
    console.error("⚠️ Multer error:", err.message);
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Default route
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// MongoDB connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Stop app if DB connection fails
  });

// Global error handler (for other unexpected errors)
app.use((err, req, res, next) => {
  console.error("🔥 Unexpected server error:", err.stack || err.message);
  console.error("🔥 Error name:", err.name);
  console.error("🔥 Error code:", err.code);
  console.error("🔥 Request URL:", req.url);
  console.error("🔥 Request method:", req.method);
  res.status(500).json({ error: "Internal server error" });
});
