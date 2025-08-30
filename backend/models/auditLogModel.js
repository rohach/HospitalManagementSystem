const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Billing",
    required: true,
  },
  userId: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
