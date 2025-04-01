import React, { useEffect, useState } from "react";
import "./home.css";
import { deleteData, fetchData } from "../../../utils/api";
import Error from "../../pages/Error";
import Loading from "../../pages/Loading";
import { Link } from "react-router-dom";

const Home = () => {
  const [patients, setPatients] = useState([]);
  const [patientCount, setPatientCount] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Get All Patients
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

    // Get All Doctors
    const getDoctors = async () => {
      try {
        const data = await fetchData("doctor/getAllDoctors");
        setDoctors(data.doctors);
        setDoctorCount(data.doctors.length);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getPatients();
    getDoctors();
  }, []);

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

  return (
    <div className="container homePage">
      <div className="overview">
        <p className="title">Overview</p>
        <div className="overview_inner">
          <div className="box doctorCount">
            <p className=" ">Total Doctors</p>
            <div className="box_icon">
              <i className="fa-solid fa-user icon doctor_icon"></i>
            </div>
            <p className="box_count">{doctorCount}</p>
            <Link to="/doctors">
              <button className="see_more">See More</button>
            </Link>
          </div>
          <div className="box patientCount">
            <p className="box_heading">Total Patients</p>
            <div className="box_icon">
              <i className="fa-solid fa-users icon patient_icon"></i>
            </div>
            <p className="box_count">{patientCount}</p>
            <Link to="/patients">
              {" "}
              <button className="see_more">See More</button>
            </Link>
          </div>
          <div className="box wardCount">
            <p className="box_heading">Available Wards</p>
            <div className="box_icon">
              <i className="fa-solid fa-bed icon ward_icon"></i>
            </div>
            <p className="box_count">150</p>
            <button className="see_more">See More</button>
          </div>
          <div className="box historyCount">
            <p className="box_heading">Treatment History</p>
            <div className="box_icon">
              <i className="fa-solid fa-calendar icon treatment_icon"></i>
            </div>
            <p className="box_count">150</p>
            <button className="see_more">See More</button>
          </div>
        </div>
      </div>
      <div className="patients">
        <div className="title">View Patients</div>
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient._id}>
                  <td>
                    {patient.patientName} {patient.patientCaste}
                  </td>
                  <td>{formatDate(patient.createdAt)}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.age}</td>
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
                  colSpan="8"
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
    </div>
  );
};

export default Home;
