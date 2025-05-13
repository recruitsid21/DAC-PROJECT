// Import core packages
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Import middlewares
const errorHandler = require("./middlewares/errorHandler");

// Initialize express app
const app = express();

// ====================
// Global Middlewares
// ====================

// Enable Cross-Origin Resource Sharing
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//   })
// );
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

console.log("Client URL:", process.env.CLIENT_URL); // Log the URL

// Parse cookies
app.use(cookieParser());

// Parse incoming JSON payloads
app.use(express.json());

// Attach db to request
app.use((req, res, next) => {
  req.db = require("./config/db");
  next();
});

// ====================
// Route Middlewares
// ====================

// Authentication Routes
app.use("/api/auth", authRoutes);

// Event Routes
app.use("/api/events", eventRoutes);

// Booking Routes
app.use("/api/bookings", bookingRoutes);

// Payment Routes
app.use("/api/payments", paymentRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// ====================
// Error Handler Middleware
// ====================

app.use(errorHandler);

// Export app for server.js to use
module.exports = app;
