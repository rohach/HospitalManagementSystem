const mongoose = require("mongoose");
const Billing = require("../models/billingModel");
const Invoice = require("../models/invoiceModel");
const AuditLog = require("../models/auditLogModel");

// At the top of billingController.js, below your imports:

// Service function for AI/chat to fetch bills without res
exports.fetchPatientBillsForAI = async (patientId) => {
  const bills = await Billing.find({ patient: patientId });
  return bills;
};

// Helper to generate invoice number
function generateInvoiceNumber() {
  return "INV-" + Date.now();
}

// ✅ Create a new bill
exports.createBill = async (req, res) => {
  try {
    const { patient, items } = req.body;

    if (!patient || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Patient and items are required",
      });
    }

    let totalAmount = 0;
    const processedItems = items.map((item) => {
      const totalPrice = item.quantity * item.unitPrice;
      totalAmount += totalPrice;
      return { ...item, totalPrice };
    });

    const bill = new Billing({
      patient: new mongoose.Types.ObjectId(patient),
      items: processedItems,
      totalAmount,
      balance: totalAmount,
      paidAmount: 0,
      status: "unpaid",
    });

    const savedBill = await bill.save();

    // Create invoice
    const invoice = new Invoice({
      bill: savedBill._id,
      invoiceNumber: generateInvoiceNumber(),
      amount: totalAmount,
      status: "unpaid",
    });
    await invoice.save();

    // Create audit log
    const auditLog = new AuditLog({
      action: "CREATE_BILL",
      billId: savedBill._id,
      details: `Bill created with total amount ${totalAmount}`,
    });
    await auditLog.save();

    res.status(201).json({
      success: true,
      message: "Bill and invoice created successfully",
      bill: savedBill,
      invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Admin: Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Billing.find().populate("patient", "name email");
    res.status(200).json({
      success: true,
      message: "All bills retrieved successfully",
      bills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Patient: Get their own bills
exports.getPatientBills = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid patient ID" });
    }

    const bills = await Billing.find({ patient: patientId }).populate(
      "patient",
      "name email"
    );
    res.status(200).json({
      success: true,
      message: "Patient bills retrieved successfully",
      bills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Doctor: Get bills for their patients
exports.getDoctorBills = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    // Assuming Billing model does not have doctor field directly
    // If appointments link patient-doctor, you need to query patients first
    // For now, we assume doctorId is embedded in bill (modify if needed)
    const bills = await Billing.find({ doctor: doctorId }).populate(
      "patient",
      "name email"
    );
    res.status(200).json({
      success: true,
      message: "Doctor's patients bills retrieved successfully",
      bills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Add Payment
exports.addPayment = async (req, res) => {
  try {
    const billId = req.params.id;
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment amount" });
    }
    if (!method) {
      return res
        .status(400)
        .json({ success: false, message: "Payment method is required" });
    }

    const bill = await Billing.findById(billId);
    if (!bill)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });

    if (bill.status === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Bill is already fully paid" });
    }

    if (amount > bill.balance) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining balance of ${bill.balance}`,
      });
    }

    bill.paidAmount += amount;
    bill.balance = bill.totalAmount - bill.paidAmount;
    bill.status = bill.balance <= 0 ? "paid" : "partial";

    bill.auditLogs.push({
      action: "payment_added",
      amount,
      method,
      date: new Date(),
    });

    await bill.save();
    res
      .status(200)
      .json({ success: true, message: "Payment added successfully", bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Invoice
exports.getInvoiceByBill = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ bill: req.params.billId });
    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Audit Logs
exports.getAuditLogsByBill = async (req, res) => {
  try {
    const logs = await AuditLog.find({ billId: req.params.billId }).sort({
      timestamp: -1,
    });
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
