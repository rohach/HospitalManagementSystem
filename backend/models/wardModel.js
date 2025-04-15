const mongoose = require("mongoose");

const wardSchema = new mongoose.Schema(
  {
    wardName: {
      type: String,
      required: true,
      unique: true,
    },
    wardType: {
      type: String,
      enum: ["Male", "Female", "Kids", "Other"],
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    occupiedBeds: {
      type: Number,
      default: 0,
    },
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },
    ],
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const wardModel = mongoose.model("Ward", wardSchema);
module.exports = wardModel;
