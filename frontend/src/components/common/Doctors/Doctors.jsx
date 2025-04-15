import React, { useEffect, useState } from "react";
import "./doctors.css";
import { fetchData, postData, deleteData } from "../../../utils/api";
import Loading from "../../pages/Loading";
import Error from "../../pages/Error";
import ToastifyComponent, { notify } from "../../pages/ToastMessage";
import defaultImage from "../../assets/default.webp";

const Doctors = ({ userRole }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [doctorData, setDoctorData] = useState({
    name: "",
    grade: "",
    contact: "",
    email: "",
    specialty: "",
    team: "",
    juniorDoctors: "",
    wardId: "",
    treatedPatients: "",
  });

  const [juniorDoctorsList, setJuniorDoctorsList] = useState([]);
  const [wardsList, setWardsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 8;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const doctorResponse = await fetchData("doctor/getAllDoctors");
        setDoctors(doctorResponse.doctors);

        // const juniorDoctorsData = await fetchData("doctor/getJuniorDoctors");
        const wardsData = await fetchData("ward/getAllWards");
        const patientsData = await fetchData("patient/getAllPatients");

        // setJuniorDoctorsList(juniorDoctorsData);
        setWardsList(wardsData);
        setPatientsList(patientsData);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorData((prevData) => ({ ...prevData, [name]: value }));
  };

  const addDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await postData("doctor/registerDoctor", doctorData);
      notify(response?.message || "Doctor added successfully!", "success");
      setDoctors((prev) => [...prev, response.doctor]);
      setOpenPopup(false);
      setDoctorData({
        name: "",
        grade: "",
        contact: "",
        email: "",
        specialty: "",
        team: "",
        juniorDoctors: "",
        wardId: "",
        treatedPatients: "",
      });
    } catch (error) {
      notify(error.response?.data?.message || "Failed to add doctor", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    setLoading(true);
    try {
      await deleteData(`doctor/getSingleDoctor/${doctorId}`);
      setDoctors((prev) => prev.filter((doctor) => doctor._id !== doctorId));
      notify("Doctor deleted successfully!", "success");
    } catch (error) {
      notify("Failed to delete doctor", "error");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(doctors.length / doctorsPerPage);

  const changePage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error />;

  return (
    <div className="container doctor">
      <ToastifyComponent />
      <div className="doctors_heading">
        <h2>View All Doctors</h2>
        {userRole === 1 && (
          <button className="add_doctor" onClick={() => setOpenPopup(true)}>
            <i className="fa-solid fa-plus"></i> &nbsp; Add Doctor
          </button>
        )}
      </div>

      {!openPopup && (
        <div>
          <div className="doctors_container">
            {currentDoctors.length > 0 ? (
              currentDoctors.map((doctor) => (
                <div className="doctors_div" key={doctor._id}>
                  <img
                    src={
                      doctor?.image
                        ? `http://localhost:4000/${doctor.image.replace(
                            "\\",
                            "/"
                          )}`
                        : defaultImage
                    }
                    alt="Doctor"
                    style={{ borderRadius: "7px" }}
                  />
                  <p className="doc_name">Dr. {doctor.name}</p>
                  <p className="grade">{doctor.grade}</p>
                  <p className="specialty">
                    Specialty: {doctor.specialty || "N/A"}
                  </p>

                  <div className="treated_patients">
                    <p>Treated Patients:</p>
                    {doctor.treatedPatients?.length ? (
                      <ul>
                        {doctor.treatedPatients.map((patient) => (
                          <li key={patient._id}>{patient.patientName}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>None</p>
                    )}
                  </div>

                  <div className="assigned_wards">
                    <p>Wards:</p>
                    {doctor.wards?.length ? (
                      <ul>
                        {doctor.wards.map((ward) => (
                          <li key={ward._id}>{ward.wardName}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Not Assigned</p>
                    )}
                  </div>

                  <button
                    className="action_button"
                    onClick={() => deleteDoctor(doctor._id)}
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))
            ) : (
              <p>No Doctors Found</p>
            )}
          </div>

          {totalPages > 1 && (
            <ul id="pagination">
              <li>
                <a
                  href="#"
                  onClick={() => changePage(currentPage - 1)}
                  className={currentPage === 1 ? "disabled" : ""}
                >
                  «
                </a>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index + 1}>
                  <a
                    href="#"
                    className={currentPage === index + 1 ? "active" : ""}
                    onClick={() => changePage(index + 1)}
                  >
                    {index + 1}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  onClick={() => changePage(currentPage + 1)}
                  className={currentPage === totalPages ? "disabled" : ""}
                >
                  »
                </a>
              </li>
            </ul>
          )}
        </div>
      )}

      {openPopup && (
        <div className="popup">
          <div className="ppcontainer">
            <div className="form-part">
              <div className="form_title">
                <h2>Add Doctor</h2>
                <i
                  className="fa-solid fa-xmark"
                  style={{ cursor: "pointer" }}
                  onClick={() => setOpenPopup(false)}
                ></i>
              </div>
              <form className="form-inputs" onSubmit={addDoctor}>
                {["name", "grade", "contact", "email", "specialty"].map(
                  (field) => (
                    <div className="text-input" key={field}>
                      <label htmlFor={field}>
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        name={field}
                        value={doctorData[field]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )
                )}
                <div className="text-input">
                  <label htmlFor="juniorDoctors">Junior Doctors</label>
                  <select
                    name="juniorDoctors"
                    value={doctorData.juniorDoctors}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Junior Doctor</option>
                    {juniorDoctorsList.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        Dr. {doc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-input">
                  <label htmlFor="wardId">Ward</label>
                  <select
                    name="wardId"
                    value={doctorData.wardId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Ward</option>
                    {wardsList.map((ward) => (
                      <option key={ward._id} value={ward._id}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-input">
                  <label htmlFor="treatedPatients">Treated Patients</label>
                  <select
                    name="treatedPatients"
                    value={doctorData.treatedPatients}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Treated Patient</option>
                    {patientsList.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="add_doctor" type="submit">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
