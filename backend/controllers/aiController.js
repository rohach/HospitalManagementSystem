const express = require("express");
const PatientModel = require("../models/patientModel");
const TreatmentRecord = require("../models/treatmentRecordModel");
const appointmentController = require("../controllers/appointmentController");
const billingController = require("../controllers/billingController");
const WardModel = require("../models/wardModel");
const BillingModel = require("../models/billingModel"); // path: ../models/billingModel.js

module.exports = function (openai) {
  const router = express.Router();

  // -------------------- Helpers --------------------
  const computeRiskScore = (patient) => {
    let riskScore = 0.1;
    const riskFlags = [];

    if (patient.age >= 60) {
      riskScore += 0.3;
      riskFlags.push("elderly");
    }
    if (patient.status?.toLowerCase() === "critical") {
      riskScore += 0.5;
      riskFlags.push("critical_condition");
    }
    riskScore += (Math.random() - 0.5) * 0.2;
    riskScore = Math.min(Math.max(riskScore, 0), 1);
    return { riskScore, riskFlags };
  };

  const suggestNextAppointment = (admissionDate, riskScore) => {
    const baseDays = 30;
    let daysUntilNext = baseDays;
    if (riskScore > 0.7) daysUntilNext = 7;
    else if (riskScore > 0.4) daysUntilNext = 14;

    const nextAppointment = new Date(admissionDate || new Date());
    nextAppointment.setDate(nextAppointment.getDate() + daysUntilNext);
    return nextAppointment.toISOString();
  };

  const generatePatientSummary = (
    patient,
    riskScore,
    riskFlags,
    nextAppointment
  ) => {
    let summary = `Patient ${patient.patientName}, ${patient.age} years old (${patient.gender}), status: ${patient.status}.\n\n`;

    if (patient.treatmentNotes?.length) {
      summary += "Treatment Notes:\n";
      patient.treatmentNotes.forEach((note) => {
        summary += `- ${new Date(note.date).toLocaleDateString()}: ${
          note.purpose
        }. Observations: ${note.observations}\n`;
      });
    }

    if (patient.treatmentPlan?.length) {
      summary += "\nTreatment Plan:\n";
      patient.treatmentPlan.forEach((item) => (summary += `- ${item}\n`));
    }

    if (patient.lifestyleRecommendations?.length) {
      summary += "\nLifestyle Recommendations:\n";
      patient.lifestyleRecommendations.forEach(
        (item) => (summary += `- ${item}\n`)
      );
    }

    summary += `\nRisk Score: ${(riskScore * 100).toFixed(1)}%`;
    summary += riskFlags.length
      ? ` | Risk Flags: ${riskFlags.join(", ")}`
      : " | No significant risk flags.";
    if (nextAppointment)
      summary += `\nNext Suggested Appointment: ${new Date(
        nextAppointment
      ).toLocaleDateString()}`;

    return summary;
  };

  // -------------------- Routes --------------------
  router.post("/risk-prediction", async (req, res) => {
    try {
      const { _id } = req.body;
      if (!_id || typeof _id !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Patient ID is required." });
      }

      const patient = await PatientModel.findById(_id)
        .populate("doctors", "doctorName _id")
        .populate("ward", "wardName _id");

      if (!patient)
        return res
          .status(404)
          .json({ success: false, message: "Patient not found." });

      const { riskScore, riskFlags } = computeRiskScore(patient);
      const nextAppointment = suggestNextAppointment(
        patient.admissionDate,
        riskScore
      );
      const summary = generatePatientSummary(
        patient,
        riskScore,
        riskFlags,
        nextAppointment
      );

      return res.json({
        success: true,
        patient,
        aiReport: {
          summary,
          riskScore,
          riskFlags,
          nextAppointment,
          treatmentNotes: patient.treatmentNotes || [],
          treatmentPlan: patient.treatmentPlan || [],
          lifestyleRecommendations: patient.lifestyleRecommendations || [],
        },
      });
    } catch (error) {
      console.error("❌ Error in /risk-prediction:", error);
      return res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  });

  router.post("/chat", async (req, res) => {
    try {
      const { userMessage, userRole, userId, messages } = req.body;

      // Use last message if userMessage not provided
      let userMsg = userMessage;
      if (!userMsg && Array.isArray(messages) && messages.length) {
        userMsg = messages[messages.length - 1].content;
      }

      if (!userMsg || typeof userMsg !== "string") {
        return res
          .status(400)
          .json({ error: "userMessage is required and must be a string" });
      }

      // -------------------- Fetch patient data safely --------------------
      let patientData = "";
      if (userRole === "patient" && userId) {
        const patient = await PatientModel.findById(userId)
          .populate("doctors", "doctorName _id")
          .populate("ward", "wardName _id");

        if (patient) {
          patientData += `Patient Info:\n`;
          patientData += `- Name: ${patient.patientName}\n`;
          patientData += `- Age: ${patient.age}\n`;
          patientData += `- Gender: ${patient.gender}\n`;
          patientData += `- Contact: ${patient.contact}\n`;
          patientData += `- Status: ${patient.status}\n`;
          patientData += `- Ward: ${patient.ward?.wardName || "N/A"}\n`;
          patientData += `- Doctors: ${
            patient.doctors?.map((d) => d.doctorName).join(", ") || "N/A"
          }\n`;
          patientData += `- Conditions: ${
            patient.conditions?.length > 0
              ? patient.conditions.join(", ")
              : "None"
          }\n`;

          // -------------------- Treatment Records --------------------
          const treatmentRecords = await TreatmentRecord.find({
            patientId: userId,
          })
            .sort({ admissionDate: -1 })
            .populate("doctorId", "doctorName")
            .populate("wardId", "wardName");
          if (treatmentRecords.length) {
            patientData += "\nTreatment Records:\n";
            treatmentRecords.forEach((t) => {
              patientData += `- Admission: ${new Date(
                t.admissionDate
              ).toLocaleDateString()}, Discharge: ${
                t.dischargeDate
                  ? new Date(t.dischargeDate).toLocaleDateString()
                  : "N/A"
              }, Doctor: ${t.doctorId?.doctorName || "N/A"}, Ward: ${
                t.wardId?.wardName || "N/A"
              }\n  Notes: ${t.treatmentDetails}\n`;
            });
          } else patientData += "\nNo treatment records.\n";

          // -------------------- Appointments --------------------
          const appointments =
            await appointmentController.fetchAppointmentsForAI(
              userId,
              "patient"
            );
          if (appointments.length) {
            patientData += "\nAppointments:\n";
            appointments.forEach((a) => {
              const date = a.appointmentDateTime
                ? new Date(a.appointmentDateTime).toISOString().split("T")[0]
                : "N/A";
              const doctorName = a.doctor?.name || "N/A";
              patientData += `- Date: ${date}, Doctor: ${doctorName}, Status: ${a.status}\n`;
            });
          } else patientData += "\nNo upcoming appointments.\n";

          // -------------------- Billing --------------------
          const bills = await billingController.fetchPatientBillsForAI(userId);
          if (bills.length) {
            patientData += "\nBills:\n";
            bills.forEach((b, index) => {
              const totalAmount = b.totalAmount != null ? b.totalAmount : 0;
              const balance = b.balance != null ? b.balance : 0;
              const status = b.status || "unpaid";
              patientData += `- Bill ${
                index + 1
              }: Total $${totalAmount}, Balance $${balance}, Status: ${status}\n`;
              if (b.items && b.items.length) {
                b.items.forEach((item) => {
                  patientData += `  • ${
                    item.description || "No description"
                  } | Qty: ${item.quantity || 0} | Unit $${
                    item.unitPrice || 0
                  } | Total $${item.totalPrice || 0}\n`;
                });
              }
            });
          } else patientData += "\nNo bills.\n";

          // -------------------- AI Risk Report --------------------
          const { riskScore, riskFlags } = computeRiskScore(patient);
          const nextAppointment = suggestNextAppointment(
            patient.admissionDate,
            riskScore
          );
          patientData += `\nAI Risk Score: ${(riskScore * 100).toFixed(1)}%`;
          patientData += riskFlags.length
            ? ` | Risk Flags: ${riskFlags.join(", ")}\n`
            : " | No significant risk flags\n";
          patientData += `Next Suggested Appointment: ${new Date(
            nextAppointment
          ).toLocaleDateString()}\n`;
        }
      }

      // -------------------- Build messages for OpenAI --------------------
      const chatMessages = [
        {
          role: "system",
          content: `You are a helpful hospital assistant. Use the following patient data to answer questions accurately:\n${patientData}`,
        },
        {
          role: "user",
          content: userMsg,
        },
      ];

      if (Array.isArray(messages) && messages.length)
        chatMessages.push(...messages);

      // -------------------- Call OpenAI --------------------
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
      });

      const responseText =
        completion.choices?.[0]?.message?.content || "No response";

      return res.json({ reply: responseText });
    } catch (error) {
      console.error("AI Chat Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ADD these imports at the top of aiController if not present:

  // If your filename is different, adjust the path above.

  // ... keep everything you already have in this file

  // -------------------- NEW: Admin metrics for AI Dashboard --------------------
  router.get("/admin/metrics", async (req, res) => {
    try {
      // Patients (w/ ward + doctors for richer metrics)
      const patients = await PatientModel.find({})
        .populate("ward", "wardName capacity occupiedBeds")
        .populate("doctors", "doctorName _id")
        .lean();

      // Wards
      const wards = await WardModel.find(
        {},
        "wardName capacity occupiedBeds"
      ).lean();

      // Billings
      const bills = await BillingModel.find({})
        .select("totalAmount balance status items")
        .lean();

      // -------- Compute/normalize patient risk on the fly (do NOT overwrite DB) --------
      const riskByPatient = patients.map((p) => {
        const { riskScore, riskFlags } = (() => {
          let risk = 0.1;
          const flags = [];
          if (Number(p.age) >= 60) {
            risk += 0.3;
            flags.push("elderly");
          }
          if ((p.status || "").toLowerCase() === "critical") {
            risk += 0.5;
            flags.push("critical_condition");
          }
          // very light jitter to avoid identical bars
          risk += (Math.random() - 0.5) * 0.06;
          risk = Math.min(Math.max(risk, 0), 1);
          return { riskScore: risk, riskFlags: flags };
        })();

        return {
          id: String(p._id),
          name: p.patientName,
          age: p.age || 0,
          gender: p.gender || "N/A",
          wardName: p.ward?.wardName || "N/A",
          status: p.status || "N/A",
          conditions: Array.isArray(p.conditions) ? p.conditions : [],
          risk: Number(riskScore.toFixed(4)),
          riskFlags,
        };
      });

      // -------- KPIs --------
      const totalPatients = patients.length;
      const avgRisk = riskByPatient.length
        ? riskByPatient.reduce((s, x) => s + x.risk, 0) / riskByPatient.length
        : 0;

      const highRiskCount = riskByPatient.filter((x) => x.risk >= 0.7).length;

      // Outstanding balance (sum of all bill balances)
      const outstandingBalance = bills.reduce(
        (sum, b) => sum + Number(b.balance || 0),
        0
      );

      // -------- Risk distribution buckets (for a small chart) --------
      const riskBuckets = [
        { name: "0–20%", count: 0 },
        { name: "20–40%", count: 0 },
        { name: "40–60%", count: 0 },
        { name: "60–80%", count: 0 },
        { name: "80–100%", count: 0 },
      ];
      riskByPatient.forEach((x) => {
        const pct = x.risk * 100;
        if (pct < 20) riskBuckets[0].count++;
        else if (pct < 40) riskBuckets[1].count++;
        else if (pct < 60) riskBuckets[2].count++;
        else if (pct < 80) riskBuckets[3].count++;
        else riskBuckets[4].count++;
      });

      // -------- Ward occupancy (real, not random) --------
      const wardOccupancy = wards.map((w) => {
        const capacity = Number(w.capacity || 0);
        const occupied = Number(w.occupiedBeds || 0);
        const percent =
          capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
        return {
          id: String(w._id),
          name: w.wardName,
          occupied,
          capacity,
          percent,
        };
      });

      // -------- Gender breakdown --------
      const genderTally = patients.reduce((acc, p) => {
        const g = (p.gender || "Unknown").toString();
        acc[g] = (acc[g] || 0) + 1;
        return acc;
      }, {});
      const genderBreakdown = Object.entries(genderTally).map(([k, v]) => ({
        name: k,
        value: v,
      }));

      // -------- Age buckets --------
      const ageBuckets = [
        { name: "0–17", count: 0 },
        { name: "18–39", count: 0 },
        { name: "40–59", count: 0 },
        { name: "60+", count: 0 },
      ];
      patients.forEach((p) => {
        const age = Number(p.age || 0);
        if (age < 18) ageBuckets[0].count++;
        else if (age < 40) ageBuckets[1].count++;
        else if (age < 60) ageBuckets[2].count++;
        else ageBuckets[3].count++;
      });

      // -------- Top conditions (frequency) --------
      const conditionMap = new Map();
      patients.forEach((p) => {
        (Array.isArray(p.conditions) ? p.conditions : []).forEach((c) => {
          const key = String(c).trim();
          if (!key) return;
          conditionMap.set(key, (conditionMap.get(key) || 0) + 1);
        });
      });
      const topConditions = Array.from(conditionMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([name, count]) => ({ name, count }));

      // -------- High-risk table (top 10) --------
      const highRiskPatients = [...riskByPatient]
        .sort((a, b) => b.risk - a.risk)
        .slice(0, 10);

      // -------- Risk by patient (for your existing bar chart) --------
      const riskByPatientChart = riskByPatient.map((p) => ({
        name: p.name,
        risk: p.risk, // 0..1
      }));

      return res.json({
        success: true,
        kpis: {
          totalPatients,
          avgRisk,
          highRiskCount,
          outstandingBalance,
        },
        charts: {
          riskByPatient: riskByPatientChart,
          riskDistribution: riskBuckets,
          wardOccupancy,
          genderBreakdown,
          ageBuckets,
          topConditions,
        },
        tables: {
          highRiskPatients,
        },
      });
    } catch (err) {
      console.error("AI /admin/metrics error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to compute AI admin metrics.",
        error: err.message,
      });
    }
  });

  return router;
};
