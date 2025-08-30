const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markUserNotificationAsRead,
  markAllUserNotificationsAsRead,
  getAllAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// ===================== PATIENT ===================== //
router.get("/patient/:patientId", getUserNotifications);
router.put("/patient/mark-as-read/:id", markUserNotificationAsRead);
router.put(
  "/patient/mark-all-as-read/:patientId",
  markAllUserNotificationsAsRead
);

// ===================== DOCTOR ===================== //
router.get("/doctor/:doctorId", getUserNotifications);
router.put("/doctor/mark-as-read/:id", markUserNotificationAsRead);
router.put(
  "/doctor/mark-all-as-read/:doctorId",
  markAllUserNotificationsAsRead
);

// ===================== ADMIN ===================== //
router.get("/admin", getAllAdminNotifications);
router.put("/admin/mark-as-read/:id", markAdminNotificationAsRead);
router.put("/admin/mark-all-as-read", markAllAdminNotificationsAsRead);
router.delete("/admin/:id", deleteNotification);

module.exports = router;
