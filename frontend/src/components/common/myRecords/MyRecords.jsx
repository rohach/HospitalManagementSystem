import React, { useEffect, useState } from "react";
import axios from "axios";
import "./records.css";

const MyRecords = ({ userData }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_BASE_URL = "http://localhost:4000/api/v1";

  const fetchRecords = async () => {
    if (!userData?._id) return;
    setLoading(true);
    setError(false);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/treatmentRecord/treatmentRecords/patient/${userData._id}`
      );
      setRecords(res.data?.treatmentRecords || []);
    } catch (err) {
      console.error("Failed to fetch treatment records", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [userData._id]);

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

  if (loading)
    return <p className="status-message">Loading your treatment records...</p>;
  if (error)
    return (
      <p className="status-message error">Failed to load treatment records.</p>
    );

  return (
    <div className="my-records-container">
      <h2>My Treatment Records</h2>
      {records.length === 0 ? (
        <p className="status-message">No treatment records found.</p>
      ) : (
        <div className="table-responsive">
          <table className="records-table">
            <thead>
              <tr>
                <th>Admission Date</th>
                <th>Ward</th>
                <th>Doctor</th>
                <th>Treatment Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td>{formatDate(record.admissionDate)}</td>
                  <td>{record.wardId?.wardName || "N/A"}</td>
                  <td>{record.doctorId?.name || "N/A"}</td>
                  <td>{record.treatmentDetails || "N/A"}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        record.transferred ? "transferred" : "admitted"
                      }`}
                    >
                      {record.transferred ? "Transferred" : "Admitted"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRecords;
