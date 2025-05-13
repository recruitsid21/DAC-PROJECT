const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  paymentWebhook,
  getAllPayments,
} = require("../controllers/paymentController");
const {
  authenticate,
  authorize,
  roles,
} = require("../middlewares/authMiddleware");

// Public route for payment gateway callbacks
router.post("/webhook", paymentWebhook);

// User routes
router.use(authenticate);

router.post("/initiate", initiatePayment);
router.post("/verify", verifyPayment);

// Admin routes
router.use(authorize(roles.admin));
router.get("/", getAllPayments);

module.exports = router;
