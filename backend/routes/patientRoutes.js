const {
  registerPatient,
  getAllPatients,
  getSinglePatient,
  deletePatient,
  updatePatient,
} = require("../controllers/patientController");

const router = require("express").Router();

// Registering a Patient
router.route("/registerPatient").post(registerPatient);

// Getting all Patients
router.route("/getAllPatients").get(getAllPatients);

// Get, delete and update single Patient
router
  .route("/getSinglePatient/:id")
  .get(getSinglePatient)
  .delete(deletePatient)
  .put(updatePatient);

module.exports = router;
