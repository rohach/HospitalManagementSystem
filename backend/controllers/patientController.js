const Patient = require("../models/patientModel");
const Doctor = require("../models/doctorModel"); // Import Doctor model
const Ward = require("../models/wardModel");
const fs = require("fs"); // To handle file deletion when updating or deleting patients
const upload = require("../middleware/multer"); // Import multer middleware
const TreatmentRecord = require("../models/treatmentRecordModel");
const mongoose = require("mongoose");

// Register a Patient
exports.registerPatient = async (req, res) => {
  try {
    let {
      patientName,
      patientCaste,
      age,
      gender,
      contact,
      status,
      ward,
      doctors, // Array of doctor IDs or single doctor ID
    } = req.body;

    // Auto-wrap doctors into an array if it's a single string
    if (doctors && !Array.isArray(doctors)) {
      if (typeof doctors === "string") {
        doctors = [doctors];
      } else {
        return res.status(400).json({
          success: false,
          message: "'doctors' field must be an array or a valid string!",
        });
      }
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ contact });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient with this contact number already exists!",
      });
    }

    // Validate doctor IDs
    if (
      doctors &&
      doctors.some((doctorId) => !mongoose.Types.ObjectId.isValid(doctorId))
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more doctor IDs are invalid!",
      });
    }

    // Handle patient image upload
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path;
    }

    // Create new patient instance
    const newPatient = new Patient({
      patientName,
      patientCaste,
      age,
      gender,
      contact,
      status,
      ward,
      doctors, // Attach doctors to the patient
      image: imageUrl,
    });

    // Save the patient
    await newPatient.save();

    // Update the ward
    const updatedWard = await Ward.findByIdAndUpdate(
      ward,
      {
        $inc: { occupiedBeds: 1 },
        $push: { patients: newPatient._id },
      },
      { new: true }
    ).populate("patients");

    // Update the doctors' treatedPatients array to include the new patient
    if (doctors && doctors.length > 0) {
      await Doctor.updateMany(
        { _id: { $in: doctors } },
        { $push: { treatedPatients: newPatient._id } }
      );
    }

    // Create a treatment record for the patient
    const newTreatmentRecord = new TreatmentRecord({
      patientId: newPatient._id,
      doctorId: doctors?.[0], // Assign first doctor as primary (if exists)
      wardId: ward,
      treatmentDetails: "Initial treatment details for patient",
      admissionDate: new Date(),
    });

    // Save the treatment record
    await newTreatmentRecord.save();

    // Populate patient with ward and doctors details
    const populatedPatient = await Patient.findById(newPatient._id)
      .populate("ward")
      .populate("doctors");

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Patient registered successfully!",
      patient: populatedPatient,
      ward: updatedWard, // Return updated ward info
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
    const patients = await Patient.find()
      .populate({ path: "ward", select: "wardName _id" })
      .populate("doctors");

    return res.status(200).json({
      success: true,
      message:
        patients.length > 0
          ? "Patients retrieved successfully!"
          : "No patient details found!",
      patients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving patient details!",
      error: error.message,
    });
  }
};

// Get Single Patient
exports.getSinglePatient = async (req, res) => {
  try {
    const patientId = req.params.id;

    const patientDetail = await Patient.findById(patientId)
      .populate({ path: "ward", select: "wardName _id" })
      .populate("doctors");

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
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete Patient
exports.deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found!",
      });
    }

    // Update Ward
    await Ward.updateMany(
      { patients: patientId },
      { $pull: { patients: patientId } }
    );

    // Delete related treatment records
    await TreatmentRecord.deleteMany({ patientId: patientId });

    // Delete patient
    await Patient.findByIdAndDelete(patientId);

    res.status(200).json({
      success: true,
      message: "Patient and their treatment records deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update Patient
// Update Patient
exports.updatePatient = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const updateData = req.body;

    const patientDetail = await Patient.findById(patientId);
    if (!patientDetail) {
      return res.status(404).json({
        success: false,
        message: "Patient not found!",
      });
    }

    if (updateData.contact) {
      delete updateData.contact; // Do not allow contact update
    }

    if (updateData.doctors && !Array.isArray(updateData.doctors)) {
      if (typeof updateData.doctors === "string") {
        updateData.doctors = [updateData.doctors];
      } else {
        return res.status(400).json({
          success: false,
          message: "'doctors' field must be an array or valid string!",
        });
      }
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({ path: "ward", select: "wardName _id" })
      .populate("doctors");

    // Update related Treatment Records
    await TreatmentRecord.updateMany(
      { patientId: patientId },
      {
        $set: {
          doctorId: updateData.doctors?.[0] || patientDetail.doctors[0],
          wardId: updateData.ward || patientDetail.ward,
          treatmentDetails: "Updated due to patient profile change.",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Patient and related treatment records updated successfully!",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
