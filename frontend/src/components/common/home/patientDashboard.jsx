import React, { useEffect, useState } from "react";
import { fetchData } from "../../../utils/api";
import Loading from "../../pages/Loading";
import Error from "../../pages/Error";
import "./patientDashboard.css";

const PatientDashboard = ({ userData }) => {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Get patient ID from props or localStorage
  const patientId =
    userData?._id || JSON.parse(localStorage.getItem("user"))?._id;

  useEffect(() => {
    const getPatientData = async () => {
      if (!patientId) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchData(`patient/getSinglePatient/${patientId}`);
        setPatient(data.patient || null);
        setRecords(data.patient?.treatmentRecords || []);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getPatientData();
  }, [patientId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <Error message="Unable to load your dashboard. Please try again later." />
    );

  return (
    <div className="container patientDashboard">
      {/* Overview Section */}
      <div className="overview">
        <p className="title">My Overview</p>
        <div className="overview_inner">
          <div className="box">
            <p>Assigned Doctor(s)</p>
            <p className="box_count">
              {patient?.doctors?.length
                ? patient.doctors.map((doc) => `${doc.name}`).join(", ")
                : "N/A"}
            </p>
          </div>
          <div className="box">
            <p>Admitted Ward</p>
            <p className="box_count">{patient?.ward?.wardName || "N/A"}</p>
          </div>
          <div className="box">
            <p>Treatment History</p>
            <p className="box_count">{records.length}</p>
          </div>
          <div className="box">
            <p>Status</p>
            <p
              className={`status-badge ${
                patient?.status === "Admitted" ? "admitted" : "discharged"
              }`}
            >
              {patient?.status || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Treatment Records */}
      <div className="records">
        <p className="title">My Treatment Records</p>
        <div className="table_responsive">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Doctor</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record) => (
                  <tr key={record._id}>
                    <td>{formatDate(record.createdAt)}</td>
                    <td>{record.doctorName || "N/A"}</td>
                    <td>{record.notes || "N/A"}</td>
                    <td>{record.status || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", fontWeight: "bold" }}
                  >
                    No treatment records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
