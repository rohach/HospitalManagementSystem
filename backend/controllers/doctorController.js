const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");

// Register a Doctor
exports.registerDoctor = async (req, res) => {
  try {
    const { name, grade, team, treatedPatients, juniorDoctors } = req.body;

    // Check if doctor already exists
    const doctorExists = await Doctor.findOne({ name, team });
    if (doctorExists) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this name in the team already exists!",
      });
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
    });

    await newDoctor.save();

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully!",
      doctor: newDoctor,
    });
  } catch (error) {
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
      .populate("juniorDoctors", "name grade");

    if (doctors.length > 0) {
      res.status(200).json({
        success: true,
        message: "Doctors Retrieved successfully!",
        doctors,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No doctors found!",
      });
    }
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
      .populate("juniorDoctors", "name grade");

    if (!doctorDetail) {
      return res.status(404).json({
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

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("treatedPatients", "patientName age")
      .populate("juniorDoctors", "name grade");

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

    res.status(200).json({
      success: true,
      message: "Patient added to treated list successfully!",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
