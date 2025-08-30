const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const path = require("path");
const cors = require("cors");
console.log(process.env.MONGO_URL);
async function startServer() {
  // Polyfills only if Node <18 (optional)
  const { fetch, Headers, Request, Response } = await import("undici");
  const { Blob } = await import("fetch-blob");

  global.fetch = fetch;
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
  global.Blob = Blob;

  // Import database connection, routes, controllers
  const connectDB = require("./config/connectDB");
  const patientRoutes = require("./routes/patientRoutes");
  const doctorRoutes = require("./routes/doctorRoutes");
  const teamRoutes = require("./routes/teamRoutes");
  const wardRoutes = require("./routes/wardRoutes");
  const authRoutes = require("./routes/authRoutes");
  const appointmentRoutes = require("./routes/appointmentRoutes");
  const treatmentRecordRoutes = require("./routes/treatmentRecordRoutes");
  const notificationRoutes = require("./routes/notificationRoutes");
  const billingRoutes = require("./routes/billingRoutes");
  const createDefaultAdmin = require("./controllers/initAdmin");

  // AI controller and OpenAI chat route
  const aiController = require("./controllers/aiController");
  const chatRoute = require("./routes/chatRoute"); // expects openai instance

  // OpenAI client setup
  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const app = express();
  const PORT = process.env.PORT || 2000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Connect to MongoDB
  connectDB(process.env.MONGO_URL);

  // API routes
  app.use("/api/v1/patient", patientRoutes);
  app.use("/api/v1/doctor", doctorRoutes);
  app.use("/api/v1/team", teamRoutes);
  app.use("/api/v1/ward", wardRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/treatmentRecord", treatmentRecordRoutes);
  app.use("/api/v1/appointment", appointmentRoutes);
  app.use("/api/v1/notification", notificationRoutes);
  app.use("/api/v1/billing", billingRoutes);

  // AI routes — pass openai to controller
  app.use("/api/v1/ai", aiController(openai)); // includes /chat and /risk-prediction
  // app.use("/api/v1/chat", chatRoute(openai));

  // Start server
  app.listen(PORT, () => {
    try {
      createDefaultAdmin();
      console.log(`✅ Server running on PORT: ${PORT}`);
    } catch (error) {
      console.error("❌ Error creating default admin:", error.message);
    }
  });
}

// Start the server
startServer();
