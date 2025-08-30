const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", // Can also point to admin or doctor if needed
      required: false, // Make this optional for admin/global notifications
    },
    role: {
      type: String,
      enum: ["patient", "admin", "doctor"],
      default: "patient", // Determines who should see the notification
    },
    type: {
      type: String,
      required: true, // e.g., "appointment", "payment", "system-alert"
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
