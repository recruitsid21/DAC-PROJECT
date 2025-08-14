import express from "express";
import CreatorController from "../controllers/creatorController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes and restrict to organizers
router.use(protect, restrictTo("organizer"));

// Dashboard
router.get("/stats", CreatorController.getCreatorStats);

// Event management
router.get("/events", CreatorController.getMyEvents);
router.get("/events/:id", CreatorController.getEventDetails);
router.get("/events/:id/bookings", CreatorController.getEventBookings);
router.get("/events/:id/stats", CreatorController.getEventStats);
router.get("/events/:id/insights", CreatorController.getEventInsights);
router.delete("/events/:id", CreatorController.deleteEvent);

// Seat management
router.post("/events/:id/seats", CreatorController.addSeats);

export default router;
