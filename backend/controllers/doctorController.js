const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const Ward = require("../models/wardModel");
const upload = require("../middleware/multer"); // Import multer middleware
const fs = require("fs"); // To handle file deletion when updating or deleting doctors

// Register a Doctor
exports.registerDoctor = async (req, res) => {
  try {
    const { name, grade, team, treatedPatients, juniorDoctors, wardId } =
      req.body;

    // Check if doctor already exists
    const doctorExists = await Doctor.findOne({ name, team });
    if (doctorExists) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this name in the team already exists!",
      });
    }

    // If there's an image uploaded, handle file saving
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path; // Save the file path in the DB
    }

    // Ensure treatedPatients and juniorDoctors are arrays
    const newDoctor = new Doctor({
      name,
      grade,
      team,
      treatedPatients: Array.isArray(treatedPatients)
        ? treatedPatients
        : [treatedPatients],
      juniorDoctors: Array.isArray(juniorDoctors)
        ? juniorDoctors
        : [juniorDoctors],
      image: imageUrl, // Save image path in DB
    });

    // Check if the wardId is provided and the ward exists
    if (wardId) {
      const ward = await Ward.findById(wardId); // Find ward by ID
      if (!ward) {
        return res.status(400).json({
          success: false,
          message: "Ward not found with the provided ID!",
        });
      }
      // If ward is found, add doctor to the ward's doctors array
      if (!ward.doctors) ward.doctors = []; // Ensure doctors array exists
      ward.doctors.push(newDoctor._id);

      // Add the ward to the new doctor's wards array
      newDoctor.wards.push(ward._id);

      // Save the updated ward and the new doctor
      await ward.save();
    }

    // Save the doctor to the database
    await newDoctor.save();

    // Return success response with full doctor and populated ward details
    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully!",
      doctor: newDoctor,
    });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get all Doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("treatedPatients", "patientName age")
      .populate("juniorDoctors", "name grade")
      .populate("wards", "wardName occupiedBeds");

    res.status(200).json({
      success: true,
      message:
        doctors.length > 0
          ? "Doctors Retrieved successfully!"
          : "No doctors found!",
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Single Doctor
exports.getSingleDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctorDetail = await Doctor.findById(doctorId)
      .populate("treatedPatients", "patientName age")
      .populate("juniorDoctors", "name grade")
      .populate("wards", "wardName");

    if (!doctorDetail) {
      return res.status(500).json({
        success: false,
        message: "Doctor not found!",
      });
    }

    res.status(200).json({
      success: true,
      doctorDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete Single Doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const { id: doctorId } = req.params;

    const doctorDetail = await Doctor.findById(doctorId);
    if (!doctorDetail) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found!",
      });
    }

    // Remove the doctor from associated wards
    await Ward.updateMany(
      { doctors: doctorId },
      { $pull: { doctors: doctorId } }
    );

    // Delete image file if it exists
    if (doctorDetail.image) {
      fs.unlinkSync(doctorDetail.image);
    }

    // Delete the doctor
    await Doctor.findByIdAndDelete(doctorId);

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update Single Doctor
exports.updateDoctor = async (req, res) => {
  try {
    const { id: doctorId } = req.params;
    const updateData = req.body;

    const doctorDetail = await Doctor.findById(doctorId);
    if (!doctorDetail) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found!",
      });
    }

    // If a new image is uploaded, update the image field and delete old image
    if (req.file) {
      // Delete old image file if it exists
      if (doctorDetail.image) {
        fs.unlinkSync(doctorDetail.image);
      }
      updateData.image = req.file.path; // Save new image path
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("treatedPatients", "patientName age")
      .populate("juniorDoctors", "name grade")
      .populate("wards", "wardName");

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully!",
      doctor: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Add Treated Patient to Doctor
exports.addTreatedPatient = async (req, res) => {
  try {
    const { doctorId } = req.params; // Updated to fetch doctorId from params
    const { patientId } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $addToSet: { treatedPatients: patientId } },
      { new: true }
    )
      .populate("treatedPatients", "patientName age")
      .populate("juniorDoctors", "name grade");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found!",
      });
    }

    // Update the patient and add the doctor to their treatedBy array (or similar array)
    const patient = await Patient.findByIdAndUpdate(patientId, {
      $addToSet: { treatedBy: doctorId },
    });

    res.status(200).json({
      success: true,
      message: "Patient added to treated list successfully!",
      doctor,
      patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Define Multer upload middleware for image file upload (for doctor registration and update)
exports.uploadDoctorImage = upload.single("image"); // 'image' is the fieldname in the form
