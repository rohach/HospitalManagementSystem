const Team = require("../models/teamModel");

// Register a Team
exports.registerTeam = async (req, res) => {
  try {
    const { name, department, consultant, juniorDoctors } = req.body;

    // Check if team already exists
    const teamExists = await Team.findOne({ name, department });
    if (teamExists) {
      return res.status(400).json({
        success: false,
        message: "Team with this name in the department already exists!",
      });
    }

    // Create a new team
    const newTeam = new Team({ name, department, consultant, juniorDoctors });
    await newTeam.save();

    return res.status(201).json({
      success: true,
      message: "Team registered successfully!",
      team: newTeam,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get all Teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    if (teams.length > 0) {
      res.status(200).json({
        success: true,
        message: "Teams retrieved successfully!",
        teams,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No teams found!",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Single Team
exports.getSingleTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const teamDetail = await Team.findById(teamId);

    if (!teamDetail) {
      return res.status(404).json({
        success: false,
        message: "Team not found!",
      });
    }

    res.status(200).json({
      success: true,
      teamDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete Single Team
exports.deleteTeam = async (req, res) => {
  try {
    const { id: teamId } = req.params;

    const teamDetail = await Team.findById(teamId);
    if (!teamDetail) {
      return res.status(404).json({
        success: false,
        message: "Team not found!",
      });
    }

    await Team.findByIdAndDelete(teamId);
    res.status(200).json({
      success: true,
      message: "Team deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update Single Team
exports.updateTeam = async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const updateData = req.body;

    const teamDetail = await Team.findById(teamId);
    if (!teamDetail) {
      return res.status(404).json({
        success: false,
        message: "Team not found!",
      });
    }

    const updatedTeam = await Team.findByIdAndUpdate(teamId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Team updated successfully!",
      team: updatedTeam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
