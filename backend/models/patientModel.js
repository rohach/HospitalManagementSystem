const mongoose = require("mongoose");
<<<<<<< HEAD
=======

>>>>>>> cd162b2 (Backend and Frontend updated)
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
<<<<<<< HEAD
      ref: "Team",
=======
      ref: "Ward",
>>>>>>> cd162b2 (Backend and Frontend updated)
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
<<<<<<< HEAD
const patientModel = new mongoose.model("Patient", patientSchema);
=======

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
>>>>>>> cd162b2 (Backend and Frontend updated)
module.exports = patientModel;
