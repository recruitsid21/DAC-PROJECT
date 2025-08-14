import express from "express";
import UserController from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// User dashboard stats
router.get("/stats", UserController.getDashboardStats);

// User bookings
router.get("/bookings", UserController.getMyBookings);

export default router;
