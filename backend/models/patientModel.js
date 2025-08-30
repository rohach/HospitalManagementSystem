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
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },
    dob: {
      // optional if you want dynamic age calc
      type: Date,
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
      ref: "Ward",
      required: false,
    },
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      default: "patient",
    },
    address: {
      type: String,
    },
    transferred: {
      type: Boolean,
      default: false,
    },
    conditions: [
      {
        type: String,
      },
    ],
    admissionDate: {
      type: Date,
    },
    dischargeDate: {
      type: Date,
    },
    lastAppointmentDate: {
      type: Date,
    },

    // ----- AI-Driven Fields Added Below -----
    aiRiskScore: {
      // AI computed risk score from 0 to 1 (or percentage)
      type: Number,
      default: 0,
    },
    aiNextAppointment: {
      // Smart scheduling recommendation date/time by AI
      type: Date,
    },
    aiReportSummary: {
      // AI generated summary for patient's report
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Virtual field to get the ward name dynamically
patientSchema.virtual("wardName", {
  ref: "Ward",
  localField: "ward",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON output
patientSchema.set("toJSON", { virtuals: true });
patientSchema.set("toObject", { virtuals: true });

const patientModel = mongoose.model("Patient", patientSchema);
module.exports = patientModel;
