// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {

  
  // Check for token in Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.cookies?.token; // fallback to cookies

  console.log("🔍 Auth Debug:", {
    hasAuthHeader: !!authHeader,
    authHeader: authHeader,
    hasCookie: !!req.cookies?.token,
    token: token ? token.substring(0, 20) + "..." : null,
    url: req.url,
    method: req.method
  });

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET not defined in environment");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Debug - JWT decoded:", decoded);
    
    // Set user info for both users and hospitals
    req.user = decoded;
    req.hospital = decoded; // Keep for backward compatibility
    
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Export the middleware for use in routes
module.exports = exports.verifyToken;
module.exports.verifyToken = exports.verifyToken;
