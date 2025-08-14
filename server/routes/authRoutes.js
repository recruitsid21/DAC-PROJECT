import express from "express";
import AuthController from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/send-reset-email", AuthController.sendResetEmail); // For email functionality later
router.patch("/reset-password/:token", AuthController.resetPassword);
router.post("/refresh-token", AuthController.refreshToken);

// Protected routes
router.get("/me", protect, AuthController.getMe);
router.patch("/update-me", protect, AuthController.updateMe);
router.patch("/change-password", protect, AuthController.changePassword);

export default router;
