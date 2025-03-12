import React, { useEffect, useState } from "react";
import "./home.css";
import { fetchData } from "../../../utils/api";
import Error from "../../pages/Error";
import Loading from "../../pages/Loading";

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
            <button className="see_more">See More</button>
          </div>
          <div className="box patientCount">
            <p className="box_heading">Total Patients</p>
            <div className="box_icon">
              <i className="fa-solid fa-users icon patient_icon"></i>
            </div>
            <p className="box_count">{patientCount}</p>
            <button className="see_more">See More</button>
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
          <tr>
            <th>Name</th>
            <th>Admitted Date</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Ward</th>
            <th>Contact</th>
          </tr>
          <tr>
            <td>Alfreds Futterkiste</td>
            <td>Maria Anders</td>
            <td>Germany</td>
          </tr>
          <tr>
            <td>Berglunds snabbköp</td>
            <td>Christina Berglund</td>
            <td>Sweden</td>
          </tr>
          <tr>
            <td>Centro comercial Moctezuma</td>
            <td>Francisco Chang</td>
            <td>Mexico</td>
          </tr>
          <tr>
            <td>Ernst Handel</td>
            <td>Roland Mendel</td>
            <td>Austria</td>
          </tr>
          <tr>
            <td>Island Trading</td>
            <td>Helen Bennett</td>
            <td>UK</td>
          </tr>
          <tr>
            <td>Königlich Essen</td>
            <td>Philip Cramer</td>
            <td>Germany</td>
          </tr>
          <tr>
            <td>Laughing Bacchus Winecellars</td>
            <td>Yoshi Tannamuri</td>
            <td>Canada</td>
          </tr>
          <tr>
            <td>Magazzini Alimentari Riuniti</td>
            <td>Giovanni Rovelli</td>
            <td>Italy</td>
          </tr>
          <tr>
            <td>North/South</td>
            <td>Simon Crowther</td>
            <td>UK</td>
          </tr>
          <tr>
            <td>Paris spécialités</td>
            <td>Marie Bertrand</td>
            <td>France</td>
          </tr>
        </table>
      </div>
    </div>
  );
};

export default Home;
