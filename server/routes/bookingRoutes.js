import express from "express";
import BookingController from "../controllers/bookingController.js";
import {
  protect,
  isBookingOwnerOrAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", protect, BookingController.createBooking);
router.get("/my-bookings", protect, BookingController.getUserBookings);
router.get(
  "/:id",
  protect,
  isBookingOwnerOrAdmin,
  BookingController.getBooking
);
router.patch(
  "/:id/cancel",
  protect,
  isBookingOwnerOrAdmin,
  BookingController.cancelBooking
);
router.post("/:id/confirm", protect, BookingController.confirmBooking);

export default router;
