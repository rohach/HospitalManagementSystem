const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action: String, // e.g. 'payment_added'
  amount: Number,
  method: String, // payment method: cash, card, online
  date: { type: Date, default: Date.now },
});

const itemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
  treatmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Treatment",
    required: false,
  },
});

const billingSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  items: [itemSchema],
  totalAmount: Number,
  paidAmount: Number,
  balance: Number,
  status: {
    type: String,
    enum: ["unpaid", "partial", "paid"],
    default: "unpaid",
  },
  auditLogs: [auditLogSchema], // <-- Add this field
});

module.exports = mongoose.model("Billing", billingSchema);
