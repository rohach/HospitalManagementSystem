const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config({ path: "./config/config.env" });

async function startServer() {
  // Import undici fetch and fetch-blob dynamically
  const { fetch, Headers, Request, Response } = await import("undici");
  const fetchBlobModule = await import("fetch-blob");
  const Blob = fetchBlobModule.default;

  // Polyfill globals for OpenAI SDK and others
  global.fetch = fetch;
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
  global.Blob = Blob;

  // Now require other modules (after globals polyfilled)
  const connectDB = require("./config/connectDB");
  const patientRoutes = require("./routes/patientRoutes");
  const doctorRoutes = require("./routes/doctorRoutes");
  const teamRoutes = require("./routes/teamRoutes");
  const wardRoutes = require("./routes/wardRoutes");
  const authRoutes = require("./routes/authRoutes");
  const appointmentRoutes = require("./routes/appointmentRoutes");
  const treatmentRecordRoutes = require("./routes/treatmentRecordRoutes");
  const notificationRoutes = require("./routes/notificationRoutes");
  const createDefaultAdmin = require("./controllers/initAdmin");
  const chatRoute = require("./routes/chatRoute");

  const app = express();
  const PORT = process.env.PORT || 2000;

  app.use(express.json());
  app.use(cors());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  app.use(express.urlencoded({ extended: true }));

  // Connect to DB
  connectDB(process.env.MONGO_URL);

  // API Routes
  app.use("/api/v1/patient", patientRoutes);
  app.use("/api/v1/doctor", doctorRoutes);
  app.use("/api/v1/team", teamRoutes);
  app.use("/api/v1/ward", wardRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/treatmentRecord", treatmentRecordRoutes);
  app.use("/api/v1/appointment", appointmentRoutes);
  app.use("/api/v1/notification", notificationRoutes);
  app.use("/api/v1/chat", chatRoute);

  app.listen(PORT, () => {
    try {
      createDefaultAdmin();
      console.log(`Server is up and running on PORT:${PORT}`);
    } catch (error) {
      console.log(error.message);
    }
  });
}

// Start the server
startServer();
