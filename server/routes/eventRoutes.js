const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventSeats,
  setupSeats,
} = require("../controllers/eventController");
const {
  authenticate,
  authorize,
  roles,
} = require("../middlewares/authMiddleware");

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEvent);
router.get("/:id/seats", getEventSeats);

// Protected routes - Organizer/Admin only
router.use(authenticate);
router.use(authorize(roles.organizer, roles.admin));

router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.post("/:id/seats", setupSeats);

module.exports = router;
