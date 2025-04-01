import React, { useEffect, useState } from "react";
import "./patient.css";
import { deleteData, fetchData, postData } from "../../../utils/api";
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
  const [patientData, setPatientData] = useState({
    patientName: "",
    patientCaste: "",
    contact: "",
    email: "",
    address: "",
    gender: "",
    status: "",
  });

  useEffect(() => {
    const getPatients = async () => {
      try {
        const data = await fetchData("patient/getAllPatients");
        setPatients(data.patients);
        setPatientCount(data.patients.length);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    getPatients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const addPatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await postData("patient/registerPatient", patientData);
      notify(response?.message, "success");
      setPatients([...patients, response.patient]);
      setPatientCount(patientCount + 1);
      setOpenPopup(false);
    } catch (error) {
      notify(error.response?.data?.message || "Failed to add patient", "error");
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (patientId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this patient?"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const response = await deleteData(
        `patient/getSinglePatient/${patientId}`
      );
      console.log("Patient deleted successfully!", response);

      setPatients((prevPatients) =>
        prevPatients.filter((patient) => patient._id !== patientId)
      );
      setPatientCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Failed to delete patient:", error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Handle undefined/null values

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A"; // Ensure it's a valid date

    return new Intl.DateTimeFormat("en-GB", {
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
        <>
          <div className="container patient">
            <div className="doctors_heading">
              <h2>View All Patients</h2>
              {userRole === 1 && (
                <button
                  className="add_doctor"
                  onClick={() => setOpenPopup(true)}
                >
                  <i className="fa-solid fa-plus"></i> &nbsp; Add Patient
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
                            {patient.doctors?.length > 0
                              ? patient.doctors.map((doctor, index) => (
                                  <span key={doctor._id}>
                                    {doctor.name}
                                    {index < patient.doctors.length - 1 && ", "}
                                  </span>
                                ))
                              : "N/A"}
                          </td>
                          <td>{patient.ward?.wardName || "N/A"}</td>
                          <td>{patient.contact}</td>
                          <td>{patient.status}</td>
                          <td className="action_button_div">
                            <button className="action_button">
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
          </div>

          {openPopup && (
            <div className="popup">
              <div className="ppcontainer">
                <div className="form-part">
                  <div className="form_title">
                    <h2>Add Patient</h2>
                    <i
                      className="fa-solid fa-xmark"
                      style={{ cursor: "pointer" }}
                      onClick={() => setOpenPopup(false)}
                    ></i>
                  </div>
                  <form className="form-inputs" onSubmit={addPatient}>
                    <div className="text-input">
                      <label htmlFor="patientName">First Name</label>
                      <input
                        type="text"
                        name="patientName"
                        value={patientData.patientName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label htmlFor="patientCaste">Last Name</label>
                      <input
                        type="text"
                        name="patientCaste"
                        value={patientData.patientCaste}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label htmlFor="contact">Mobile/Landline</label>
                      <input
                        type="text"
                        name="contact"
                        value={patientData.contact}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={patientData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label htmlFor="address">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={patientData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label htmlFor="age">Age</label>
                      <input
                        type="text"
                        name="age"
                        value={patientData.age}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="text-input">
                      <label htmlFor="gender">Gender</label>
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
                      <label htmlFor="status">Status</label>
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
                    <div className="text-input">
                      <label htmlFor="ward">Ward</label>
                      <input
                        type="text"
                        name="ward"
                        value={patientData.ward}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <button
                      className="add_doctor"
                      type="submit"
                      style={{ width: "100%" }}
                    >
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {userRole === -1 && (
        <>
          <div className="container patient">
            <div className="patient_div">
              <div className="patient_profile">
                <img
                  src={
                    userData?.image
                      ? `http://localhost:4000/${userData.image}`
                      : defaultImage
                  }
                  alt="Patient_Img"
                  className="patient_img"
                />
                <p className="patient_name">
                  {userData?.name || userData?.patientName}{" "}
                  {userData?.patientCaste || ""}
                </p>

                <p className="email">{userData?.email || "abcd@gmail.com"}</p>
                <button
                  className="delete_profile"
                  onClick={() => deletePatient(userData?._id)}
                >
                  Delete Profile
                </button>
              </div>
              <div className="patient_info">
                <div className="patient_info_div">
                  <p className="patient_info_div_title">Age</p>
                  <p className="patient_info_div_info">
                    {userData?.age || "N/A"}
                  </p>
                </div>

                <div className="patient_info_div">
                  <p className="patient_info_div_title">Contact</p>
                  <p className="patient_info_div_info">
                    {userData?.gender || "N/A"}
                  </p>
                </div>
                <div className="patient_info_div">
                  <p className="patient_info_div_title">Status</p>
                  <p className="patient_info_div_info">
                    {userData?.status || "N/A"}
                  </p>
                </div>
                <div className="patient_info_div">
                  <p className="patient_info_div_title">Ward</p>
                  <p className="patient_info_div_info">
                    {userData?.ward || "N/A"}
                  </p>
                </div>
                <div className="patient_info_div">
                  <p className="patient_info_div_title">Sex</p>
                  <p className="patient_info_div_info">
                    {userData?.gender || "N/A"}
                  </p>
                </div>
                <div className="patient_info_div">
                  <p className="patient_info_div_title">Blood Group</p>
                  <p className="patient_info_div_info">
                    {userData?.blood || "N/A"}
                  </p>
                </div>
                <div className="patient_info_div">
                  <p className="patient_info_div_title">Admitted At</p>
                  <p className="patient_info_div_info">
                    {formatDate(userData?.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Patients;
