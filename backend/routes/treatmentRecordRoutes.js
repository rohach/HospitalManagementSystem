const express = require("express");
const router = express.Router();
const treatmentRecordController = require("../controllers/treatmentRecordController");

// Add a new treatment record
router.post("/treatmentRecords", treatmentRecordController.addTreatmentRecord);

// Get all treatment records
router.get(
  "/treatmentRecords",
  treatmentRecordController.getAllTreatmentRecords
);

// Get a single treatment record by ID
router.get(
  "/treatmentRecords/:id",
  treatmentRecordController.getTreatmentRecordsByPatientId
);
// Get all treatment records of a patient
router.get(
  "/treatmentRecords/patient/:patientId",
  treatmentRecordController.getTreatmentRecordsByPatientId
);

// Update a treatment record
router.put(
  "/treatmentRecords/:id",
  treatmentRecordController.updateTreatmentRecord
);

// Delete a treatment record
router.delete(
  "/treatmentRecords/:id",
  treatmentRecordController.deleteTreatmentRecord
);

module.exports = router;
