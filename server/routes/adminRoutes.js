const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUserStatus,
  getSystemStats,
} = require("../controllers/adminController");
const {
  authenticate,
  authorize,
  roles,
} = require("../middlewares/authMiddleware");

// Admin routes only
router.use(authenticate);
router.use(authorize(roles.admin));

router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.get("/stats", getSystemStats);

module.exports = router;
