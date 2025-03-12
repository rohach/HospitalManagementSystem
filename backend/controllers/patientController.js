const Patient = require("../models/patientModel");

// Register a Patient
exports.registerPatient = async (req, res) => {
  try {
    const {
      patientName,
      patientCaste,
      age,
      gender,
      contact,
      status,
      ward,
      doctors,
    } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ contact });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient with this contact number already exists!",
      });
    }

    // Create a new patient
    const newPatient = new Patient({
      patientName,
      patientCaste,
      age,
      gender,
      contact,
      status,
      ward,
      doctors,
    });

    await newPatient.save();

    const populatedPatient = await Patient.findById(newPatient._id)
      .populate("ward")
      .populate("doctors");

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully!",
      patient: populatedPatient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get all Patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();

    if (patients) {
      res.status(200).json({
        success: true,
        message: "Patients Retrieved successfully!",
        patients: patients,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Sorry, no patient details found!",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sorry, no patient details found!",
      error: error.message,
    });
  }
};

// Get Single Patient
exports.getSinglePatient = async (req, res) => {
  try {
    const patientId = req.params.id;

    const patientDetail = await Patient.findById(patientId);

    if (!patientDetail) {
      return res.status(404).json({
        success: false,
        message: "Patient not found!",
      });
    }

    res.status(200).json({
      success: true,
      patientDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server encountered a problem!",
      error: error.message,
    });
  }
};

// Delete Single Patient
exports.deletePatient = async (req, res) => {
  try {
    const { id: patientId } = req.params;

    // Check if patient exists before deleting
    const patientDetail = await Patient.findById(patientId);
    if (!patientDetail) {
      return res.status(404).json({
        success: false,
        message: "Patient not found!",
      });
    }

    // Delete the patient
    await Patient.findByIdAndDelete(patientId);

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server encountered a problem!",
      error: error.message,
    });
  }
};

// Update Single Patient
exports.updatePatient = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const updateData = req.body;

    // Check if patient exists
    const patientDetail = await Patient.findById(patientId);
    if (!patientDetail) {
      return res.status(404).json({
        success: false,
        message: "Patient not found!",
      });
    }

    // Update patient details
    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Patient updated successfully!",
      patient: updatedPatient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server encountered a problem!",
      error: error.message,
    });
  }
};
