const mongoose = require("mongoose");
const patientModel = require("./patientModel"); // Import the Patient model to reference it

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      enum: ["Junior", "Senior"],
      required: true,
    },
    specialty: {
      type: String,
      required: true, // You can set this to false if it's optional
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      // required: true,
    },
    treatedPatients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient", // This references the Patient model
      },
    ],
    juniorDoctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],
    image: {
      type: String,
      default: "",
    },
    wards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ward",
      },
    ],
  },
  { timestamps: true }
);

// Method to populate treated patients and wards' names
doctorSchema.methods.getDetailedDoctorInfo = function () {
  return this.populate([
    { path: "treatedPatients", select: "patientName" }, // Populate treatedPatients with patient name
    { path: "wards", select: "wardName" }, // Populate wardName
  ]);
};

// Create the Doctor model based on the schema
const doctorModel = mongoose.model("Doctor", doctorSchema);

module.exports = doctorModel;
