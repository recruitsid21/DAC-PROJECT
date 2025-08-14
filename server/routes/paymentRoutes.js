import express from "express";
import PaymentController from "../controllers/paymentController.js";
import {
  protect,
  isBookingOwnerOrAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/create-intent", protect, PaymentController.createPaymentIntent);
router.post("/confirm", protect, PaymentController.confirmPayment);
router.get(
  "/:id",
  protect,
  isBookingOwnerOrAdmin,
  PaymentController.getPayment
);

// Webhook (no protection as it's called by payment provider)
router.post("/webhook", PaymentController.handleWebhook);

export default router;
