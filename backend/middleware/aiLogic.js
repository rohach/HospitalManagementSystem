// Mock AI logic to simulate risk prediction, report generation, and scheduling

/**
 * Mock risk prediction based on age and status
 * Returns risk score 0.0 to 1.0 and risk flags array
 */
function mockRiskPrediction(patient) {
  let riskScore = 0.1; // baseline low risk
  const riskFlags = [];

  if (patient.age >= 60) {
    riskScore += 0.3;
    riskFlags.push("elderly");
  }

  if (patient.status && patient.status.toLowerCase() === "critical") {
    riskScore += 0.5;
    riskFlags.push("critical_condition");
  }

  // Add some randomness +/- 0.1
  riskScore += (Math.random() - 0.5) * 0.2;
  riskScore = Math.min(Math.max(riskScore, 0), 1); // clamp between 0 and 1

  return { riskScore, riskFlags };
}

/**
 * Mock AI-generated report summary based on risk and patient info
 */
function mockAIReportSummary(patient, riskScore, riskFlags) {
  let summary = `Patient ${patient.patientName} is a ${patient.age}-year-old ${patient.gender}. `;

  if (riskScore > 0.7) {
    summary += "Patient is at high risk due to ";
  } else if (riskScore > 0.4) {
    summary += "Patient has moderate risk factors including ";
  } else {
    summary += "Patient is currently low risk with ";
  }

  if (riskFlags.length > 0) {
    summary += riskFlags.join(", ") + ".";
  } else {
    summary += "no significant risk flags.";
  }

  return summary;
}

/**
 * Mock smart scheduling: suggest next appointment date based on risk score and admission date
 */
function mockSmartScheduling(admissionDate, riskScore) {
  const baseDays = 30; // base interval for appointment

  // Higher risk → sooner appointment
  let daysUntilNext = baseDays;
  if (riskScore > 0.7) daysUntilNext = 7;
  else if (riskScore > 0.4) daysUntilNext = 14;

  const nextAppointment = new Date(admissionDate);
  nextAppointment.setDate(nextAppointment.getDate() + daysUntilNext);
  return nextAppointment;
}
