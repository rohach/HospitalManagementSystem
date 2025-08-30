import React, { useEffect, useState } from "react";
import "./records.css";
import {
  deleteData,
  fetchData,
  postData,
  updateData,
} from "../../../utils/api";
import Loading from "../../pages/Loading";
import Error from "../../pages/Error";
import { Link } from "react-router-dom";

const Records = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editRecordId, setEditRecordId] = useState(null);
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    wardId: "",
    treatmentDetails: "",
  });

  // Fetch all data: patients, doctors, wards, records
  const getData = async () => {
    try {
      setLoading(true);
      const patientsRes = await fetchData("patient/getAllPatients");
      const doctorsRes = await fetchData("doctor/getAllDoctors");
      const wardsRes = await fetchData("ward/getAllWards");
      const recordsRes = await fetchData("treatmentRecord/treatmentRecords");

      setPatients(patientsRes.patients || []);
      setDoctors(doctorsRes.doctors || []);
      setWards(wardsRes.wards || []);
      setRecords(recordsRes.treatmentRecords || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new record
  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (
      !formData.patientId ||
      !formData.doctorId ||
      !formData.treatmentDetails
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await postData("treatmentRecord/treatmentRecords", formData);
      setFormData({
        patientId: "",
        doctorId: "",
        wardId: "",
        treatmentDetails: "",
      });
      await getData();
    } catch (err) {
      console.error(err);
      alert("Failed to add record.");
    }
  };

  // Edit record
  const handleEditClick = (record) => {
    setEditRecordId(record._id);
    setFormData({
      patientId: record.patientId?._id || "",
      doctorId: record.doctorId?._id || "",
      wardId: record.wardId?._id || "",
      treatmentDetails: record.treatmentDetails || "",
    });
  };

  // Update record
  const handleUpdateRecord = async (recordId) => {
    try {
      await updateData(
        `treatmentRecord/treatmentRecords/${recordId}`,
        formData
      );
      setEditRecordId(null);
      setFormData({
        patientId: "",
        doctorId: "",
        wardId: "",
        treatmentDetails: "",
      });
      await getData();
    } catch (err) {
      console.error(err);
      alert("Failed to update record.");
    }
  };

  // Delete record
  const deleteRecord = async (recordId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this treatment record?"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      await deleteData(`treatmentRecord/treatmentRecords/${recordId}`);
      setRecords((prevRecords) =>
        prevRecords.filter((r) => r._id !== recordId)
      );
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error />;

  return (
    <div className="container record_container">
      <Link to="/">
        <button className="back_home">
          <i className="fa-solid fa-arrow-left"> </i> Back To Home
        </button>
      </Link>

      {/* Add / Edit Form */}
      <h2>{editRecordId ? "Edit Treatment Record" : "Add Treatment Record"}</h2>
      <form
        className="add-record-form"
        onSubmit={(e) => {
          e.preventDefault();
          editRecordId ? handleUpdateRecord(editRecordId) : handleAddRecord(e);
        }}
      >
        <select
          name="patientId"
          value={formData.patientId}
          onChange={handleFormChange}
          required
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.patientName}
            </option>
          ))}
        </select>

        <select
          name="doctorId"
          value={formData.doctorId}
          onChange={handleFormChange}
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          name="wardId"
          value={formData.wardId}
          onChange={handleFormChange}
        >
          <option value="">Select Ward (Optional)</option>
          {wards.map((w) => (
            <option key={w._id} value={w._id}>
              {w.wardName || w.name}
            </option>
          ))}
        </select>

        <textarea
          name="treatmentDetails"
          placeholder="Treatment Details"
          value={formData.treatmentDetails}
          onChange={handleFormChange}
          required
        />

        <button type="submit" className="btn-add">
          {editRecordId ? "Update Record" : "Add Record"}
        </button>
        {editRecordId && (
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              setEditRecordId(null);
              setFormData({
                patientId: "",
                doctorId: "",
                wardId: "",
                treatmentDetails: "",
              });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Records Table */}
      <h2>View All Records</h2>
      <div className="table_responsive">
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
              <th>Treatment History</th>
              <th>Actions</th>
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
                  <td>{record.treatmentDetails || "N/A"}</td>
                  <td className="action_button_div">
                    <button
                      className="action_button"
                      title="Edit"
                      onClick={() => handleEditClick(record)}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
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
                  colSpan="10"
                  style={{ textAlign: "center", fontWeight: "bold" }}
                >
                  No record data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Records;
