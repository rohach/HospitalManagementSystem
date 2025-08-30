import React, { useEffect, useState } from "react";
import "./home.css";
import { deleteData, fetchData } from "../../../utils/api";
import Error from "../../pages/Error";
import Loading from "../../pages/Loading";
import { Link } from "react-router-dom";

const Home = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientCount, setPatientCount] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [wardCount, setWardCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
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

    const getWards = async () => {
      try {
        const data = await fetchData("ward/getAllWards");
        setWardCount(data.wards.length);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const getRecords = async () => {
      try {
        const data = await fetchData("treatmentRecord/treatmentRecords");
        setRecordCount(data.treatmentRecords.length);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getPatients();
    getDoctors();
    getWards();
    getRecords();
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

  // Function to get the doctor's name by ID
  const getDoctorNameById = (doctorId) => {
    const doctor = doctors.find((doc) => doc._id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : "N/A";
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
            <p className="box_count">{wardCount}</p>
            <Link to="wards">
              <button className="see_more">See More</button>
            </Link>
          </div>
          <div className="box historyCount">
            <p className="box_heading">Treatment History</p>
            <div className="box_icon">
              <i className="fa-solid fa-calendar icon treatment_icon"></i>
            </div>
            <p className="box_count">{recordCount}</p>
            <Link to="records">
              <button className="see_more">See More</button>
            </Link>
          </div>
        </div>
      </div>

      <div className="patients">
        <div className="title">View Patients</div>
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
                    <td>
                      <span
                        className={`status-badge ${
                          patient.status === "Admitted"
                            ? "admitted"
                            : "discharged"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
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

                    {/* This line displays the doctor's name */}
                    <td className="action_button_div">
                      <Link to={`/update/${patient._id}`}>
                        <button className="action_button" title="Edit">
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      </Link>
                      <button
                        className="action_button"
                        title="Delete"
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
                    colSpan="9"
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
    </div>
  );
};

export default Home;
