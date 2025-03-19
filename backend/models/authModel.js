const mongoose = require("mongoose");
const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minimum: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 5,
    },
    role: {
      type: String,
      enum: ["admin", "patient", "doctor"],
    },
  },
  {
    timestamps: true,
  }
);
const authModel = mongoose.model("Auth", authSchema);
module.exports = authModel;
