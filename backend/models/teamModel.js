const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      // required: true,
    },
    juniorDoctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],
  },
  { timestamps: true }
);

const teamModel = mongoose.model("Team", teamSchema);
module.exports = teamModel;
