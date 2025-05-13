const db = require("../config/db");

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filtering
    const { role, is_active } = req.query;
    let whereClauses = [];
    let params = [];

    if (role) {
      whereClauses.push("role = ?");
      params.push(role);
    }

    if (is_active) {
      whereClauses.push("is_active = ?");
      params.push(is_active === "true");
    }

    let whereClause = "";
    if (whereClauses.length > 0) {
      whereClause = `WHERE ${whereClauses.join(" AND ")}`;
    }

    // Get users
    const [users] = await db.query(
      `SELECT user_id, name, email, phone, role, is_active, created_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count for pagination
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total 
       FROM users
       ${whereClause}`,
      params
    );

    res.json({
      users,
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

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const [result] = await db.query(
      `UPDATE users 
       SET is_active = ?
       WHERE user_id = ?`,
      [is_active, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `User ${is_active ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getSystemStats = async (req, res, next) => {
  try {
    // Get counts in parallel
    const [
      [{ users_count }],
      [{ events_count }],
      [{ bookings_count }],
      [{ revenue }],
    ] = await Promise.all([
      db.query("SELECT COUNT(*) AS users_count FROM users"),
      db.query("SELECT COUNT(*) AS events_count FROM events"),
      db.query(
        "SELECT COUNT(*) AS bookings_count FROM bookings WHERE status = 'confirmed'"
      ),
      db.query(
        "SELECT COALESCE(SUM(amount), 0) AS revenue FROM payments WHERE payment_status = 'captured'"
      ),
    ]);

    // Get recent activities
    const [recentBookings] = await db.query(
      `SELECT b.booking_id, b.booking_date, b.total_amount,
       u.name AS user_name, e.title AS event_title
       FROM bookings b
       JOIN users u ON b.user_id = u.user_id
       JOIN events e ON b.event_id = e.event_id
       ORDER BY b.booking_date DESC
       LIMIT 5`
    );

    res.json({
      stats: {
        users_count,
        events_count,
        bookings_count,
        revenue,
      },
      recent_bookings: recentBookings,
    });
  } catch (error) {
    next(error);
  }
};
