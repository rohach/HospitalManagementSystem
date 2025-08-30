const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const Notification = require("../models/notificationModel");

// At the top of appointmentController.js, below your imports:

// Service function for AI/chat to fetch appointments without res
exports.fetchAppointmentsForAI = async (userId, role) => {
  let filter = {};
  if (userId && role) {
    if (role === "doctor") filter.doctor = userId;
    else if (role === "patient") filter.patient = userId;
  }

  const appointments = await Appointment.find(filter)
    .populate("patient", "patientName email")
    .populate("doctor", "name specialty email")
    .sort({ appointmentDateTime: 1 });

  return appointments;
};

// Create new Appointment (Patient books appointment)
exports.createAppointment = async (req, res) => {
  try {
    const { patient, doctor, appointmentDateTime, notes } = req.body;

    // Check doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found!" });
    }

    // Check patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found!" });
    }

    // Validate appointmentDateTime, fallback to current date/time if invalid or missing
    let appointmentDate = appointmentDateTime
      ? new Date(appointmentDateTime)
      : new Date();
    if (isNaN(appointmentDate.valueOf())) {
      appointmentDate = new Date();
    }

    // Check doctor availability at the requested time
    const conflictingAppointment = await Appointment.findOne({
      doctor,
      appointmentDateTime: appointmentDate,
      status: { $in: ["pending", "approved"] },
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available at the requested time.",
      });
    }

    const newAppointment = new Appointment({
      patient,
      doctor,
      appointmentDateTime: appointmentDate,
      notes,
    });

    await newAppointment.save();

    // Use 'patient' here instead of 'patientId'
    await Notification.create({
      user: patient,
      type: "appointment_created",
      message: `Your appointment with Dr. ${
        doctorExists.name
      } is booked for ${newAppointment.appointmentDateTime.toLocaleString()}.`,
    });

    res.status(201).json({
      success: true,
      message: "Appointment created successfully!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all appointments (optionally by patient or doctor)
exports.getAppointments = async (req, res) => {
  try {
    const { userId, role } = req.query;

    let filter = {};
    if (userId && role) {
      if (role === "doctor") filter.doctor = userId;
      else if (role === "patient") filter.patient = userId;
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "patientName email")
      .populate("doctor", "name specialty email")
      .sort({ appointmentDateTime: 1 });

    res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      appointments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get single appointment by ID
exports.getSingleAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId)
      .populate("patient", "patientName email")
      .populate("doctor", "name specialty email");

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update appointment status (approve, reject, reschedule)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status, newDateTime, notes } = req.body;

    if (!["pending", "approved", "rejected", "rescheduled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    if (status === "rescheduled" && newDateTime) {
      // Check if doctor available for newDateTime
      const conflict = await Appointment.findOne({
        doctor: appointment.doctor,
        appointmentDateTime: new Date(newDateTime),
        status: { $in: ["pending", "approved"] },
        _id: { $ne: appointmentId },
      });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: "Doctor is not available at the new requested time.",
        });
      }
      appointment.appointmentDateTime = new Date(newDateTime);
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;

    await appointment.save();

    // Populate doctor and patient before sending response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "patientName email")
      .populate("doctor", "name specialty email");

    await Notification.create({
      user: appointment.patient,
      type: "appointment_updated",
      message: `Your appointment has been ${status}.`,
    });

    res.status(200).json({
      success: true,
      message: "Appointment updated",
      appointment: populatedAppointment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    res
      .status(200)
      .json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
