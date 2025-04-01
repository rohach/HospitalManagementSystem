const {
  registerPatient,
  getAllPatients,
  getSinglePatient,
  deletePatient,
  updatePatient,
} = require("../controllers/patientController");
const authMiddleware = require("../middleware/authMiddleware");

const router = require("express").Router();
const upload = require("../middleware/multer"); // Importing the multer middleware for image upload

// Registering a Patient with image upload
router.route("/registerPatient").post(upload.single("image"), registerPatient); // Adding the image upload middleware

// Getting all Patients
router.route("/getAllPatients").get(getAllPatients);

// Get, delete, and update single Patient
router
  .route("/getSinglePatient/:id")
  .get(authMiddleware, getSinglePatient)
  .delete(deletePatient)
  .put(upload.single("image"), updatePatient); // Adding the image upload middleware for update

module.exports = router;
