import express from "express";
import EventController from "../controllers/eventController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateEventData } from "../middlewares/eventValidation.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/", EventController.getAllEvents);
router.get("/:id/seats", EventController.getEventSeats);
router.get("/:id", EventController.getEvent);

// Protected routes
router.use(protect);
router.post(
  "/",
  validateEventData,
  upload.single("image"),
  EventController.createEvent
);
router.put(
  "/:id",
  validateEventData,
  upload.single("image"),
  EventController.updateEvent
);
router.delete("/:id", EventController.deleteEvent);

// Event seats (protected)
router.post("/:id/seats", EventController.addSeats);

// Event images
router.post(
  "/:id/images",
  upload.single("image"),
  EventController.addEventImage
);

export default router;
