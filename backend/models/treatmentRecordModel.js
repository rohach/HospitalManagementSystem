const mongoose = require("mongoose");

const treatmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    treatments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Treatment",
      },
    ],
  },
  { timestamps: true }
);

const treatmentModel = mongoose.model("Treatment", treatmentSchema);
module.exports = treatmentModel;
