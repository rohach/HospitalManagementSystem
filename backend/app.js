const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const connectDB = require("./config/connectDB");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const teamRoutes = require("./routes/teamRoutes");
const wardRoutes = require("./routes/wardRoutes");
const authRoutes = require("./routes/authRoutes");
const treatmentRecordRoutes = require("./routes/treatmentRecordRoutes");
const path = require("path");
const cors = require("cors");

// Configuring the App
const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 2000;

// Database connection
connectDB(process.env.MONGO_URL);

// Backend Routes
app.use("/api/v1/patient", patientRoutes);
app.use("/api/v1/doctor", doctorRoutes);
app.use("/api/v1/team", teamRoutes);
app.use("/api/v1/ward", wardRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/treatmentRecord", treatmentRecordRoutes);

app.listen(PORT, () => {
  try {
    console.log(`Server is up and running on PORT:${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
});
