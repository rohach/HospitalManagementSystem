const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");

// ===================== USER (Patient/Doctor) ===================== //
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.patientId || req.params.doctorId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId parameter",
      });
    }

    const notifications = await Notification.find({
      user: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User notifications retrieved successfully",
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Mark single notification as read (Patient/Doctor)
exports.markUserNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Notification marked as read",
        notification,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Mark all notifications as read (Patient/Doctor)
exports.markAllUserNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.params.patientId || req.params.doctorId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userId parameter" });
    }

    await Notification.updateMany(
      { user: new mongoose.Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );

    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ===================== ADMIN ===================== //
exports.getAllAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Admin notifications retrieved successfully",
      notifications,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Mark single admin notification as read
exports.markAdminNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Admin notification marked as read",
        notification,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Mark all admin notifications as read
exports.markAllAdminNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );
    res
      .status(200)
      .json({
        success: true,
        message: "All admin notifications marked as read",
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete notification (admin only)
exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const deleted = await Notification.findByIdAndDelete(notificationId);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
