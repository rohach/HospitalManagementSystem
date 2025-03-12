const {
  registerTeam,
  getAllTeams,
  getSingleTeam,
  deleteTeam,
  updateTeam,
} = require("../controllers/teamController");

const router = require("express").Router();

router.route("/registerTeam").post(registerTeam);
router.route("/getAllTeams").get(getAllTeams);
router
  .route("/getSingleTeam/:id")
  .get(getSingleTeam)
  .delete(deleteTeam)
  .put(updateTeam);

module.exports = router;
