const mongoose = require("mongoose");

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
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    treatedPatients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
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
    { path: "treatedPatients", select: "patientName" }, // Corrected to treatedPatients
    { path: "wards", select: "wardName" }, // Populate wardName
  ]);
};

const doctorModel = mongoose.model("Doctor", doctorSchema);
module.exports = doctorModel;
