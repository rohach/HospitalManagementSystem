const {
  registerDoctor,
  getAllDoctors,
  getSingleDoctor,
  deleteDoctor,
  updateDoctor,
  addTreatedPatient,
} = require("../controllers/doctorController");

const router = require("express").Router();
const { uploadDoctorImage } = require("../controllers/doctorController"); // Import image upload middleware

// Registering a Doctor
router.route("/registerDoctor").post(uploadDoctorImage, registerDoctor);

// Getting all Doctors
router.route("/getAllDoctors").get(getAllDoctors);

// Get, delete, and update a single Doctor
router
  .route("/getSingleDoctor/:id")
  .get(getSingleDoctor)
  .delete(deleteDoctor)
  .put(uploadDoctorImage, updateDoctor); // Use upload middleware for image when updating

// Adding a treated patient to a doctor (Updated route)
router.route("/addTreatedPatient/:doctorId").put(addTreatedPatient);

module.exports = router;
