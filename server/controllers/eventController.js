const db = require("../config/db");

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filtering
    const { category, dateFrom, dateTo, search } = req.query;
    let query = `
      SELECT e.*, c.name AS category_name, 
      COUNT(DISTINCT b.booking_id) AS bookings_count,
      COUNT(DISTINCT s.seat_id) AS total_seats,
      COUNT(DISTINCT CASE WHEN s.is_booked THEN s.seat_id END) AS booked_seats
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.category_id
      LEFT JOIN seats s ON e.event_id = s.event_id
      LEFT JOIN bookings b ON e.event_id = b.event_id
    `;

    const whereClauses = [];
    const params = [];

    if (category) {
      whereClauses.push("(c.name = ? OR c.category_id = ?)");
      params.push(category, category);
    }

    if (dateFrom) {
      whereClauses.push("e.date >= ?");
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClauses.push("e.date <= ?");
      params.push(dateTo);
    }

    if (search) {
      whereClauses.push(
        "(MATCH(e.title, e.description, e.location) AGAINST(? IN NATURAL LANGUAGE MODE) OR e.title LIKE ?)"
      );
      params.push(search, `%${search}%`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    query += ` GROUP BY e.event_id ORDER BY e.date ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [events] = await db.query(query, params);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) AS total FROM events";
    if (whereClauses.length > 0) {
      countQuery += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    const [[{ total }]] = await db.query(countQuery, params.slice(0, -2));

    res.json({
      events,
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

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const [events] = await db.query(
      `SELECT e.*, c.name AS category_name, 
       u.name AS organizer_name, u.email AS organizer_email,
       COUNT(DISTINCT b.booking_id) AS bookings_count,
       COUNT(DISTINCT s.seat_id) AS total_seats,
       COUNT(DISTINCT CASE WHEN s.is_booked THEN s.seat_id END) AS booked_seats
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.category_id
       LEFT JOIN users u ON e.created_by = u.user_id
       LEFT JOIN seats s ON e.event_id = s.event_id
       LEFT JOIN bookings b ON e.event_id = b.event_id
       WHERE e.event_id = ?
       GROUP BY e.event_id`,
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get event images
    const [images] = await db.query(
      "SELECT image_url, is_primary FROM event_images WHERE event_id = ? ORDER BY display_order",
      [req.params.id]
    );

    res.json({
      ...events[0],
      images,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer/Admin)
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      short_description,
      location,
      venue_details,
      date,
      time,
      end_date,
      end_time,
      category_id,
      total_seats,
      price,
      image_url,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !location ||
      !date ||
      !time ||
      !total_seats ||
      !price
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if category exists
    if (category_id) {
      const [categories] = await db.query(
        "SELECT category_id FROM categories WHERE category_id = ?",
        [category_id]
      );

      if (categories.length === 0) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    // Insert event
    const [result] = await db.query(
      `INSERT INTO events 
       (title, description, short_description, location, venue_details, 
        date, time, end_date, end_time, category_id, total_seats, 
        available_seats, price, created_by, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        short_description || null,
        location,
        venue_details || null,
        date,
        time,
        end_date || null,
        end_time || null,
        category_id || null,
        total_seats,
        total_seats, // Initially all seats available
        price,
        req.user.id,
        image_url || null,
      ]
    );

    res.status(201).json({
      eventId: result.insertId,
      message: "Event created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
exports.updateEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const updates = req.body;

    // Check if event exists and belongs to user (unless admin)
    const [events] = await db.query(
      "SELECT created_by FROM events WHERE event_id = ?",
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (events[0].created_by !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this event" });
    }

    // Build update query dynamically
    const allowedFields = [
      "title",
      "description",
      "short_description",
      "location",
      "venue_details",
      "date",
      "time",
      "end_date",
      "end_time",
      "category_id",
      "price",
      "image_url",
    ];

    const fieldsToUpdate = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        fieldsToUpdate[field] = updates[field];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Perform update
    const setClause = Object.keys(fieldsToUpdate)
      .map((field) => `${field} = ?`)
      .join(", ");

    const values = Object.values(fieldsToUpdate);
    values.push(eventId);

    await db.query(`UPDATE events SET ${setClause} WHERE event_id = ?`, values);

    res.json({ message: "Event updated successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    // Check if event exists and belongs to user (unless admin)
    const [events] = await db.query(
      "SELECT created_by FROM events WHERE event_id = ?",
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (events[0].created_by !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }

    // Check if there are any bookings
    const [bookings] = await db.query(
      "SELECT booking_id FROM bookings WHERE event_id = ?",
      [eventId]
    );

    if (bookings.length > 0) {
      return res.status(400).json({
        message: "Cannot delete event with existing bookings. Cancel instead.",
      });
    }

    // Delete event
    await db.query("DELETE FROM events WHERE event_id = ?", [eventId]);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event seats
// @route   GET /api/events/:id/seats
// @access  Public
exports.getEventSeats = async (req, res, next) => {
  try {
    const [seats] = await db.query(
      `SELECT s.seat_id, s.seat_number, s.seat_type, s.price_multiplier, s.is_booked,
       e.price AS base_price,
       ROUND(e.price * s.price_multiplier, 2) AS final_price
       FROM seats s
       JOIN events e ON s.event_id = e.event_id
       WHERE s.event_id = ?
       ORDER BY s.seat_number`,
      [req.params.id]
    );

    if (seats.length === 0) {
      return res.status(404).json({ message: "No seats found for this event" });
    }

    res.json(seats);
  } catch (error) {
    next(error);
  }
};

// @desc    Setup seat layout for event
// @route   POST /api/events/:id/seats
// @access  Private (Organizer/Admin)
exports.setupSeats = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { seats } = req.body;

    if (!Array.isArray(seats)) {
      return res.status(400).json({ message: "Seats must be an array" });
    }

    // Check if event exists and belongs to user (unless admin)
    const [events] = await db.query(
      "SELECT created_by, total_seats FROM events WHERE event_id = ?",
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (events[0].created_by !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this event" });
    }

    // Check if seats already exist
    const [existingSeats] = await db.query(
      "SELECT seat_id FROM seats WHERE event_id = ?",
      [eventId]
    );

    if (existingSeats.length > 0) {
      return res.status(400).json({
        message: "Seats already configured for this event",
      });
    }

    // Check if seat count matches event total_seats
    if (seats.length !== events[0].total_seats) {
      return res.status(400).json({
        message: `Number of seats (${seats.length}) doesn't match event total (${events[0].total_seats})`,
      });
    }

    // Validate seats
    const seatNumbers = new Set();
    for (const seat of seats) {
      if (!seat.seat_number || !seat.seat_type) {
        return res.status(400).json({
          message: "Each seat must have seat_number and seat_type",
        });
      }

      if (seatNumbers.has(seat.seat_number)) {
        return res.status(400).json({
          message: `Duplicate seat number: ${seat.seat_number}`,
        });
      }

      seatNumbers.add(seat.seat_number);
    }

    // Insert seats in transaction
    await db.query("START TRANSACTION");

    try {
      for (const seat of seats) {
        await db.query(
          `INSERT INTO seats 
           (event_id, seat_number, seat_type, price_multiplier)
           VALUES (?, ?, ?, ?)`,
          [
            eventId,
            seat.seat_number,
            seat.seat_type,
            seat.price_multiplier || 1.0,
          ]
        );
      }

      await db.query("COMMIT");
      res.status(201).json({ message: "Seats configured successfully" });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
