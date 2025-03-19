const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const connectDB = require("./config/connectDB");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const teamRoutes = require("./routes/teamRoutes");
const wardRoutes = require("./routes/wardRoutes");
<<<<<<< HEAD
=======
const authRoutes = require("./routes/authRoutes");
>>>>>>> cd162b2 (Backend and Frontend updated)
const cors = require("cors");

// Configuring the App
const app = express();
app.use(express.json());
app.use(cors());
<<<<<<< HEAD
=======
app.use(express.urlencoded({ extended: true }));
>>>>>>> cd162b2 (Backend and Frontend updated)
const PORT = process.env.PORT || 2000;

// Database connection
connectDB(process.env.MONGO_URL);

// Backend Routes
app.use("/api/v1/patient", patientRoutes);
app.use("/api/v1/doctor", doctorRoutes);
app.use("/api/v1/team", teamRoutes);
app.use("/api/v1/ward", wardRoutes);
<<<<<<< HEAD
=======
app.use("/api/v1/auth", authRoutes);
>>>>>>> cd162b2 (Backend and Frontend updated)

app.listen(PORT, () => {
  try {
    console.log(`Server is up and running on PORT:${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
});
