const db = require("../config/db");

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { event_id, seat_ids } = req.body;

    if (
      !event_id ||
      !seat_ids ||
      !Array.isArray(seat_ids) ||
      seat_ids.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Event ID and seat IDs are required" });
    }

    // Start transaction
    await db.query("START TRANSACTION");

    try {
      // 1. Verify event exists and is not cancelled
      const [events] = await db.query(
        `SELECT event_id, price, is_cancelled 
         FROM events 
         WHERE event_id = ?`,
        [event_id]
      );

      if (events.length === 0) {
        throw new Error("Event not found");
      }

      if (events[0].is_cancelled) {
        throw new Error("Event is cancelled");
      }

      // 2. Verify seats exist, belong to event, and are available
      const [seats] = await db.query(
        `SELECT seat_id, seat_type, price_multiplier, is_booked
         FROM seats 
         WHERE event_id = ? AND seat_id IN (?)`,
        [event_id, seat_ids]
      );

      if (seats.length !== seat_ids.length) {
        throw new Error("Some seats don't exist for this event");
      }

      const bookedSeats = seats.filter((seat) => seat.is_booked);
      if (bookedSeats.length > 0) {
        throw new Error(
          `Seats ${bookedSeats
            .map((s) => s.seat_id)
            .join(", ")} are already booked`
        );
      }

      // 3. Calculate total price
      const basePrice = events[0].price;
      const totalAmount = seats.reduce((sum, seat) => {
        return sum + basePrice * seat.price_multiplier;
      }, 0);

      // 4. Create booking record
      const [bookingResult] = await db.query(
        `INSERT INTO bookings 
         (user_id, event_id, total_amount)
         VALUES (?, ?, ?)`,
        [req.user.id, event_id, totalAmount]
      );

      const bookingId = bookingResult.insertId;

      // 5. Book seats and create booked_seats records
      for (const seat of seats) {
        const seatPrice = basePrice * seat.price_multiplier;

        await db.query(
          `INSERT INTO booked_seats
           (booking_id, seat_id, price_paid)
           VALUES (?, ?, ?)`,
          [bookingId, seat.seat_id, seatPrice]
        );
      }

      // 6. Update event available seats count
      await db.query(
        `UPDATE events 
         SET available_seats = available_seats - ?
         WHERE event_id = ?`,
        [seat_ids.length, event_id]
      );

      await db.query("COMMIT");

      res.status(201).json({
        bookingId,
        totalAmount,
        message: "Booking created successfully. Proceed to payment.",
      });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/user
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.booking_id, b.booking_date, b.status, b.total_amount,
       e.event_id, e.title, e.date, e.time, e.location, e.image_url,
       COUNT(bs.seat_id) AS seats_count
       FROM bookings b
       JOIN events e ON b.event_id = e.event_id
       LEFT JOIN booked_seats bs ON b.booking_id = bs.booking_id
       WHERE b.user_id = ?
       GROUP BY b.booking_id
       ORDER BY b.booking_date DESC`,
      [req.user.id]
    );

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingDetails = async (req, res, next) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, 
       e.title, e.date, e.time, e.location, e.image_url,
       u.name AS user_name, u.email AS user_email
       FROM bookings b
       JOIN events e ON b.event_id = e.event_id
       JOIN users u ON b.user_id = u.user_id
       WHERE b.booking_id = ?`,
      [req.params.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookings[0];

    // Check if booking belongs to user (unless admin)
    if (booking.user_id !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to view this booking" });
    }

    // Get booked seats
    const [seats] = await db.query(
      `SELECT s.seat_id, s.seat_number, s.seat_type, bs.price_paid
       FROM booked_seats bs
       JOIN seats s ON bs.seat_id = s.seat_id
       WHERE bs.booking_id = ?`,
      [req.params.id]
    );

    // Get payment info if exists
    const [payments] = await db.query(
      `SELECT payment_id, amount, currency, payment_method, 
       payment_status, payment_date, transaction_id, receipt_url
       FROM payments
       WHERE booking_id = ?`,
      [req.params.id]
    );

    res.json({
      ...booking,
      seats,
      payment: payments[0] || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;

    // Start transaction
    await db.query("START TRANSACTION");

    try {
      // 1. Get booking details
      const [bookings] = await db.query(
        `SELECT booking_id, user_id, event_id, status, total_amount
         FROM bookings
         WHERE booking_id = ?`,
        [bookingId]
      );

      if (bookings.length === 0) {
        throw new Error("Booking not found");
      }

      const booking = bookings[0];

      // 2. Check if booking belongs to user (unless admin)
      if (booking.user_id !== req.user.id && req.user.role !== "admin") {
        throw new Error("Not authorized to cancel this booking");
      }

      // 3. Check if booking can be cancelled
      if (booking.status !== "confirmed") {
        throw new Error("Only confirmed bookings can be cancelled");
      }

      // 4. Check if event is in the future
      const [events] = await db.query(
        `SELECT event_id, date, time 
         FROM events 
         WHERE event_id = ?`,
        [booking.event_id]
      );

      if (events.length === 0) {
        throw new Error("Event not found");
      }

      const event = events[0];
      const eventDateTime = new Date(`${event.date} ${event.time}`);
      const currentDateTime = new Date();

      if (eventDateTime <= currentDateTime) {
        throw new Error("Cannot cancel booking for past events");
      }

      // 5. Update booking status
      await db.query(
        `UPDATE bookings 
         SET status = 'cancelled', 
             cancellation_date = NOW()
         WHERE booking_id = ?`,
        [bookingId]
      );

      // 6. Free up seats
      await db.query(
        `UPDATE seats s
         JOIN booked_seats bs ON s.seat_id = bs.seat_id
         SET s.is_booked = FALSE
         WHERE bs.booking_id = ?`,
        [bookingId]
      );
      // 7. Update event available seats count
      const [bookedSeats] = await db.query(
        `SELECT COUNT(*) AS count 
     FROM booked_seats 
     WHERE booking_id = ?`,
        [bookingId]
      );

      await db.query(
        `UPDATE events 
     SET available_seats = available_seats + ?
     WHERE event_id = ?`,
        [bookedSeats[0].count, booking.event_id]
      );

      // 8. Initiate refund if payment was made
      if (booking.status === "confirmed") {
        const [payments] = await db.query(
          `SELECT payment_id, payment_status, amount 
       FROM payments 
       WHERE booking_id = ?`,
          [bookingId]
        );

        if (payments.length > 0 && payments[0].payment_status === "captured") {
          // In a real app, call payment gateway API to process refund
          await db.query(
            `UPDATE payments 
         SET payment_status = 'refunded'
         WHERE payment_id = ?`,
            [payments[0].payment_id]
          );

          // Record refund in payments table
          await db.query(
            `INSERT INTO payments 
         (booking_id, amount, currency, payment_method, 
          payment_status, transaction_id)
         VALUES (?, ?, 'INR', 'refund', 'refunded', UUID())`,
            [bookingId, payments[0].amount]
          );
        }
      }

      await db.query("COMMIT");

      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc Get all bookings (Admin only)
// @route GET /api/bookings
// @access Private (Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    // Filtering
    const { status, event_id, user_id } = req.query;
    let whereClauses = [];
    let params = [];

    if (status) {
      whereClauses.push("b.status = ?");
      params.push(status);
    }

    if (event_id) {
      whereClauses.push("b.event_id = ?");
      params.push(event_id);
    }

    if (user_id) {
      whereClauses.push("b.user_id = ?");
      params.push(user_id);
    }

    let whereClause = "";
    if (whereClauses.length > 0) {
      whereClause = `WHERE ${whereClauses.join(" AND ")}`;
    }

    // Get bookings
    const [bookings] = await db.query(
      `SELECT b.booking_id, b.booking_date, b.status, b.total_amount,
       e.event_id, e.title, e.date, e.time, e.location,
       u.user_id, u.name AS user_name, u.email AS user_email,
       COUNT(bs.seat_id) AS seats_count
       FROM bookings b
       JOIN events e ON b.event_id = e.event_id
       JOIN users u ON b.user_id = u.user_id
       LEFT JOIN booked_seats bs ON b.booking_id = bs.booking_id
       ${whereClause}
       GROUP BY b.booking_id
       ORDER BY b.booking_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count for pagination
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total 
       FROM bookings b
       ${whereClause}`,
      params
    );

    res.json({
      bookings,
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
