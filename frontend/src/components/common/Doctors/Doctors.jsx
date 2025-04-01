import React, { useEffect, useState } from "react";
import "./doctors.css";
import d1 from "../../assets/d1.avif";
import { fetchData } from "../../../utils/api";
import Loading from "../../pages/Loading";
import Error from "../../pages/Error";

const Doctors = ({ isLoggedIn, userRole, userData }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    console.log(userData);
    // Get All Doctors
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

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <Error />;
  }

  return (
    <div className="container doctor">
      <div className="doctors_heading">
        <h2>View All Doctors</h2>
        {userRole === 1 && (
          <button className="add_doctor">
            <i className="fa-solid fa-plus"> </i> &nbsp; Add Doctor
          </button>
        )}
      </div>
      <div className="doctors_container">
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div className="doctors_div">
              <img
                src={`http://localhost:4000/${doctor.image}`}
                alt="Doctor_Img"
                style={{ borderRadius: "7px" }}
              />
              <p className="doc_name">Dr. {doctor.name}</p>
              <p className="doc_desc"></p>
              <p className="team">
                Treated Patients: {doctor.treatedPatients.length}
              </p>
              <p className="grade">{doctor.grade}</p>
              <button className="view_more">See More</button>
            </div>
          ))
        ) : (
          <>
            <p>No Doctors Found</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Doctors;
