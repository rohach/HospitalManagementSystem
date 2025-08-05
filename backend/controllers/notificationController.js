const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");

// Get all notifications for a user (patient)
exports.getAllNotifications = async (req, res) => {
  try {
    const patientId = req.params.patientId; // from URL param

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Missing patientId parameter",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(patientId);
    const notifications = await Notification.find({ user: userObjectId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
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

// Mark a single notification as read (by notification ID)
exports.markAsRead = async (req, res) => {
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

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Mark all notifications as read for a patient (by patientId in URL)
exports.markAllAsRead = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    if (!patientId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing patientId parameter" });
    }

    const userObjectId = new mongoose.Types.ObjectId(patientId);

    await Notification.updateMany(
      { user: userObjectId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
