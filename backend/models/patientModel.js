const mongoose = require("mongoose");
const patientSchema = mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
    },
    patientCaste: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    contact: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Admitted", "Discharged"],
      required: true,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],
  },
  { timestamps: true }
);
const patientModel = new mongoose.model("Patient", patientSchema);
module.exports = patientModel;
