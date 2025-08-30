const Patient = require("../models/patientModel");
const Doctor = require("../models/doctorModel");
const Ward = require("../models/wardModel");
const TreatmentRecord = require("../models/treatmentRecordModel");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ----------------- Mock AI Logic -----------------
function mockRiskPrediction(patient) {
  let riskScore = 0.1;
  const riskFlags = [];

  if (patient.age >= 60) {
    riskScore += 0.3;
    riskFlags.push("elderly");
  }

  if (patient.status && patient.status.toLowerCase() === "critical") {
    riskScore += 0.5;
    riskFlags.push("critical_condition");
  }

  riskScore += (Math.random() - 0.5) * 0.2;
  riskScore = Math.min(Math.max(riskScore, 0), 1);

  return { riskScore, riskFlags };
}

function mockAIReportSummary(patient, riskScore, riskFlags) {
  let summary = `Patient ${patient.patientName} is a ${patient.age}-year-old ${patient.gender}. `;
  if (riskScore > 0.7) summary += "Patient is at high risk due to ";
  else if (riskScore > 0.4)
    summary += "Patient has moderate risk factors including ";
  else summary += "Patient is currently low risk with ";

  if (riskFlags.length > 0) summary += riskFlags.join(", ") + ".";
  else summary += "no significant risk flags.";

  return summary;
}

function mockSmartScheduling(admissionDate, riskScore) {
  const baseDays = 30;
  let daysUntilNext = baseDays;
  if (riskScore > 0.7) daysUntilNext = 7;
  else if (riskScore > 0.4) daysUntilNext = 14;

  const nextAppointment = new Date(admissionDate);
  nextAppointment.setDate(nextAppointment.getDate() + daysUntilNext);
  return nextAppointment;
}

async function smartSchedule() {
  const wards = await Ward.find().sort({ occupiedBeds: 1, capacity: 1 });
  const doctors = await Doctor.find().sort({ treatedPatientsCount: 1 });
  const ward = wards.find((w) => w.occupiedBeds < w.capacity);
  const doctor = doctors.length > 0 ? doctors[0] : null;

  return {
    wardId: ward?._id || null,
    doctorId: doctor?._id || null,
  };
}

// ----------------- Controller Methods -----------------

// Register Patient
exports.registerPatient = async (req, res) => {
  try {
    let {
      patientName,
      patientCaste,
      age,
      gender,
      contact,
      status,
      ward,
      doctors,
      email,
      password,
      conditions,
    } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const existingPatient = await Patient.findOne({ contact });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient with this contact already exists!",
      });
    }

    if (!ward || ward === "") {
      const schedule = await smartSchedule();
      ward = schedule.wardId;
      doctors =
        doctors && doctors.length > 0
          ? doctors
          : [schedule.doctorId].filter(Boolean);
    }

    if (doctors && !Array.isArray(doctors)) doctors = [doctors];
    if (conditions && !Array.isArray(conditions)) conditions = [conditions];

    let imageUrl = "";
    if (req.file) imageUrl = req.file.path;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = new Patient({
      patientName,
      patientCaste,
      age,
      gender,
      contact,
      status,
      ward: ward || undefined,
      email,
      doctors,
      image: imageUrl,
      password: hashedPassword,
      conditions,
    });

    await newPatient.save();

    if (mongoose.Types.ObjectId.isValid(ward)) {
      await Ward.findByIdAndUpdate(ward, {
        $inc: { occupiedBeds: 1 },
        $push: { patients: newPatient._id },
      });
    }

    if (doctors && doctors.length > 0) {
      await Doctor.updateMany(
        { _id: { $in: doctors } },
        { $push: { treatedPatients: newPatient._id } }
      );
    }

    const admissionDate = new Date();
    const newTreatmentRecord = new TreatmentRecord({
      patientId: newPatient._id,
      doctorId: doctors?.[0] || null,
      wardId: ward || null,
      treatmentDetails: "Initial admission and treatment",
      admissionDate,
      dischargeDate: null,
    });
    await newTreatmentRecord.save();

    const { riskScore, riskFlags } = mockRiskPrediction(newPatient);
    const aiReportSummary = mockAIReportSummary(
      newPatient,
      riskScore,
      riskFlags
    );
    const nextAppointment = mockSmartScheduling(admissionDate, riskScore);

    const populatedPatient = await Patient.findById(newPatient._id)
      .populate({ path: "ward", select: "wardName _id" })
      .populate({ path: "doctors", select: "doctorName _id" })
      .select("-password");

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully!",
      patient: populatedPatient,
      aiReport: {
        riskScore,
        riskFlags,
        summary: aiReportSummary,
        nextAppointmentDate: nextAppointment,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get AI Report
exports.getPatientReport = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findById(patientId);
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });

    const treatmentRecord = await TreatmentRecord.findOne({ patientId }).sort({
      admissionDate: -1,
    });
    const admissionDate = treatmentRecord?.admissionDate || new Date();

    const { riskScore, riskFlags } = mockRiskPrediction(patient);
    const aiReportSummary = mockAIReportSummary(patient, riskScore, riskFlags);
    const nextAppointment = mockSmartScheduling(admissionDate, riskScore);

    return res.status(200).json({
      success: true,
      aiReport: {
        riskScore,
        riskFlags,
        summary: aiReportSummary,
        nextAppointmentDate: nextAppointment,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Update Patient
exports.updatePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const updateData = { ...req.body };
    if (req.file) updateData.image = req.file.path;

    if (updateData.password)
      updateData.password = await bcrypt.hash(updateData.password, 10);

    if (updateData.conditions && !Array.isArray(updateData.conditions))
      updateData.conditions = [updateData.conditions]; // ensure array

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      updateData,
      { new: true }
    )
      .populate({ path: "ward", select: "wardName _id" })
      .populate({ path: "doctors", select: "doctorName _id" })
      .select("-password");

    if (!updatedPatient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });

    const { riskScore, riskFlags } = mockRiskPrediction(updatedPatient);
    const aiReportSummary = mockAIReportSummary(
      updatedPatient,
      riskScore,
      riskFlags
    );

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient: updatedPatient,
      aiReport: { riskScore, riskFlags, summary: aiReportSummary },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Delete Patient
exports.deletePatient = async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    if (!deletedPatient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });

    return res
      .status(200)
      .json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get All Patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate({ path: "ward", select: "wardName _id" })
      .populate({ path: "doctors", select: "doctorName _id" })
      .select("-password");
    return res.status(200).json({ success: true, patients });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get Single Patient
exports.getSinglePatient = async (req, res) => {
  try {
    const patientDetail = await Patient.findById(req.params.id)
      .populate({ path: "ward", select: "wardName _id" })
      .populate({ path: "doctors", select: "doctorName _id" })
      .select("-password");
    if (!patientDetail)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found!" });

    res.status(200).json({ success: true, patientDetail });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Stats Endpoints
exports.getPatientCount = async (req, res) => {
  try {
    const count = await Patient.countDocuments();
    res.status(200).json({ totalPatients: count });
  } catch (error) {
    res.status(500).json({ message: "Error getting patient count", error });
  }
};

exports.getPatientsByAgeGroup = async (req, res) => {
  try {
    const groups = await Patient.aggregate([
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 18, 40, 60, 120],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error aggregating by age", error });
  }
};

exports.getPatientsByGender = async (req, res) => {
  try {
    const groups = await Patient.aggregate([
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error aggregating by gender", error });
  }
};

exports.getAverageRiskScore = async (req, res) => {
  try {
    const patients = await Patient.find();
    if (!patients.length) return res.json({ averageRiskScore: 0 });

    let totalRisk = 0;
    patients.forEach((patient) => {
      const { riskScore } = mockRiskPrediction(patient);
      totalRisk += riskScore;
    });
    const averageRiskScore = totalRisk / patients.length;

    res.status(200).json({ averageRiskScore });
  } catch (error) {
    res.status(500).json({ message: "Error calculating average risk", error });
  }
};

exports.getNextAppointmentSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const { riskScore } = mockRiskPrediction(patient);
    const nextAppointment = mockSmartScheduling(
      patient.admissionDate,
      riskScore
    );

    res.status(200).json({ nextAppointment });
  } catch (error) {
    res.status(500).json({ message: "Error suggesting appointment", error });
  }
};
