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

const Patients = ({ userRole, userData }) => {
  const [patients, setPatients] = useState([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
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
  });
  const [wards, setWards] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedDoctors, setSelectedDoctors] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [patientsRes, wardsRes, doctorsRes] = await Promise.all([
          fetchData("patient/getAllPatients"),
          fetchData("ward/getAllWards"),
          fetchData("doctor/getAllDoctors"),
        ]);
        setPatients(patientsRes.patients);
        setPatientCount(patientsRes.patients.length);
        setWards(wardsRes.wards);
        setDoctors(doctorsRes.doctors);
      } catch (error) {
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

  const handleWardChange = (e) => {
    const { value } = e.target;
    setSelectedWard(value);
    setPatientData((prev) => ({ ...prev, ward: value }));
  };

  const handleDoctorChange = (e) => {
    const { value, checked } = e.target;
    setSelectedDoctors((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dataToSend = { ...patientData, doctors: selectedDoctors };
    try {
      let response;
      if (editing) {
        response = await updateData(
          `patient/getSinglePatient/${editId}`,
          dataToSend
        );
        notify("Patient updated successfully!", "success");
        setPatients((prev) =>
          prev.map((p) =>
            p._id === editId ? { ...p, ...response.patient } : p
          )
        );
      } else {
        response = await postData("patient/registerPatient", dataToSend);
        notify(response?.message, "success");
        setPatients((prev) => [...prev, response.patient]);
        setPatientCount((count) => count + 1);
      }
      resetForm();
    } catch (error) {
      notify(error.response?.data?.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setEditing(true);
    setEditId(patient._id);
    setOpenPopup(true);
    setSelectedDoctors(patient.doctors.map((doc) => doc._id));
    setSelectedWard(patient.ward?._id || "");
    setPatientData({
      patientName: patient.patientName,
      patientCaste: patient.patientCaste,
      contact: patient.contact,
      email: patient.email,
      address: patient.address,
      gender: patient.gender,
      status: patient.status,
      ward: patient.ward?._id || "",
      doctors: patient.doctors.map((doc) => doc._id),
      age: patient.age,
    });
  };

  const deletePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to delete this patient?"))
      return;
    setLoading(true);
    try {
      await deleteData(`patient/getSinglePatient/${patientId}`);
      setPatients((prev) => prev.filter((p) => p._id !== patientId));
      setPatientCount((count) => count - 1);
      notify("Patient deleted successfully", "success");
    } catch (error) {
      notify("Failed to delete patient", "error");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOpenPopup(false);
    setEditing(false);
    setEditId(null);
    setSelectedDoctors([]);
    setSelectedWard("");
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
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date);
  };

  if (loading) return <Loading />;
  if (error) return <Error />;

  return (
    <>
      <ToastifyComponent />
      {(userRole === 1 || userRole === 0) && (
        <div className="container patient">
          <div className="doctors_heading">
            <h2>View All Patients</h2>
            {userRole === 1 && (
              <button
                className="add_doctor"
                onClick={() => {
                  setOpenPopup(true);
                  setEditing(false);
                  setSelectedDoctors([]);
                  setSelectedWard("");
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
                  });
                }}
              >
                <i className="fa-solid fa-plus"></i>&nbsp; Add Patient
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
                    <th>Doctor</th>
                    <th>Ward</th>
                    <th>Contact</th>
                    <th>Status</th>
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
                            alt="Patient_Img"
                            className="patient_image"
                          />
                        </td>
                        <td>
                          {patient.patientName} {patient.patientCaste}
                        </td>
                        <td>{formatDate(patient.createdAt)}</td>
                        <td>{patient.gender}</td>
                        <td>{patient.age}</td>
                        <td>
                          {patient.doctors?.length
                            ? patient.doctors.map((doc, i) => (
                                <span key={doc._id}>
                                  {doc.name}
                                  {i < patient.doctors.length - 1 && ", "}
                                </span>
                              ))
                            : "N/A"}
                        </td>
                        <td>{patient.ward?.wardName || "N/A"}</td>
                        <td>{patient.contact}</td>
                        <td>{patient.status}</td>
                        <td className="action_button_div">
                          <button
                            className="action_button"
                            onClick={() => handleEdit(patient)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="action_button"
                            onClick={() => deletePatient(patient._id)}
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
                        style={{
                          textAlign: "center",
                          padding: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        No patient data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {openPopup && (
            <div className="popup">
              <div className="ppcontainer">
                <div className="form-part">
                  <div className="form_title">
                    <h2>{editing ? "Update Patient" : "Add Patient"}</h2>
                    <i
                      className="fa-solid fa-xmark"
                      style={{ cursor: "pointer" }}
                      onClick={() => setOpenPopup(false)}
                    ></i>
                  </div>
                  <form className="form-inputs" onSubmit={handleSubmit}>
                    <div className="text-input">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="patientName"
                        value={patientData.patientName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="patientCaste"
                        value={patientData.patientCaste}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label>Mobile/Landline</label>
                      <input
                        type="text"
                        name="contact"
                        value={patientData.contact}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={patientData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={patientData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label>Age</label>
                      <input
                        type="text"
                        name="age"
                        value={patientData.age}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={patientData.gender}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="text-input">
                      <label>Ward</label>
                      <select
                        name="ward"
                        value={selectedWard}
                        onChange={handleWardChange}
                        required
                      >
                        <option value="">Select Ward</option>
                        {wards.map((ward) => (
                          <option key={ward._id} value={ward._id}>
                            {ward.wardName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <fieldset className="doctor-selection">
                      <legend>Select Assigned Doctors</legend>
                      <div className="doctor-checkbox-group">
                        {doctors.map((doctor) => (
                          <div
                            key={doctor._id}
                            className="doctor-checkbox-item"
                          >
                            <input
                              type="checkbox"
                              id={doctor._id}
                              value={doctor._id}
                              checked={selectedDoctors.includes(doctor._id)}
                              onChange={handleDoctorChange}
                            />
                            <label htmlFor={doctor._id}>{doctor.name}</label>
                          </div>
                        ))}
                      </div>
                    </fieldset>

                    <div className="text-input">
                      <label>Patient Status</label>
                      <select
                        name="status"
                        value={patientData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Admitted">Admitted</option>
                        <option value="Discharged">Discharged</option>
                      </select>
                    </div>

                    <div className="submit-btn">
                      <button type="submit" className="btn">
                        {editing ? "Update Patient" : "Add Patient"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Patients;
