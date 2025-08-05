const express = require("express");
const router = express.Router();
const {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

// Get all notifications for a patient
router.get("/:patientId", getAllNotifications);

// Mark a specific notification as read
router.put("/mark-as-read/:id", markAsRead);

// Mark all notifications as read for a patient
router.put("/mark-all-as-read/:patientId", markAllAsRead);

module.exports = router;
