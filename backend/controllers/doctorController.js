const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const Ward = require("../models/wardModel");
const upload = require("../middleware/multer");
const fs = require("fs");

// Register a Doctor
// Register a Doctor
// Register a Doctor
exports.registerDoctor = async (req, res) => {
  try {
    const {
      name,
      grade,
      team,
      treatedPatients,
      juniorDoctors,
      wardId,
      specialty,
      contact,
      email,
    } = req.body;

    // If team is empty or invalid, set it to null
    const teamId = team && team !== "" ? team : null;

    // Check if a doctor with the same name and team already exists
    const doctorExists = await Doctor.findOne({ name, team: teamId });
    if (doctorExists) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this name in the team already exists!",
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path;
    }

    // Create a new doctor
    const newDoctor = new Doctor({
      name,
      grade,
      team: teamId, // Use the validated teamId
      specialty,
      contact,
      email,
      treatedPatients: Array.isArray(treatedPatients)
        ? treatedPatients
        : treatedPatients
        ? [treatedPatients]
        : [],
      juniorDoctors: Array.isArray(juniorDoctors)
        ? juniorDoctors
        : juniorDoctors
        ? [juniorDoctors]
        : [],
      image: imageUrl,
    });

    // Add doctor to the ward if wardId is provided
    if (wardId) {
      const ward = await Ward.findById(wardId);
      if (!ward) {
        return res.status(400).json({
          success: false,
          message: "Ward not found with the provided ID!",
        });
      }
      if (!ward.doctors) ward.doctors = [];
      ward.doctors.push(newDoctor._id);
      newDoctor.wards.push(ward._id);
      await ward.save();
    }

    await newDoctor.save();

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully!",
      doctor: newDoctor,
    });
  } catch (error) {
    console.error("Error:", error);
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
      .populate("wards") // Populate assigned wards
      .populate("treatedPatients"); // Populate treated patients

    res.status(200).json({
      success: true,
      message: "Doctors Retrieved successfully!",
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found!" });
    }

    res.status(200).json({ success: true, doctorDetail });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Delete Single Doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const { id: doctorId } = req.params;
    const doctorDetail = await Doctor.findById(doctorId);

    if (!doctorDetail) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found!" });
    }

    await Ward.updateMany(
      { doctors: doctorId },
      { $pull: { doctors: doctorId } }
    );

    if (doctorDetail.image) {
      fs.unlink(doctorDetail.image, (err) => {
        if (err) console.error("Failed to delete image:", err);
      });
    }

    await Doctor.findByIdAndDelete(doctorId);

    res
      .status(200)
      .json({ success: true, message: "Doctor deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Update Single Doctor
exports.updateDoctor = async (req, res) => {
  try {
    const { id: doctorId } = req.params;
    const updateData = req.body;

    const doctorDetail = await Doctor.findById(doctorId);
    if (!doctorDetail) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found!" });
    }

    if (req.file) {
      if (doctorDetail.image) {
        fs.unlink(doctorDetail.image, (err) => {
          if (err) console.error("Failed to delete old image:", err);
        });
      }
      updateData.image = req.file.path;
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
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Add Treated Patient to Doctor
exports.addTreatedPatient = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { patientId } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $addToSet: { treatedPatients: patientId } },
      { new: true }
    )
      .populate("treatedPatients", "patientName age")
      .populate("juniorDoctors", "name grade");

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found!" });
    }

    await Patient.findByIdAndUpdate(patientId, {
      $addToSet: { treatedBy: doctorId },
    });

    res.status(200).json({
      success: true,
      message: "Patient added to treated list successfully!",
      doctor,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Define Multer upload middleware
exports.uploadDoctorImage = upload.single("image");
