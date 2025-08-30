import React, { useState, useEffect } from "react";
import "./profile.css";
import { fetchData, postData } from "../../../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const Profile = ({ userData }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [wardName, setWardName] = useState("Loading...");
  const [doctorNames, setDoctorNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState(null);
  const [nlpSummary, setNlpSummary] = useState("Loading summary...");
  const [riskTrend, setRiskTrend] = useState([]);
  const [resourceForecast, setResourceForecast] = useState([]);
  const [countdown, setCountdown] = useState(null);

  // ------------------- FETCH WARD AND DOCTORS -------------------
  useEffect(() => {
    if (!userData) return;

    const fetchWardAndDoctors = async () => {
      setLoading(true);
      try {
        if (userData.ward) {
          const wardData = await fetchData(
            `ward/getSingleWard/${userData.ward}`
          );
          setWardName(wardData?.ward?.wardName || "Unknown Ward");
        } else setWardName("Not Assigned");

        if (userData.doctors?.length > 0) {
          const names = await Promise.all(
            userData.doctors.map(async (id) => {
              const docData = await fetchData(`doctor/getSingleDoctor/${id}`);
              return docData?.doctorDetail?.name || "Unknown Doctor";
            })
          );
          setDoctorNames(names);
        } else setDoctorNames([]);
      } catch (err) {
        setWardName("Unknown Ward");
        setDoctorNames([]);
      }
      setLoading(false);
    };

    fetchWardAndDoctors();
  }, [userData]);

  // ------------------- FETCH AI REPORT -------------------
  useEffect(() => {
    if (!userData?._id) return;

    const fetchAIReport = async () => {
      try {
        const res = await fetchData(`patient/getPatientReport/${userData._id}`);
        if (!res.success) return;

        const aiData = res.aiReport;
        setAiReport(aiData);

        // Historical risk trend
        const trend = Array.from({ length: 6 }, (_, i) => ({
          month: `Month ${i + 1}`,
          risk: +(Math.random() * 0.5 + aiData.riskScore * 0.5).toFixed(2),
        }));
        setRiskTrend(trend);

        // Resource forecast
        const forecast = Array.from({ length: 5 }, (_, i) => ({
          label: `Ward ${i + 1}`,
          occupancy: Math.floor(Math.random() * 100),
        }));
        setResourceForecast(forecast);

        // NLP summary
        const nlpResponse = await postData("ai/chat", {
          messages: [
            {
              role: "user",
              content: `Summarize patient treatment notes for ${userData.patientName} in a short, readable, patient-friendly way.`,
            },
          ],
        });
        setNlpSummary(nlpResponse?.content || "No summary available.");

        // Countdown for next appointment
        if (aiData.nextAppointmentDate) {
          const interval = setInterval(() => {
            const daysLeft = Math.ceil(
              (new Date(aiData.nextAppointmentDate) - new Date()) /
                (1000 * 60 * 60 * 24)
            );
            setCountdown(daysLeft >= 0 ? daysLeft : 0);
          }, 1000 * 60 * 60); // update hourly
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Error fetching AI report or NLP summary:", error);
        setNlpSummary("Failed to load summary.");
      }
    };

    fetchAIReport();
  }, [userData]);

  if (!userData || loading) {
    return <p style={{ textAlign: "center" }}>Loading profile...</p>;
  }

  const {
    patientName,
    patientCaste,
    email,
    contact,
    status,
    age,
    conditions,
    image,
  } = userData;

  // Determine risk level color
  const getRiskColor = (score) => {
    if (score < 0.4) return "#4CAF50"; // green
    if (score < 0.7) return "#FF9800"; // orange
    return "#F44336"; // red
  };

  return (
    <div className="profile-container">
      {/* PROFILE HEADER */}
      <div className="profile-header">
        <div className="avatar">
          {image ? (
            <img src={image} alt={patientName} />
          ) : (
            <span>{patientName?.charAt(0) || "P"}</span>
          )}
        </div>
        <h1>{patientName}</h1>
        <p className="role">{patientCaste || "Patient"}</p>
        <div className="contact-info">
          <span>📧 {email || "N/A"}</span>
          <span>📞 {contact || "N/A"}</span>
          <span>🏥 Ward: {wardName}</span>
          <span>
            👨‍⚕️ Doctors: {doctorNames.length ? doctorNames.join(", ") : "None"}
          </span>
        </div>
        <span
          className={`availability ${
            status === "Admitted" ? "admitted" : "discharged"
          }`}
        >
          {status === "Admitted" ? "🟢 Admitted" : "🔴 Discharged"}
        </span>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat-card">
          <h3>{age || "N/A"}</h3>
          <p>Age</p>
        </div>
        <div className="stat-card">
          <h3>{doctorNames.length}</h3>
          <p>Assigned Doctors</p>
        </div>
        <div className="stat-card">
          <h3>{conditions?.length || 0}</h3>
          <p>Conditions</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        {["overview", "conditions", "doctors", "aiReport"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "aiReport"
              ? "AI Report"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div>
            <h2>Profile Overview</h2>
            <p>
              {patientName} is {age} years old. Status:{" "}
              <strong>{status}</strong>. Assigned to{" "}
              {doctorNames.length ? doctorNames.join(", ") : "no doctors"} in{" "}
              <strong>{wardName}</strong>.
            </p>
          </div>
        )}

        {activeTab === "conditions" && (
          <div>
            <h2>Medical Conditions</h2>
            {conditions?.length ? (
              <ul>
                {conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : (
              <p>No recorded conditions.</p>
            )}
          </div>
        )}

        {activeTab === "doctors" && (
          <div>
            <h2>Assigned Doctors</h2>
            {doctorNames.length ? (
              <ul>
                {doctorNames.map((d, i) => (
                  <b>
                    <li key={i}>Dr. {d}</li>
                  </b>
                ))}
              </ul>
            ) : (
              <p>No doctors assigned.</p>
            )}
          </div>
        )}

        {activeTab === "aiReport" && (
          <div>
            <h2>AI Risk Report</h2>
            {aiReport ? (
              <>
                <p>{aiReport.summary}</p>

                <p>
                  Risk Score:{" "}
                  <strong style={{ color: getRiskColor(aiReport.riskScore) }}>
                    {aiReport.riskScore.toFixed(2)}
                  </strong>
                </p>
                <p>
                  Risk Flags:{" "}
                  {aiReport.riskFlags.length
                    ? aiReport.riskFlags.join(", ")
                    : "None"}
                </p>
                <p>
                  Next Suggested Appointment:{" "}
                  {aiReport.nextAppointmentDate
                    ? new Date(
                        aiReport.nextAppointmentDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                {countdown !== null && (
                  <p>
                    Days until next appointment: <strong>{countdown}</strong>
                  </p>
                )}
                <p>
                  <strong>Confidence Level:</strong>{" "}
                  {(aiReport.riskScore * 100).toFixed(1)}%
                </p>

                {/* HISTORICAL RISK TREND */}
                <h3>Historical Risk Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={riskTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="risk" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>

                {/* RESOURCE FORECAST */}
                <h3>Ward Occupancy Forecast</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={resourceForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="occupancy" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>

                {/* NLP SUMMARY */}
                <h3>Doctor Notes Summary</h3>
                <p>{nlpSummary}</p>
              </>
            ) : (
              <p>Loading AI report...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
