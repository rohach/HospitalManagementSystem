const Auth = require("../models/authModel");
const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Checking if the email already exists
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this Email already Exists!",
      });
    }
    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // Creating a new user
    const newUser = new Auth({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "Registered!",
      newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Combined Login Controller (checks Auth first, then Doctor, then Patient)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Auth.findOne({ email });
    let roleType = "user"; // default role type

    // If not found in Auth, check in Doctor
    if (!user) {
      user = await Doctor.findOne({ email });
      roleType = "doctor";
    }

    // If not found in Doctor, check in Patient
    if (!user) {
      user = await Patient.findOne({ email });
      roleType = "patient";
    }

    // If user not found in any collection
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role:
          roleType === "doctor"
            ? "doctor"
            : roleType === "patient"
            ? "patient"
            : user.role,
      },
      SECRET_KEY,
      { expiresIn: "30m" }
    );

    // Prepare response user object
    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role:
        roleType === "doctor"
          ? "doctor"
          : roleType === "patient"
          ? "patient"
          : user.role,
    };

    if (roleType === "doctor") responseUser.specialty = user.specialty;

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: responseUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get all Users (Auth + Patients)
exports.getAllUsers = async (req, res) => {
  try {
    const authUsers = await Auth.find().select("-password");
    const patientUsers = await Patient.find().select("-password");

    const users = [...authUsers, ...patientUsers];

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users found.",
        users: [],
      });
    }

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Single User by ID
exports.getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to find the user.",
      });
    }

    let user = await Auth.findById(id).select("-password");

    if (!user) user = await Patient.findById(id).select("-password");
    if (!user) user = await Doctor.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No User Found!",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to delete the user.",
      });
    }

    let user = await Auth.findByIdAndDelete(id);
    if (!user) user = await Patient.findByIdAndDelete(id);
    if (!user) user = await Doctor.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to update the user.",
      });
    }

    if (!name && !email && !role) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (name, email, or role) is required for update.",
      });
    }

    let updatedUser = await Auth.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      updatedUser = await Patient.findByIdAndUpdate(
        id,
        { name, email, role },
        { new: true }
      ).select("-password");

    if (!updatedUser)
      updatedUser = await Doctor.findByIdAndUpdate(
        id,
        { name, email, role },
        { new: true }
      ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
