const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");

// Create Bill
router.post("/", billingController.createBill);

// Admin: Get all bills
router.get("/admin/all", billingController.getAllBills);

// Patient: Get their bills
router.get("/patient/:patientId", billingController.getPatientBills);

// Doctor: Get bills for their patients
router.get("/doctor/:doctorId", billingController.getDoctorBills);

// Add payment
router.put("/payment/:id", billingController.addPayment);

// Invoice
router.get("/invoice/:billId", billingController.getInvoiceByBill);

// Audit logs
router.get("/auditlogs/:billId", billingController.getAuditLogsByBill);

module.exports = router;
