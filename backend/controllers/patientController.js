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
      email,
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
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to register a patient.",
      });
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
      email,
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

// Update Patient
exports.updatePatient = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const updateData = req.body;
    const { removeTreatedPatient, doctorId } = req.body; // Assuming `removeTreatedPatient` and `doctorId` are in the request

    const patientDetail = await Patient.findById(patientId);
    if (!patientDetail) {
      return res.status(404).json({
        success: false,
        message: "Patient not found!",
      });
    }

    // If the removeTreatedPatient flag is set and a doctorId is provided, remove the patient from the doctor's treated list
    if (removeTreatedPatient && doctorId) {
      // Remove the patient from the specified doctor's treatedPatients list
      await Doctor.findByIdAndUpdate(
        doctorId,
        { $pull: { treatedPatients: patientId } },
        { new: true }
      );

      // Also remove the doctor from the patient's treatedBy list
      await Patient.findByIdAndUpdate(patientId, {
        $pull: { treatedBy: doctorId },
      });

      return res.status(200).json({
        success: true,
        message: "Patient removed from treated list successfully!",
      });
    }

    // Don't allow contact update
    if (updateData.contact) {
      delete updateData.contact;
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

    // 🆕 Ward capacity check and transfer handling
    if (updateData.ward && updateData.ward !== String(patientDetail.ward)) {
      const newWard = await Ward.findById(updateData.ward);

      if (!newWard) {
        return res.status(400).json({
          success: false,
          message: "The selected ward does not exist!",
        });
      }

      if (newWard.occupiedBeds >= newWard.capacity) {
        return res.status(400).json({
          success: false,
          message: "Ward is full. Cannot transfer patient!",
        });
      }

      // Decrease old ward's occupiedBeds and remove patient from old ward
      await Ward.findByIdAndUpdate(patientDetail.ward, {
        $inc: { occupiedBeds: -1 },
        $pull: { patients: patientId },
      });

      // Increase new ward's occupiedBeds and add patient to new ward
      await Ward.findByIdAndUpdate(updateData.ward, {
        $inc: { occupiedBeds: 1 },
        $push: { patients: patientId },
      });
    }

    // Find the fields that have changed by comparing old and new data
    let changedFields = [];
    for (let key in updateData) {
      if (updateData[key] !== patientDetail[key]) {
        changedFields.push(key);
      }
    }

    // If no fields are updated, just return
    if (changedFields.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No changes detected for the patient.",
        patient: patientDetail,
      });
    }

    // Perform the update on the patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({ path: "ward", select: "wardName _id" })
      .populate("doctors");

    // Find the most recent treatment record created on update
    const latestTreatmentRecord = await TreatmentRecord.findOne({
      patientId: patientId,
    })
      .sort({ admissionDate: -1 }) // Sort by the most recent treatment record
      .skip(1) // Skip the first record (initial treatment record)
      .limit(1);

    if (!latestTreatmentRecord) {
      // If no record exists (means patient is being updated for the first time), create a new record
      const newTreatmentRecord = new TreatmentRecord({
        patientId: updatedPatient._id,
        doctorId: updateData.doctors?.[0] || patientDetail.doctors[0], // First doctor if exists
        wardId: updateData.ward || patientDetail.ward,
        treatmentDetails: `Patient updated. Updates in: ${changedFields.join(
          ", "
        )}`,
        admissionDate: new Date(),
      });
      await newTreatmentRecord.save();
    } else {
      // If a treatment record exists (not the initial record), update it
      latestTreatmentRecord.treatmentDetails = `Patient updated. Updates in: ${changedFields.join(
        ", "
      )}`;
      latestTreatmentRecord.admissionDate = new Date(); // Update the date to the current time
      await latestTreatmentRecord.save();
    }

    // ✅ Update treatedPatients array in Doctor model if doctors are updated
    if (updateData.doctors && updateData.doctors.length > 0) {
      await Doctor.updateMany(
        { _id: { $in: updateData.doctors } },
        { $addToSet: { treatedPatients: updatedPatient._id } }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully and treatment record updated!",
      patient: updatedPatient,
      treatmentRecord: latestTreatmentRecord, // Return updated treatment record
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

    // Create a treatment record indicating patient discharge (deletion)
    const dischargeTreatmentRecord = new TreatmentRecord({
      patientId: patient._id,
      doctorId: patient.doctors?.[0], // Assign the first doctor if exists
      wardId: patient.ward,
      treatmentDetails: "Patient discharged or deleted.",
      admissionDate: patient.admissionDate,
      dischargeDate: new Date(), // Set discharge date
    });

    // Save the discharge treatment record
    await dischargeTreatmentRecord.save();

    // Update Ward
    await Ward.updateMany(
      { patients: patientId },
      { $pull: { patients: patientId } }
    );

    // Delete related treatment records (if needed)
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
