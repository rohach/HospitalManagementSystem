import React, { useEffect, useState } from "react";
import "./patient.css";
import {
  deleteData,
  fetchData,
  postData,
  updateData,
} from "../../../utils/api";
import Error from "../../pages/Error";
import Loading from "../../pages/Loading";
import ToastifyComponent, { notify } from "../../pages/ToastMessage";
import defaultImage from "../../assets/default.webp";
import { Link } from "react-router-dom";

const InputField = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
  pattern,
  title,
}) => (
  <>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      pattern={pattern}
      title={title}
    />
  </>
);

const Patients = ({ userRole, userData }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [wards, setWards] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [patientData, setPatientData] = useState({
    patientName: "",
    patientCaste: "",
    contact: "",
    email: "",
    address: "",
    gender: "",
    status: "",
    ward: "",
    doctors: [],
    age: "",
    password: "",
    conditions: [], // <-- added
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(false);
      try {
        const [patientsRes, wardsRes, doctorsRes] = await Promise.all([
          fetchData("patient/getAllPatients"),
          fetchData("ward/getAllWards"),
          fetchData("doctor/getAllDoctors"),
        ]);
        setPatients(patientsRes.patients || []);
        setWards(wardsRes.wards || []);
        setDoctors(doctorsRes.doctors || []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoctorChange = (e) => {
    const { value, checked } = e.target;
    setPatientData((prev) => {
      const updatedDoctors = checked
        ? [...prev.doctors, value]
        : prev.doctors.filter((id) => id !== value);
      return { ...prev, doctors: updatedDoctors };
    });
  };

  const resetForm = () => {
    setPatientData({
      patientName: "",
      patientCaste: "",
      contact: "",
      email: "",
      address: "",
      gender: "",
      status: "",
      ward: "",
      doctors: [],
      age: "",
      password: "",
      conditions: [],
    });
    setEditing(false);
    setEditId(null);
    setOpenPopup(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientData.ward) {
      notify("Please select a ward", "error");
      return;
    }
    if (patientData.doctors.length === 0) {
      notify("Please assign at least one doctor", "error");
      return;
    }
    if (!editing && !patientData.password) {
      notify("Password is required for new patients", "error");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (editing && editId) {
        response = await updateData(
          `patient/getSinglePatient/${editId}`,
          patientData
        );
        notify("Patient updated successfully!", "success");
        setPatients((prev) =>
          prev.map((p) =>
            p._id === editId ? { ...p, ...response.patient } : p
          )
        );
      } else {
        response = await postData("patient/registerPatient", patientData);
        notify(response?.message || "Patient added successfully", "success");
        setPatients((prev) => [...prev, response.patient]);
      }
      resetForm();
    } catch (err) {
      notify(
        err.response?.data?.message || "Operation failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setEditing(true);
    setEditId(patient._id);
    setPatientData({
      patientName: patient.patientName || "",
      patientCaste: patient.patientCaste || "",
      contact: patient.contact || "",
      email: patient.email || "",
      address: patient.address || "",
      gender: patient.gender || "",
      status: patient.status || "",
      ward: patient.ward?._id || "",
      doctors: patient.doctors?.map((doc) => doc._id) || [],
      age: patient.age || "",
      password: "",
      conditions: patient.conditions || [], // <-- added
    });
    setOpenPopup(true);
  };

  const deletePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to delete this patient?"))
      return;
    setLoading(true);
    try {
      await deleteData(`patient/getSinglePatient/${patientId}`);
      setPatients((prev) => prev.filter((p) => p._id !== patientId));
      notify("Patient deleted successfully", "success");
    } catch (err) {
      notify("Failed to delete patient. Please try again.", "error");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const conditionOptions = [
    "Abdominal aortic aneurysm",
    "Achilles tendinopathy",
    "Acne",
    "Acute cholecystitis",
    "Asthma",
    "Diabetes",
    "Hypertension",
    "Migraine",
    "Osteoarthritis",
    "Thyroid disorder",
  ];

  if (loading) return <Loading />;
  if (error) return <Error />;

  return (
    <>
      <ToastifyComponent />
      {(userRole === 1 || userRole === 0) && (
        <div className="container patient">
          <Link to="/">
            <button className="back_home">
              <i className="fa-solid fa-arrow-left"></i> Back To Home
            </button>
          </Link>

          <div className="doctors_heading">
            <h2>View All Patients</h2>
            {userRole === 1 && (
              <button
                className="add_doctor"
                onClick={() => {
                  resetForm();
                  setOpenPopup(true);
                }}
              >
                <i className="fa-solid fa-plus"></i> Add Patient
              </button>
            )}
          </div>

          {!openPopup && (
            <div className="patient_container">
              <table id="customers">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Admitted Date</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Doctor(s)</th>
                    <th>Ward</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Conditions</th> {/* <-- added */}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <tr key={patient._id}>
                        <td>
                          <img
                            src={
                              patient?.image
                                ? `http://localhost:4000/${patient.image}`
                                : defaultImage
                            }
                            alt={`${patient.patientName} profile`}
                            className="patient_image"
                          />
                        </td>
                        <td>{`${patient.patientName} ${patient.patientCaste}`}</td>
                        <td>{formatDate(patient.createdAt)}</td>
                        <td>{patient.gender}</td>
                        <td>{patient.age}</td>
                        <td>
                          {patient.doctors?.length
                            ? patient.doctors.map((doc, i) => {
                                // If patient.doctors is just array of {_id}, use doc._id
                                const doctorId = doc._id || doc;
                                const doctor = doctors.find(
                                  (d) => d._id === doctorId
                                );
                                return (
                                  <span key={doctorId}>
                                    {doctor ? doctor.name : "Unknown Doctor"}
                                    {i < patient.doctors.length - 1 && ", "}
                                  </span>
                                );
                              })
                            : "N/A"}
                        </td>

                        <td>{patient.ward?.wardName || "N/A"}</td>
                        <td>{patient.contact}</td>
                        <td>{patient.status}</td>
                        <td>
                          {patient.conditions?.length
                            ? patient.conditions.join(", ")
                            : "None"}
                        </td>
                        <td className="action_button_div">
                          <button
                            className="action_button edit_button"
                            onClick={() => handleEdit(patient)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          {userRole === 1 && (
                            <button
                              className="action_button delete_button"
                              onClick={() => deletePatient(patient._id)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" style={{ textAlign: "center" }}>
                        No patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {openPopup && (
            <div className="popup_form_container">
              <form className="form" onSubmit={handleSubmit} noValidate>
                <h2>{editing ? "Edit Patient" : "Add Patient"}</h2>

                <InputField
                  label="Patient Name"
                  id="patientName"
                  value={patientData.patientName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter patient name"
                />
                <InputField
                  label="Patient Caste"
                  id="patientCaste"
                  value={patientData.patientCaste}
                  onChange={handleInputChange}
                  placeholder="Enter patient caste"
                />
                <InputField
                  label="Contact Number"
                  id="contact"
                  type="tel"
                  value={patientData.contact}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter contact number"
                  pattern="^\+?\d{7,15}$"
                  title="Enter a valid phone number"
                />
                <InputField
                  label="Email"
                  id="email"
                  type="email"
                  value={patientData.email || ""}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
                <InputField
                  label="Address"
                  id="address"
                  value={patientData.address || ""}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                />
                <InputField
                  label={editing ? "New Password (optional)" : "Password"}
                  id="password"
                  type="password"
                  value={patientData.password || ""}
                  onChange={handleInputChange}
                  required={!editing}
                  placeholder={
                    editing
                      ? "Enter new password if changing"
                      : "Enter password"
                  }
                />

                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={patientData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={patientData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select status</option>
                  <option value="Admitted">Admitted</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Under Treatment">Under Treatment</option>
                </select>

                <label htmlFor="ward">Ward</label>
                <select
                  id="ward"
                  name="ward"
                  value={patientData.ward}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select ward</option>
                  {wards.map((ward) => (
                    <option key={ward._id} value={ward._id}>
                      {ward.wardName}
                    </option>
                  ))}
                </select>

                <fieldset className="doctor_checkbox_group">
                  <label>Assign Doctors</label>
                  {doctors.length > 0 ? (
                    doctors.map((doc) => (
                      <div key={doc._id} className="doctor_checkbox">
                        <input
                          type="checkbox"
                          name="doctors"
                          value={doc._id}
                          checked={patientData.doctors.includes(doc._id)}
                          onChange={handleDoctorChange}
                        />
                        {doc.name}
                      </div>
                    ))
                  ) : (
                    <p>No doctors available.</p>
                  )}
                </fieldset>

                <InputField
                  label="Age"
                  id="age"
                  type="number"
                  value={patientData.age}
                  onChange={handleInputChange}
                  min="0"
                  max="120"
                  placeholder="Enter age"
                />

                <label>Medical Conditions</label>
                <select
                  multiple
                  value={patientData.conditions} // Array of selected conditions
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (option) => option.value
                    );
                    setPatientData((prev) => ({
                      ...prev,
                      conditions: selected,
                    }));
                  }}
                >
                  {conditionOptions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
                <small>
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple
                </small>

                <div className="form_buttons">
                  <button type="submit" className="submit_btn">
                    {editing ? "Update" : "Add"} Patient
                  </button>
                  <button
                    type="button"
                    className="cancel_btn"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Patients;
