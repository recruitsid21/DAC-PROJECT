const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  getAllBookings,
} = require("../controllers/bookingController");
const {
  authenticate,
  authorize,
  roles,
} = require("../middlewares/authMiddleware");

// User routes
router.use(authenticate);

router.post("/", createBooking);
router.get("/user", getUserBookings);
router.get("/:id", getBookingDetails);
router.put("/:id/cancel", cancelBooking);

// Admin routes
router.use(authorize(roles.admin));
router.get("/", getAllBookings);

module.exports = router;
