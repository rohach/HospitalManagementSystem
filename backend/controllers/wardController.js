const Ward = require("../models/wardModel");

// Adding a Ward
exports.addWard = async (req, res) => {
  try {
    const { wardName, wardType, capacity, occupiedBeds, patients } = req.body;
    const existingWard = await Ward.findOne({ wardName });
    if (existingWard) {
      res.status(500).json({
        success: false,
        message: "Ward with this name already exists!",
      });
    } else {
      const newWard = new Ward({
        wardName,
        wardType,
        capacity,
        occupiedBeds,
        patients,
      });
      await newWard.save();

      return res.status(201).json({
        success: true,
        message: "Ward Added!",
        team: newWard,
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

// Get All wards
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

// Get single ward
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
        message: "Wards not found!",
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
    await Ward.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Ward deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
