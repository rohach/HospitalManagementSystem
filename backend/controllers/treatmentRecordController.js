const TreatmentRecord = require("../models/treatmentRecordModel");
const Patient = require("../models/patientModel");
const Doctor = require("../models/doctorModel");
const Ward = require("../models/wardModel");
const mongoose = require("mongoose");

// Add a new treatment record
exports.addTreatmentRecord = async (req, res) => {
  try {
    const { patientId, doctorId, wardId, treatmentDetails, notes } = req.body;

    // Check if the patient and doctor exist
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found!" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found!" });
    }

    // Check if the ward exists if provided
    let ward = null;
    if (wardId) {
      ward = await Ward.findById(wardId);
      if (!ward) {
        return res
          .status(404)
          .json({ success: false, message: "Ward not found!" });
      }
    }

    // Create a new treatment record
    const newTreatmentRecord = new TreatmentRecord({
      patientId,
      doctorId,
      wardId: ward ? wardId : null,
      treatmentDetails,
      notes,
    });

    await newTreatmentRecord.save();

    return res.status(201).json({
      success: true,
      message: "Treatment Record Added Successfully!",
      treatmentRecord: newTreatmentRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get all treatment records
exports.getAllTreatmentRecords = async (req, res) => {
  try {
    const treatmentRecords = await TreatmentRecord.find().populate(
      "patientId doctorId wardId"
    );

    if (treatmentRecords.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No treatment records found.",
        treatmentRecords: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Treatment records retrieved successfully!",
      treatmentRecords,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get a single treatment record by ID
exports.getSingleTreatmentRecord = async (req, res) => {
  try {
    const treatmentRecord = await TreatmentRecord.findById(
      req.params.id
    ).populate("patientId doctorId wardId");

    if (treatmentRecord) {
      return res.status(200).json({
        success: true,
        treatmentRecord,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Treatment Record not found!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update a treatment record
exports.updateTreatmentRecord = async (req, res) => {
  try {
    const { patientId, doctorId, wardId, treatmentDetails, notes } = req.body;
    const { id: treatmentRecordId } = req.params;

    // Check if the treatment record exists
    const treatmentRecord = await TreatmentRecord.findById(treatmentRecordId);
    if (!treatmentRecord) {
      return res.status(404).json({
        success: false,
        message: "Treatment Record not found!",
      });
    }

    // Update the treatment record
    treatmentRecord.patientId = patientId || treatmentRecord.patientId;
    treatmentRecord.doctorId = doctorId || treatmentRecord.doctorId;
    treatmentRecord.wardId = wardId || treatmentRecord.wardId;
    treatmentRecord.treatmentDetails =
      treatmentDetails || treatmentRecord.treatmentDetails;
    treatmentRecord.notes = notes || treatmentRecord.notes;

    await treatmentRecord.save();

    return res.status(200).json({
      success: true,
      message: "Treatment Record Updated Successfully!",
      treatmentRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete a treatment record
exports.deleteTreatmentRecord = async (req, res) => {
  try {
    const treatmentRecord = await TreatmentRecord.findById(req.params.id);
    if (!treatmentRecord) {
      return res.status(404).json({
        success: false,
        message: "Treatment Record not found!",
      });
    }

    await TreatmentRecord.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Treatment Record deleted successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
// Get all treatment records for a specific patient
exports.getTreatmentRecordsByPatientId = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const treatmentRecords = await TreatmentRecord.find({
      patientId: patientId, // Let Mongoose cast string to ObjectId
    }).populate("patientId doctorId wardId");

    return res.status(200).json({
      success: true,
      message:
        treatmentRecords.length > 0
          ? `Treatment Records for patient ${patientId} retrieved successfully!`
          : "No Treatment Records found for this patient.",
      treatmentRecords,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
