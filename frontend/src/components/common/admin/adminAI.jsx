import React, { useState, useEffect } from "react";
import "./AdminAi.css";
import { fetchData } from "../../../utils/api";
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

// Format numbers with commas
const numberFmt = (n) =>
  typeof n === "number" ? n.toLocaleString() : String(n || 0);

// Format percentages
const pctFmt = (v) => `${(Number(v) * 100).toFixed(1)}%`;

const AdminAIDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [doctorMap, setDoctorMap] = useState({}); // Map doctor _id => name

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch patients
        const pRes = await fetchData("patient/getAllPatients");
        if (pRes?.success) setPatients(pRes.patients || []);

        // Fetch all doctors
        const dRes = await fetchData("doctor/getAllDoctors");
        if (dRes?.success) {
          const map = {};
          dRes.doctors.forEach((d) => (map[d._id] = d.name));
          setDoctorMap(map);
        }

        // Fetch AI metrics
        const mRes = await fetchData("ai/admin/metrics");
        if (mRes?.success) setMetrics(mRes);
      } catch (e) {
        console.error("AI Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  // Prepare chart data
  const riskTrendData =
    metrics?.charts?.riskByPatient ||
    patients.map((p) => ({ name: p.patientName, risk: p.aiRiskScore || 0 }));

  const wardOccupancyData = metrics?.charts?.wardOccupancy || [];
  const riskDistributionData = metrics?.charts?.riskDistribution || [];
  const topConditionsData = metrics?.charts?.topConditions || [];
  const highRiskRows = metrics?.tables?.highRiskPatients || [];

  return (
    <div className="admin-ai-container">
      <h1>Admin AI Dashboard</h1>

      {/* KPI tiles */}
      <div className="kpis">
        <div className="kpi">
          <div className="kpi-label">Total Patients</div>
          <div className="kpi-value">
            {numberFmt(metrics?.kpis?.totalPatients || patients.length)}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Average Risk</div>
          <div className="kpi-value">{pctFmt(metrics?.kpis?.avgRisk || 0)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">High-Risk Patients</div>
          <div className="kpi-value">
            {numberFmt(metrics?.kpis?.highRiskCount || 0)}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Outstanding Balance</div>
          <div className="kpi-value">
            ${numberFmt(metrics?.kpis?.outstandingBalance || 0)}
          </div>
        </div>
      </div>

      {/* Patient cards */}
      <div className="patients-list">
        {patients.map((p) => (
          <div className="patient-card" key={p._id}>
            <div className="avatar">
              {p.image ? (
                <img src={p.image} alt={p.patientName} />
              ) : (
                p.patientName.charAt(0)
              )}
            </div>
            <h2>{p.patientName}</h2>
            <p>Age: {p.age}</p>
            <p>Gender: {p.gender}</p>
            <p>Ward: {p.ward?.wardName || "N/A"}</p>
            <p>
              Doctors:{" "}
              {p.doctors?.length
                ? p.doctors.map((d) => doctorMap[d._id] || d._id).join(", ")
                : "None"}
            </p>
            <p>
              Status:{" "}
              <span
                className={`status ${
                  p.status === "Admitted" ? "admitted" : "discharged"
                }`}
              >
                {p.status}
              </span>
            </p>
            <p>
              Conditions:{" "}
              {p.conditions?.length ? p.conditions.join(", ") : "None"}
            </p>
            <p>
              AI Risk Score:{" "}
              {typeof p.aiRiskScore === "number"
                ? pctFmt(p.aiRiskScore)
                : "N/A"}
            </p>
            <p>AI Summary: {p.aiReportSummary || "N/A"}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="chart-container">
          <h3>AI Risk by Patient</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip formatter={(v) => pctFmt(v)} />
              <Bar dataKey="risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Ward Occupancy</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={wardOccupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v, k) => (k === "percent" ? `${v}%` : v)} />
              <Legend />
              <Bar dataKey="occupied" name="Occupied" />
              <Bar dataKey="capacity" name="Capacity" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={riskDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line dataKey="count" name="Patients" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Top Conditions</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topConditionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High-risk table */}
      <div className="table-container">
        <h3>High-Risk Patients (Top 10)</h3>
        <div className="table">
          <div className="thead">
            <div>Name</div>
            <div>Risk</div>
            <div>Ward</div>
            <div>Status</div>
            <div>Flags</div>
            <div>Conditions</div>
            <div>Doctors</div>
          </div>
          <div className="tbody">
            {highRiskRows.length ? (
              highRiskRows.map((r) => (
                <div className="tr" key={r.id}>
                  <div>{r.name}</div>
                  <div>{pctFmt(r.risk)}</div>
                  <div>{r.wardName}</div>
                  <div>{r.status}</div>
                  <div>{r.riskFlags?.join(", ") || "-"}</div>
                  <div>{r.conditions?.join(", ") || "-"}</div>
                  <div>
                    {r.doctors
                      ?.map((d) => doctorMap[d._id] || d._id)
                      .join(", ") || "None"}
                  </div>
                </div>
              ))
            ) : (
              <div className="tr">
                <div colSpan={7} style={{ gridColumn: "1 / -1" }}>
                  No high-risk patients.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAIDashboard;
