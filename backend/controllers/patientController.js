const Patient = require("../models/patientModel");
const Doctor = require("../models/doctorModel"); // Import Doctor model
const Ward = require("../models/wardModel");
const fs = require("fs"); // To handle file deletion when updating or deleting patients
const upload = require("../middleware/multer"); // Import multer middleware

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
      doctors, // Ensure doctors is passed as an array of doctor IDs
    } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ contact });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient with this contact number already exists!",
      });
    }

    // If there's an image uploaded, handle file saving
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path; // Save the file path in the DB
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
      doctors, // Add the doctors to the patient object (must be an array of doctor ObjectIds)
      image: imageUrl, // Save image path in DB
    });

    // Save the patient to the database
    await newPatient.save();

    // After saving the patient, increment the occupiedBeds count of the ward and add patient to ward's patients array
    const updatedWard = await Ward.findByIdAndUpdate(
      ward,
      {
        $inc: { occupiedBeds: 1 }, // Increment the occupiedBeds by 1
        $push: { patients: newPatient._id }, // Push the new patient's ID into the patients array
      },
      { new: true }
    ).populate("patients");

    // Update each doctor associated with the patient to include the patient's ID in their list of patients
    if (doctors && doctors.length > 0) {
      await Doctor.updateMany(
        { _id: { $in: doctors } }, // Find doctors whose IDs are in the doctors array
        { $push: { patients: newPatient._id } } // Add the patient's ID to the doctor's patients array
      );
    }

    // Populate patient with ward and doctor details
    const populatedPatient = await Patient.findById(newPatient._id)
      .populate("ward")
      .populate("doctors");

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully!",
      patient: populatedPatient,
      ward: updatedWard, // Return the updated ward with the new patient included
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

    // Find the patient first
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found!",
      });
    }

    // Update the Ward to remove the patient from its patients array
    await Ward.updateMany(
      { patients: patientId }, // Find wards that have this patient
      { $pull: { patients: patientId } } // Remove patient from the ward's patients array
    );

    // Now delete the patient from the Patient collection
    await Patient.findByIdAndDelete(patientId);

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update Single Patient
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

    // If a new image is uploaded, update the image field and delete old image
    if (req.file) {
      // Delete old image file if it exists
      if (patientDetail.image) {
        fs.unlinkSync(patientDetail.image);
      }
      updateData.image = req.file.path; // Save new image path
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({ path: "ward", select: "wardName _id" })
      .populate("doctors");

    res.status(200).json({
      success: true,
      message: "Patient updated successfully!",
      patient: updatedPatient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
