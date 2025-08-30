const {
  registerPatient,
  getAllPatients,
  getSinglePatient,
  deletePatient,
  updatePatient,
  getPatientCount,
  getPatientsByAgeGroup,
  getPatientsByGender,
  getAverageRiskScore,
  getNextAppointmentSuggestion,
  getPatientReport, // <-- Import AI report controller
} = require("../controllers/patientController");

const router = require("express").Router();
const upload = require("../middleware/multer");

// Registering a Patient with image upload
router.route("/registerPatient").post(upload.single("image"), registerPatient);

// Getting all Patients
router.route("/getAllPatients").get(getAllPatients);

// Get, delete, and update single Patient
router
  .route("/getSinglePatient/:id")
  .get(getSinglePatient)
  .delete(deletePatient)
  .put(upload.single("image"), updatePatient);

// -------------------- NEW ROUTE FOR AI REPORT --------------------
router.route("/getPatientReport/:id").get(getPatientReport);

router.route("/stats/totalPatients").get(getPatientCount);
router.route("/stats/patientsByAge").get(getPatientsByAgeGroup);
router.route("/stats/patientsByGender").get(getPatientsByGender);
router.route("/stats/averageRisk").get(getAverageRiskScore);
router.route("/smartScheduler/:id").get(getNextAppointmentSuggestion);

module.exports = router;
