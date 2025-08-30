import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/v1"; // Adjust to your backend URL

const handleApiError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (status === 401 || status === 403 || message?.includes("No User Found!")) {
    console.warn("Auth error detected, redirecting to login...");
    // window.location.href = "/";
  }

  console.error("API Error:", error.response?.data || error.message);
  throw error;
};

export const fetchData = async (
  endpoint,
  method = "GET",
  body = null,
  headers = {}
) => {
  try {
    const response = await axios({
      url: `${API_BASE_URL}/${endpoint}`,
      method,
      data: body,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteData = async (endpoint, headers = {}) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const postData = async (endpoint, body, headers = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${endpoint}`, body, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateData = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json();
      if (
        response.status === 401 ||
        response.status === 403 ||
        errData?.message?.includes("No User Found!")
      ) {
        window.location.href = "/";
      }
      throw new Error(errData?.message || "Failed to update data");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch API Error:", error.message);
    throw error;
  }
};

/** ===================== NOTIFICATION API ===================== **/

// Admin Notifications
export const getAdminNotifications = async () =>
  fetchData("notification/admin");
export const markAdminNotificationRead = async (id) =>
  updateData(`notifications/admin/mark-as-read/${id}`, {});
export const markAllAdminNotificationsRead = async () =>
  updateData("notifications/admin/mark-all-as-read", {});

// Patient Notifications
export const getPatientNotifications = async (patientId) =>
  fetchData(`notifications/patient/${patientId}`);
export const markPatientNotificationRead = async (id) =>
  updateData(`notifications/patient/mark-as-read/${id}`, {});
export const markAllPatientNotificationsRead = async (patientId) =>
  updateData(`notifications/patient/mark-all-as-read/${patientId}`, {});

/** ===================== TREATMENT RECORDS API ===================== **/

// Get all treatment records
export const getAllTreatmentRecords = async () =>
  fetchData("treatmentRecord/treatmentRecords");

// Get single treatment record by ID
export const getSingleTreatmentRecord = async (id) =>
  fetchData(`treatmentRecord/treatmentRecords/${id}`);

// Get all treatment records for a specific patient
export const getTreatmentRecordsByPatient = async (patientId) =>
  fetchData(`treatmentRecord/treatmentRecords/patient/${patientId}`);

// Add a new treatment record
export const addTreatmentRecord = async (data) =>
  postData("treatmentRecord/treatmentRecord", data);

// Update a treatment record
export const updateTreatmentRecord = async (id, data) =>
  updateData(`treatmentRecord/treatmentRecords/${id}`, data);

// Delete a treatment record
export const deleteTreatmentRecord = async (id) =>
  deleteData(`treatmentRecord/treatmentRecords/${id}`);

/** ===================== BILLING API ===================== **/

// Get all bills for Admin
export const getAllBillsForAdmin = async () => fetchData("billing/admin/all");

// Get all bills for a patient
export const getPatientBills = async (patientId) =>
  fetchData(`billing/patient/${patientId}`);

// Create a new bill
export const createBill = async (data) => postData("billing", data);

// Add payment to a bill
export const addPayment = async (id, data) =>
  updateData(`billing/payment/${id}`, data);

// Get invoice by bill ID
export const getInvoiceByBill = async (billId) =>
  fetchData(`billing/invoice/${billId}`);

// Get audit logs for a bill
export const getAuditLogsByBill = async (billId) =>
  fetchData(`billing/auditlogs/${billId}`);

// Get billing history for a patient
export const getBillingHistory = async (patientId) =>
  fetchData(`billing/history/${patientId}`);

/** ===================== APPOINTMENTS API ===================== **/

// Get all appointments (optional filters: userId & role)
export const getAppointments = async (userId = null, role = null) => {
  let endpoint = "appointment/appointments";
  if (userId && role) {
    endpoint += `?userId=${userId}&role=${role}`;
  }
  return fetchData(endpoint);
};

// Get single appointment by ID
export const getSingleAppointment = async (id) =>
  fetchData(`appointment/${id}`);

// Create a new appointment
export const createAppointment = async (data) =>
  postData("appointment/createAppointment", data);

// Update appointment status (Confirm, Cancel, etc.)
export const updateAppointmentStatus = async (id, status) =>
  updateData(`appointment/${id}/status`, { status });

// Delete appointment
export const deleteAppointment = async (id) => deleteData(`appointment/${id}`);

// -------------------- CHATBOT API --------------------
export const sendChatMessage = async ({
  userMessage,
  userRole,
  userId,
  messages,
}) => {
  try {
    const chatMessages =
      Array.isArray(messages) && messages.length > 0
        ? messages
        : [{ role: "user", content: userMessage }];

    const response = await fetch("http://localhost:4000/api/v1/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage,
        userRole,
        userId,
        messages: chatMessages,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData?.error || "Failed to send chat message");
    }

    return await response.json(); // { reply: "..." }
  } catch (error) {
    console.error("Chatbot error:", error.message);
    throw error;
  }
};

// Send patient data for risk prediction
export const getPatientRiskPrediction = async (patientData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/ai/risk-prediction`,
      patientData,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch AI-generated patient summary
export const fetchPatientSummary = async (patientId) => {
  try {
    const response = await sendChatMessage({
      userMessage:
        "Generate a detailed summary of my medical history, treatments, and appointments.",
      userRole: "patient",
      userId: patientId,
      messages: [],
    });
    return response.reply; // The AI-generated summary
  } catch (error) {
    console.error("Error fetching patient summary:", error.message);
    return "Unable to fetch patient summary at the moment.";
  }
};
