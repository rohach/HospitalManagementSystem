const express = require("express");

// Controllers
const appointmentController = require("../controllers/appointmentController");
const billingController = require("../controllers/billingController");

module.exports = function (openai) {
  const router = express.Router();

  /**
   * POST /api/v1/ai/chat
   * Body: { userMessage, userRole, userId, messages? }
   * Returns: { reply: string }
   */
  router.post("/chat", async (req, res) => {
    try {
      const { userMessage, userRole, userId, messages } = req.body;

      if (!userMessage || typeof userMessage !== "string") {
        return res
          .status(400)
          .json({ error: "userMessage is required and must be a string" });
      }

      let patientData = "";

      // Fetch real patient data if role is "patient"
      if (userRole === "patient" && userId) {
        const appointments = await appointmentController.getAppointments(
          userId,
          "patient"
        );
        const bills = await billingController.getPatientBills(userId);

        patientData += "Patient Data (from MyHospital HMS):\n";

        if (appointments.length > 0) {
          patientData += "Appointments:\n";
          appointments.forEach((a) => {
            patientData += `- Date: ${a.date}, Doctor: ${a.doctorName}\n`;
          });
        } else {
          patientData += "No upcoming appointments.\n";
        }

        if (bills.length > 0) {
          patientData += "Bills:\n";
          bills.forEach((b) => {
            patientData += `- Amount: $${b.amount}, Due: ${b.dueDate}, Status: ${b.status}\n`;
          });
        } else {
          patientData += "No bills.\n";
        }
      }

      // Prepare OpenAI messages
      const chatMessages = [
        {
          role: "system",
          content: `You are a helpful hospital assistant. Use the following patient data to answer questions accurately:\n${patientData}`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ];

      // Append any previous messages if provided
      if (Array.isArray(messages) && messages.length > 0) {
        // Ensure all messages have content
        messages.forEach((msg) => {
          if (!msg.content) msg.content = "";
        });
        chatMessages.push(...messages);
      }

      // Call OpenAI
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

  return router;
};
