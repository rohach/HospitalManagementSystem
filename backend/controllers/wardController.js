const Ward = require("../models/wardModel");
const Patient = require("../models/patientModel");
const upload = require("../middleware/multer");

// Adding a Ward
exports.addWard = async (req, res) => {
  try {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      const { wardName, wardType, capacity, patients } = req.body;
      const imagePath = req.file ? req.file.path : null;

      // Check if the ward already exists
      const existingWard = await Ward.findOne({ wardName });
      if (existingWard) {
        return res.status(500).json({
          success: false,
          message: "Ward with this name already exists!",
        });
      }

      // Set the number of occupied beds dynamically based on patients
      const occupiedBeds = patients ? patients.length : 0;

      // Create a new ward
      const newWard = new Ward({
        wardName,
        wardType,
        capacity,
        occupiedBeds,
        patients,
        image: imagePath,
      });

      await newWard.save();

      return res.status(201).json({
        success: true,
        message: "Ward Added!",
        ward: newWard,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get All Wards
exports.getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find();
    if (wards.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Wards retrieved successfully!",
        wards,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No Ward found!",
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

// Get Single Ward
exports.getSingleWard = async (req, res) => {
  try {
    const ward = await Ward.findById(req.params.id);
    if (ward) {
      res.status(200).json({
        success: true,
        ward,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Ward not found!",
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

// Delete a Ward
exports.deleteWard = async (req, res) => {
  try {
    const wardDetail = await Ward.findById(req.params.id);

    if (!wardDetail) {
      return res.status(404).json({
        success: false,
        message: "Ward not found!",
      });
    }

    // Remove patients from the ward before deleting it
    const patientIds = wardDetail.patients; // Get patient IDs
    await Patient.updateMany(
      { _id: { $in: patientIds } },
      { $pull: { wards: wardDetail._id } } // Remove this ward from patients' ward list
    );

    // Delete the ward
    await Ward.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Ward and its patients' ward association deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
