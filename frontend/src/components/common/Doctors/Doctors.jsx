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
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 8;

  useEffect(() => {
    const getDoctors = async () => {
      try {
        const data = await fetchData("doctor/getAllDoctors");
        setDoctors(data.doctors);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    getDoctors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorData({ ...doctorData, [name]: value });
  };

  const addDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await postData("doctor/registerDoctor", doctorData);
      notify(response?.message, "success");
      setDoctors([...doctors, response.doctor]);
      setOpenPopup(false);
    } catch (error) {
      notify(error.response?.data?.message || "Failed to add doctor", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (doctorId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this doctor?"
    );
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await deleteData(`doctor/getSingleDoctor/${doctorId}`);
      setDoctors(doctors.filter((doctor) => doctor._id !== doctorId));
      notify("Doctor deleted successfully!", "success");
    } catch (error) {
      notify("Failed to delete doctor", "error");
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
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
                        ? `http://localhost:4000/${doctor.image}`
                        : defaultImage
                    }
                    alt="Doctor_Img"
                    style={{ borderRadius: "7px" }}
                  />
                  <p className="doc_name">Dr. {doctor.name}</p>
                  <p className="grade">{doctor.grade}</p>
                  <p className="specialty">Specialty: {doctor.specialty}</p>
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

          {/* Pagination */}
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
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i + 1}>
                  <a
                    href="#"
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => changePage(i + 1)}
                  >
                    {i + 1}
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
                <div className="text-input">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={doctorData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="text-input">
                  <label htmlFor="grade">Grade</label>
                  <input
                    type="text"
                    name="grade"
                    value={doctorData.grade}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="text-input">
                  <label htmlFor="contact">Contact</label>
                  <input
                    type="text"
                    name="contact"
                    value={doctorData.contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="text-input">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={doctorData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="text-input">
                  <label htmlFor="specialty">Specialty</label>
                  <input
                    type="text"
                    name="specialty"
                    value={doctorData.specialty}
                    onChange={handleInputChange}
                    required
                  />
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
