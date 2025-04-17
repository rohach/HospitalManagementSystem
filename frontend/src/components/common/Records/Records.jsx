import React, { useEffect, useState } from "react";
import "./records.css";
import { deleteData, fetchData } from "../../../utils/api";
import Loading from "../../pages/Loading";
import Error from "../../pages/Error";
import { Link } from "react-router-dom";

const Records = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getRecords = async () => {
      try {
        const data = await fetchData("treatmentRecord/treatmentRecords");
        setRecords(data.treatmentRecords);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    getRecords();
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Handle undefined/null values

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A"; // Ensure it's a valid date

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <Error />;
  }
  const deleteRecord = async (recordId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this treatment record?"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const response = await deleteData(
        `treatmentRecord/treatmentRecords/${recordId}`
      );
      console.log("Treatment record deleted successfully!", response);

      setRecords((prevRecords) =>
        prevRecords.filter((record) => record._id !== recordId)
      );
    } catch (error) {
      console.error("Failed to delete treatment record:", error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container record_container">
      <Link to="/">
        <button className="back_home">
          <i className="fa-solid fa-arrow-left"> </i> Back To Home
        </button>
      </Link>
      <h2>View All Records</h2>
      <table id="customers">
        <thead>
          <tr>
            <th>Name</th>
            <th>Admitted Date</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Ward</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Doctor</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((record) => (
              <tr key={record._id}>
                <td>{record.patientId?.patientName || "N/A"}</td>
                <td>{formatDate(record.admissionDate)}</td>
                <td>{record.patientId?.gender || "N/A"}</td>
                <td>{record.patientId?.age || "N/A"}</td>
                <td>{record.wardId?.wardName || "N/A"}</td>
                <td>{record.patientId?.contact || "N/A"}</td>
                <td>
                  <span
                    className={`status-badge ${
                      record.transferred ? "transferred" : "admitted"
                    }`}
                  >
                    {record.transferred ? "Transferred" : "Admitted"}
                  </span>
                </td>
                <td>{record.doctorId?.name || "N/A"}</td>
                <td className="action_button_div">
                  {/* <Link to={`/update/${record._id}`}>
                    <button className="action_button" title="Edit">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                  </Link> */}
                  <button
                    className="action_button"
                    title="Delete"
                    onClick={() => deleteRecord(record._id)}
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="9"
                style={{
                  textAlign: "center",
                  padding: "10px",
                  fontWeight: "bold",
                }}
              >
                No record data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Records;
