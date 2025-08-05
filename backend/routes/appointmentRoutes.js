// routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Create appointment
router.post("/createAppointment", appointmentController.createAppointment);

// Get appointments (optional query: userId & role)
router.get("/appointments", appointmentController.getAppointments);

// Get single appointment by ID
router.get("/:id", appointmentController.getSingleAppointment);

// Update appointment status
router.put("/:id/status", appointmentController.updateAppointmentStatus);

// Delete appointment
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;
