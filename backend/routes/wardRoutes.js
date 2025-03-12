const {
  addWard,
  getAllWards,
  getSingleWard,
  deleteWard,
} = require("../controllers/wardController");

const router = require("express").Router();

// Add Wards
router.route("/addWard").post(addWard);

// Get All Wards
router.route("/getAllWards").get(getAllWards);

// Get single ward, delete and update
router.route("/getSingleWard/:id").get(getSingleWard).delete(deleteWard);

module.exports = router;
