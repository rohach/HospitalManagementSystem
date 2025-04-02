const mongoose = require("mongoose");

const treatmentRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  wardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ward",
    required: false,
  }, // If applicable
  admissionDate: { type: Date, default: Date.now },
  dischargeDate: { type: Date },
  transferred: { type: Boolean, default: false },
  treatmentDetails: { type: String },
  notes: { type: String },
});

const TreatmentRecord = mongoose.model(
  "TreatmentRecord",
  treatmentRecordSchema
);
module.exports = TreatmentRecord;
