const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Billing",
    required: true,
  },
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["unpaid", "partial", "paid"],
    default: "unpaid",
  },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
