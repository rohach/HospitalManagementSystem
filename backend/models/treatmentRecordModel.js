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
    // required: true,
  },
  wardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ward",
    required: false,
  },
  treatmentDetails: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  transferHistory: [
    {
      previousWardId: { type: mongoose.Schema.Types.ObjectId, ref: "Ward" },
      newWardId: { type: mongoose.Schema.Types.ObjectId, ref: "Ward" },
      transferredAt: { type: Date, default: Date.now },
    },
  ],
  transferred: { type: Boolean, default: false },
});

const TreatmentRecord = mongoose.model(
  "TreatmentRecord",
  treatmentRecordSchema
);

module.exports = TreatmentRecord;
