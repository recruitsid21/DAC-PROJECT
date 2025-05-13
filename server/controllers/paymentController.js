const db = require("../config/db");
const crypto = require("crypto");

// @desc    Initiate payment
// @route   POST /api/payments/initiate
// @access  Private
exports.initiatePayment = async (req, res, next) => {
  try {
    const { booking_id, payment_method = "razorpay" } = req.body;

    // Validate booking exists and belongs to user
    const [bookings] = await db.query(
      `SELECT b.booking_id, b.user_id, b.total_amount, b.status,
       e.title AS event_title
       FROM bookings b
       JOIN events e ON b.event_id = e.event_id
       WHERE b.booking_id = ?`,
      [booking_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookings[0];

    if (booking.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized for this booking" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: `Booking is already ${booking.status}`,
      });
    }

    // Check if payment already exists
    const [existingPayments] = await db.query(
      `SELECT payment_id, payment_status 
       FROM payments 
       WHERE booking_id = ? 
       ORDER BY payment_date DESC 
       LIMIT 1`,
      [booking_id]
    );

    if (
      existingPayments.length > 0 &&
      ["created", "authorized"].includes(existingPayments[0].payment_status)
    ) {
      return res.status(400).json({
        message: "Payment already initiated for this booking",
      });
    }

    // Create payment record
    const payment_id = `pay_${crypto.randomBytes(8).toString("hex")}`;
    const transaction_id = `txn_${crypto.randomBytes(8).toString("hex")}`;

    await db.query(
      `INSERT INTO payments 
       (payment_id, booking_id, amount, currency, 
        payment_method, payment_status, transaction_id)
       VALUES (?, ?, ?, 'INR', ?, 'created', ?)`,
      [
        payment_id,
        booking_id,
        booking.total_amount,
        payment_method,
        transaction_id,
      ]
    );

    // In a real app, integrate with payment gateway here
    const paymentData = {
      payment_id,
      transaction_id,
      amount: booking.total_amount,
      currency: "INR",
      booking_id,
      description: `Payment for ${booking.event_title}`,
      // These would come from payment gateway in real implementation:
      gateway_order_id: `order_${crypto.randomBytes(8).toString("hex")}`,
      gateway_key: process.env.RAZORPAY_KEY_ID, // From .env
      callback_url: `${process.env.APP_URL}/payment/verify`,
    };

    res.json(paymentData);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { payment_id, transaction_id } = req.body;

    // Validate payment exists and belongs to user
    const [payments] = await db.query(
      `SELECT p.*, b.user_id, b.status AS booking_status
       FROM payments p
       JOIN bookings b ON p.booking_id = b.booking_id
       WHERE p.payment_id = ? AND p.transaction_id = ?`,
      [payment_id, transaction_id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const payment = payments[0];

    if (payment.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized for this payment" });
    }

    // In a real app, verify with payment gateway API here
    const isPaymentSuccessful = true; // Mock verification

    await db.query("START TRANSACTION");

    try {
      if (isPaymentSuccessful) {
        // Update payment status
        await db.query(
          `UPDATE payments 
           SET payment_status = 'captured',
               payment_date = NOW()
           WHERE payment_id = ?`,
          [payment_id]
        );

        // Update booking status
        await db.query(
          `UPDATE bookings 
           SET status = 'confirmed'
           WHERE booking_id = ?`,
          [payment.booking_id]
        );

        await db.query("COMMIT");

        res.json({
          status: "success",
          message: "Payment verified and booking confirmed",
        });
      } else {
        // Payment failed
        await db.query(
          `UPDATE payments 
           SET payment_status = 'failed',
               payment_date = NOW()
           WHERE payment_id = ?`,
          [payment_id]
        );

        await db.query("COMMIT");

        res.status(400).json({
          status: "failed",
          message: "Payment verification failed",
        });
      }
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Payment webhook (for payment gateway callbacks)
// @route   POST /api/payments/webhook
// @access  Public
exports.paymentWebhook = async (req, res, next) => {
  try {
    // In a real app, verify the webhook signature from payment gateway
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Mock verification - in reality use crypto to verify HMAC
    const isValid = true;

    if (!isValid) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const { event, payload } = req.body;

    // Handle different payment events
    switch (event) {
      case "payment.captured":
        await handleSuccessfulPayment(payload.payment.entity);
        break;
      case "payment.failed":
        await handleFailedPayment(payload.payment.entity);
        break;
      // Add other cases as needed
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// Helper functions for webhook
async function handleSuccessfulPayment(payment) {
  await db.query("START TRANSACTION");

  try {
    // Update payment status
    await db.query(
      `UPDATE payments 
       SET payment_status = 'captured',
           payment_date = NOW(),
           receipt_url = ?
       WHERE payment_id = ?`,
      [payment.receipt, payment.id]
    );

    // Update booking status
    await db.query(
      `UPDATE bookings 
       SET status = 'confirmed'
       WHERE booking_id = (
         SELECT booking_id FROM payments WHERE payment_id = ?
       )`,
      [payment.id]
    );

    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

async function handleFailedPayment(payment) {
  await db.query(
    `UPDATE payments 
     SET payment_status = 'failed',
         payment_date = NOW()
     WHERE payment_id = ?`,
    [payment.id]
  );
}

// @desc    Get all payments (Admin only)
// @route   GET /api/payments
// @access  Private (Admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filtering
    const { status, payment_method } = req.query;
    let whereClauses = [];
    let params = [];

    if (status) {
      whereClauses.push("payment_status = ?");
      params.push(status);
    }

    if (payment_method) {
      whereClauses.push("payment_method = ?");
      params.push(payment_method);
    }

    let whereClause = "";
    if (whereClauses.length > 0) {
      whereClause = `WHERE ${whereClauses.join(" AND ")}`;
    }

    // Get payments
    const [payments] = await db.query(
      `SELECT p.*, 
       b.booking_id, b.total_amount, b.status AS booking_status,
       u.user_id, u.name AS user_name, u.email AS user_email,
       e.event_id, e.title AS event_title
       FROM payments p
       JOIN bookings b ON p.booking_id = b.booking_id
       JOIN users u ON b.user_id = u.user_id
       JOIN events e ON b.event_id = e.event_id
       ${whereClause}
       ORDER BY p.payment_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count for pagination
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total 
       FROM payments p
       ${whereClause}`,
      params
    );

    res.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
