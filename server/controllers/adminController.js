const User = require("../models/userModel");
const Event = require("../models/eventModel");
const Booking = require("../models/bookingModel");
const Category = require("../models/categoryModel");
const AppError = require("../utils/appError");
const db = require("../config/db");

class AdminController {
  static async getAllUsers(req, res, next) {
    try {
      const [users] = await db.query(
        "SELECT user_id, name, email, phone, role, is_active, created_at FROM users"
      );

      res.status(200).json({
        status: "success",
        results: users.length,
        data: {
          users,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUser(req, res, next) {
    try {
      const [rows] = await db.query(
        "SELECT user_id, name, email, phone, role, is_active, created_at FROM users WHERE user_id = ?",
        [req.params.id]
      );

      if (!rows.length) {
        return next(new AppError("No user found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          user: rows[0],
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { role, is_active } = req.body;

      // Prevent admin from disabling their own profile
      if (req.user.user_id === parseInt(req.params.id) && is_active === false) {
        return next(new AppError("You cannot disable your own profile", 400));
      }

      // Only allow updating role and active status
      const allowedUpdates = {};
      if (typeof role !== "undefined") allowedUpdates.role = role;
      if (typeof is_active !== "undefined")
        allowedUpdates.is_active = is_active;

      // Build update query dynamically
      const fields = [];
      const values = [];
      if (allowedUpdates.role !== undefined) {
        fields.push("role = ?");
        values.push(allowedUpdates.role);
      }
      if (allowedUpdates.is_active !== undefined) {
        fields.push("is_active = ?");
        values.push(allowedUpdates.is_active);
      }
      if (fields.length === 0) {
        return next(new AppError("No valid fields to update", 400));
      }
      values.push(req.params.id);

      await db.query(
        `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`,
        values
      );

      const [rows] = await db.query(
        "SELECT user_id, name, email, phone, role, is_active, created_at FROM users WHERE user_id = ?",
        [req.params.id]
      );

      res.status(200).json({
        status: "success",
        data: {
          user: rows[0],
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllEvents(req, res, next) {
    try {
      const [events] = await db.query(
        `SELECT e.*, u.name as organizer_name, c.name as category_name 
         FROM events e
         LEFT JOIN users u ON e.organizer_id = u.user_id
         LEFT JOIN categories c ON e.category_id = c.category_id
         ORDER BY e.created_at DESC`
      );

      res.status(200).json({
        status: "success",
        results: events.length,
        data: {
          events,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async toggleEventStatus(req, res, next) {
    try {
      // Check if event exists
      const [rows] = await db.query(
        "SELECT event_id, is_active FROM events WHERE event_id = ?",
        [req.params.id]
      );

      if (!rows.length) {
        return next(new AppError("No event found with that ID", 404));
      }

      // Toggle is_active status
      await db.query("UPDATE events SET is_active = ? WHERE event_id = ?", [
        !rows[0].is_active,
        req.params.id,
      ]);

      res.status(200).json({
        status: "success",
        message: `Event ${
          !rows[0].is_active ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllBookings(req, res, next) {
    try {
      const [bookings] = await db.query(
        `SELECT b.*, e.title as event_title, u.name as user_name, u.email as user_email
         FROM bookings b
         JOIN events e ON b.event_id = e.event_id
         JOIN users u ON b.user_id = u.user_id
         ORDER BY b.booking_date DESC`
      );

      res.status(200).json({
        status: "success",
        results: bookings.length,
        data: {
          bookings,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getEventBookings(req, res, next) {
    try {
      const [bookings] = await db.query(
        `SELECT b.*, u.name as user_name, u.email as user_email
         FROM bookings b
         JOIN users u ON b.user_id = u.user_id
         WHERE b.event_id = ?
         ORDER BY b.booking_date DESC`,
        [req.params.id]
      );

      res.status(200).json({
        status: "success",
        results: bookings.length,
        data: {
          bookings,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateBookingStatus(req, res, next) {
    try {
      const { status } = req.body;
      const bookingId = req.params.id;

      // Validate status
      const validStatuses = ["pending", "confirmed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return next(new AppError("Invalid booking status", 400));
      }

      // Start transaction
      await db.query("START TRANSACTION");

      try {
        // Get booking details with event info and seat count
        const [bookingDetails] = await db.query(
          `SELECT b.*, e.available_seats, e.total_seats,
           (SELECT COUNT(*) FROM booked_seats WHERE booking_id = ?) as seat_count
           FROM bookings b
           JOIN events e ON b.event_id = e.event_id
           WHERE b.booking_id = ?`,
          [bookingId, bookingId]
        );

        if (!bookingDetails.length) {
          await db.query("ROLLBACK");
          return next(new AppError("No booking found with that ID", 404));
        }

        const booking = bookingDetails[0];
        const { available_seats, total_seats, seat_count } = booking;

        // Handle seat updates based on status change
        if (status === "cancelled" && booking.status !== "cancelled") {
          // Verify that cancelling won't violate the total seats constraint
          if (available_seats + seat_count > total_seats) {
            throw new Error(
              "Cannot cancel booking: would exceed total seats limit"
            );
          }

          // Update available seats
          await db.query(
            "UPDATE events SET available_seats = available_seats + ? WHERE event_id = ?",
            [seat_count, booking.event_id]
          );

          // Update seat status
          await db.query(
            `UPDATE seats s
             JOIN booked_seats bs ON s.seat_id = bs.seat_id
             SET s.is_booked = FALSE
             WHERE bs.booking_id = ?`,
            [bookingId]
          );

          // Delete payment record
          await db.query("DELETE FROM payments WHERE booking_id = ?", [
            bookingId,
          ]);
        } else if (status === "confirmed" && booking.status !== "confirmed") {
          // Check if we have enough available seats
          if (booking.status === "cancelled" && available_seats < seat_count) {
            throw new Error(
              "Not enough available seats to confirm this booking"
            );
          }

          // Only update seats if coming from cancelled status
          if (booking.status === "cancelled") {
            await db.query(
              "UPDATE events SET available_seats = available_seats - ? WHERE event_id = ?",
              [seat_count, booking.event_id]
            );

            await db.query(
              `UPDATE seats s
               JOIN booked_seats bs ON s.seat_id = bs.seat_id
               SET s.is_booked = TRUE
               WHERE bs.booking_id = ?`,
              [bookingId]
            );
          }
        }

        // Update booking status
        await db.query("UPDATE bookings SET status = ? WHERE booking_id = ?", [
          status,
          bookingId,
        ]);

        // Commit transaction
        await db.query("COMMIT");

        // Get updated booking
        const [updatedBooking] = await db.query(
          `SELECT b.*, e.title as event_title, u.name as user_name, u.email as user_email
           FROM bookings b
           JOIN events e ON b.event_id = e.event_id
           JOIN users u ON b.user_id = u.user_id
           WHERE b.booking_id = ?`,
          [bookingId]
        );

        res.status(200).json({
          status: "success",
          data: {
            booking: updatedBooking[0],
          },
        });
      } catch (err) {
        await db.query("ROLLBACK");
        console.error("Error in status update transaction:", err);
        return next(
          new AppError(err.message || "Failed to update booking status", 400)
        );
      }
    } catch (err) {
      next(err);
    }
  }

  static async getDashboardStats(req, res, next) {
    try {
      // Get total users
      const [usersResult] = await db.query(
        "SELECT COUNT(*) as count FROM users"
      );

      // Get total events
      const [eventsResult] = await db.query(
        "SELECT COUNT(*) as count FROM events"
      );

      // Get total bookings
      const [bookingsResult] = await db.query(
        "SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'"
      );

      // Get total revenue with proper NULL handling and status check
      const [revenueResult] = await db.query(
        `SELECT COALESCE(SUM(b.total_amount), 0) as total 
         FROM bookings b
         WHERE b.status = 'confirmed'`
      );

      // Get recent bookings - only show confirmed bookings
      const [recentBookings] = await db.query(
        `SELECT b.*, e.title as event_title, u.name as user_name 
         FROM bookings b
         JOIN events e ON b.event_id = e.event_id
         JOIN users u ON b.user_id = u.user_id
         WHERE b.status = 'confirmed'
         ORDER BY b.created_at DESC
         LIMIT 5`
      );

      res.status(200).json({
        status: "success",
        data: {
          stats: {
            users: usersResult[0].count,
            events: eventsResult[0].count,
            bookings: bookingsResult[0].count,
            revenue: revenueResult[0].total,
          },
          recentBookings,
        },
      });
    } catch (err) {
      console.error("Dashboard Error:", err);
      next(new AppError("Error fetching dashboard statistics", 500));
    }
  }

  static async createUser(req, res, next) {
    try {
      const { name, email, password, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return next(new AppError("Email already in use", 400));
      }

      // Create new user
      const userId = await User.create({ name, email, password, phone, role });
      const user = await User.findById(userId);

      // Remove password from response
      delete user.password;

      res.status(201).json({
        status: "success",
        data: {
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllCategories(req, res, next) {
    try {
      const [categories] = await db.query(
        "SELECT * FROM categories ORDER BY created_at DESC"
      );

      res.status(200).json({
        status: "success",
        data: {
          categories,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const { name, description, image_url } = req.body;

      const [result] = await db.query(
        "INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)",
        [name, description, image_url]
      );

      const [category] = await db.query(
        "SELECT * FROM categories WHERE category_id = ?",
        [result.insertId]
      );

      res.status(201).json({
        status: "success",
        data: {
          category: category[0],
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCategory(req, res, next) {
    try {
      const [category] = await db.query(
        "SELECT * FROM categories WHERE category_id = ?",
        [req.params.id]
      );

      if (!category.length) {
        return next(new AppError("No category found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          category: category[0],
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const { name, description, image_url } = req.body;

      const [result] = await db.query(
        "UPDATE categories SET name = ?, description = ?, image_url = ? WHERE category_id = ?",
        [name, description, image_url, req.params.id]
      );

      if (result.affectedRows === 0) {
        return next(new AppError("No category found with that ID", 404));
      }

      const [category] = await db.query(
        "SELECT * FROM categories WHERE category_id = ?",
        [req.params.id]
      );

      res.status(200).json({
        status: "success",
        data: {
          category: category[0],
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const [result] = await db.query(
        "DELETE FROM categories WHERE category_id = ?",
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return next(new AppError("No category found with that ID", 404));
      }

      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (err) {
      next(err);
    }
  }

  static async toggleCategoryStatus(req, res, next) {
    try {
      const [category] = await db.query(
        "SELECT category_id, is_active FROM categories WHERE category_id = ?",
        [req.params.id]
      );

      if (!category.length) {
        return next(new AppError("No category found with that ID", 404));
      }

      await db.query(
        "UPDATE categories SET is_active = ? WHERE category_id = ?",
        [!category[0].is_active, req.params.id]
      );

      res.status(200).json({
        status: "success",
        message: `Category ${
          !category[0].is_active ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getReports(req, res, next) {
    try {
      let { startDate, endDate } = req.query;

      // If dates are not provided, default to last 30 days
      if (!startDate || !endDate) {
        endDate = new Date().toISOString().split("T")[0];
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      }

      // Revenue by month
      const [revenueByMonth] = await db.query(
        `SELECT 
          DATE_FORMAT(b.booking_date, '%Y-%m') as month,
          COUNT(DISTINCT b.booking_id) as bookings,
          COALESCE(SUM(b.total_amount), 0) as revenue
        FROM bookings b
        WHERE b.status = 'confirmed'
          AND b.booking_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY DATE_FORMAT(b.booking_date, '%Y-%m')
        ORDER BY month ASC`,
        [startDate, endDate]
      );

      // Bookings by category
      const [bookingsByCategory] = await db.query(
        `SELECT 
          c.name as category,
          COUNT(DISTINCT e.event_id) as events,
          COUNT(DISTINCT b.booking_id) as bookings,
          COALESCE(SUM(b.total_amount), 0) as revenue
        FROM categories c
        LEFT JOIN events e ON c.category_id = e.category_id
        LEFT JOIN bookings b ON e.event_id = b.event_id AND b.status = 'confirmed'
          AND b.booking_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY c.category_id
        ORDER BY revenue DESC`,
        [startDate, endDate]
      );

      // Top performing events
      const [topEvents] = await db.query(
        `SELECT 
          e.event_id,
          e.title,
          COUNT(DISTINCT b.booking_id) as bookings,
          COALESCE(SUM(b.total_amount), 0) as revenue
        FROM events e
        LEFT JOIN bookings b ON e.event_id = b.event_id
        WHERE b.status = 'confirmed'
          AND b.booking_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY e.event_id
        HAVING bookings > 0
        ORDER BY revenue DESC
        LIMIT 10`,
        [startDate, endDate]
      );

      // Top organizers
      const [topOrganizers] = await db.query(
        `SELECT 
          u.user_id,
          u.name,
          COUNT(DISTINCT e.event_id) as total_events,
          COUNT(DISTINCT b.booking_id) as total_bookings,
          COALESCE(SUM(b.total_amount), 0) as total_revenue
        FROM users u
        LEFT JOIN events e ON u.user_id = e.organizer_id
        LEFT JOIN bookings b ON e.event_id = b.event_id
        WHERE u.role = 'organizer'
          AND (b.status = 'confirmed' AND b.booking_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY))
        GROUP BY u.user_id
        HAVING total_bookings > 0
        ORDER BY total_revenue DESC
        LIMIT 10`,
        [startDate, endDate]
      );

      res.status(200).json({
        status: "success",
        data: {
          revenueByMonth,
          bookingsByCategory,
          topEvents,
          topOrganizers,
        },
      });
    } catch (err) {
      console.error("Reports Error:", err);
      next(new AppError("Error fetching reports", 500));
    }
  }

  static async deleteUser(req, res, next) {
    try {
      // Prevent admin from deleting their own profile
      if (req.user.user_id === parseInt(req.params.id)) {
        return next(new AppError("You cannot delete your own profile", 400));
      }

      // Check if user exists
      const [user] = await db.query(
        "SELECT user_id, role FROM users WHERE user_id = ?",
        [req.params.id]
      );
      if (!user.length) {
        return next(new AppError("No user found with that ID", 404));
      }

      // Don't allow deleting the last admin
      if (user[0].role === "admin") {
        const [adminCount] = await db.query(
          "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
        );
        if (adminCount[0].count <= 1) {
          return next(new AppError("Cannot delete the last admin user", 400));
        }
      }

      await db.query("START TRANSACTION");
      try {
        // If user is organizer, delete all their events and related data
        if (user[0].role === "organizer") {
          // Get all event IDs for this organizer
          const [events] = await db.query(
            "SELECT event_id FROM events WHERE organizer_id = ?",
            [req.params.id]
          );
          const eventIds = events.map((e) => e.event_id);

          for (const eventId of eventIds) {
            // Delete bookings and related data for this event
            const [eventBookings] = await db.query(
              "SELECT booking_id FROM bookings WHERE event_id = ?",
              [eventId]
            );
            const bookingIds = eventBookings.map((b) => b.booking_id);

            if (bookingIds.length > 0) {
              await db.query("DELETE FROM payments WHERE booking_id IN (?)", [
                bookingIds,
              ]);
              await db.query(
                "DELETE FROM booked_seats WHERE booking_id IN (?)",
                [bookingIds]
              );
              await db.query("DELETE FROM bookings WHERE booking_id IN (?)", [
                bookingIds,
              ]);
            }

            // Delete wishlists for this event
            await db.query("DELETE FROM wishlists WHERE event_id = ?", [
              eventId,
            ]);
            // Delete event images
            await db.query("DELETE FROM event_images WHERE event_id = ?", [
              eventId,
            ]);
            // Delete seats for this event
            await db.query("DELETE FROM seats WHERE event_id = ?", [eventId]);
            // Delete the event itself
            await db.query("DELETE FROM events WHERE event_id = ?", [eventId]);
          }
        }

        // Delete all bookings/payments/booked seats for the user
        const [userBookings] = await db.query(
          "SELECT booking_id FROM bookings WHERE user_id = ?",
          [req.params.id]
        );
        const userBookingIds = userBookings.map((b) => b.booking_id);

        if (userBookingIds.length > 0) {
          await db.query("DELETE FROM payments WHERE booking_id IN (?)", [
            userBookingIds,
          ]);
          await db.query("DELETE FROM booked_seats WHERE booking_id IN (?)", [
            userBookingIds,
          ]);
          await db.query("DELETE FROM bookings WHERE booking_id IN (?)", [
            userBookingIds,
          ]);
        }

        // Delete wishlists for this user
        await db.query("DELETE FROM wishlists WHERE user_id = ?", [
          req.params.id,
        ]);
        // Delete refresh tokens for this user
        await db.query("DELETE FROM refresh_tokens WHERE user_id = ?", [
          req.params.id,
        ]);
        // Delete the user
        await db.query("DELETE FROM users WHERE user_id = ?", [req.params.id]);

        await db.query("COMMIT");
        res.status(204).json({
          status: "success",
          data: null,
        });
      } catch (err) {
        await db.query("ROLLBACK");
        next(
          new AppError(
            "Failed to delete user and related data: " + (err.message || ""),
            500
          )
        );
      }
    } catch (err) {
      next(err);
    }
  }

  static async deleteEvent(req, res, next) {
    try {
      const eventId = req.params.id;

      // Start transaction
      await db.query("START TRANSACTION");
      try {
        // Check if event exists
        const [event] = await db.query(
          "SELECT event_id FROM events WHERE event_id = ?",
          [eventId]
        );

        if (!event.length) {
          await db.query("ROLLBACK");
          return next(new AppError("No event found with that ID", 404));
        }

        // Delete related bookings and payments
        const [bookings] = await db.query(
          "SELECT booking_id FROM bookings WHERE event_id = ?",
          [eventId]
        );

        if (bookings.length > 0) {
          const bookingIds = bookings.map((b) => b.booking_id);
          await db.query("DELETE FROM payments WHERE booking_id IN (?)", [
            bookingIds,
          ]);
          await db.query("DELETE FROM booked_seats WHERE booking_id IN (?)", [
            bookingIds,
          ]);
          await db.query("DELETE FROM bookings WHERE booking_id IN (?)", [
            bookingIds,
          ]);
        }

        // Delete wishlists for this event
        await db.query("DELETE FROM wishlists WHERE event_id = ?", [eventId]);

        // Delete event images
        await db.query("DELETE FROM event_images WHERE event_id = ?", [
          eventId,
        ]);

        // Delete seats
        await db.query("DELETE FROM seats WHERE event_id = ?", [eventId]);

        // Finally delete the event
        await db.query("DELETE FROM events WHERE event_id = ?", [eventId]);

        await db.query("COMMIT");

        res.status(204).json({
          status: "success",
          data: null,
        });
      } catch (err) {
        await db.query("ROLLBACK");
        throw err;
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
