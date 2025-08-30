import React from "react";
import "./navbar.css";
import Layout from "../../../layout";
import { notify } from "../../pages/ToastMessage";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isLoggedIn, userRole, userData }) => {
  const navigate = useNavigate(); // Initialize navigate

  const logOut = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      try {
        localStorage.clear();
        notify("Logged Out Successfully", "success");
        window.location.href = "/";
      } catch (error) {
        console.log("Error:", error);
        notify("Server Error", "error");
      }
    }
  };

  return (
    <>
      <div id="wrapper">
        <div id="sidebar">
          <section className="sidebar">
            <div className="header">
              <Link to="/">
                <span className="focus">M</span>
                <span className="unfocus">
                  ed<span style={{ color: "var(--blue)" }}>Ex</span>
                </span>
              </Link>
            </div>
            <div className="separator-wrapper">
              <hr className="separator" />
              <label htmlFor="minimize" className="minimize-btn">
                <input type="checkbox" id="minimize" />
                <i className="fa-solid fa-angle-left"></i>
              </label>
            </div>
            <div className="navigation">
              <div className="section main-section">
                <ul className="items">
                  {/* Admin only */}
                  {userRole === 1 && (
                    <>
                      <li className="item">
                        <Link to="/">
                          <i className="fa-solid fa-house"></i>
                          <span className="item-text">Dashboard</span>
                          <span className="item-tooltip">Dashboard</span>
                        </Link>
                      </li>
                      <li className="item">
                        <Link to="adminAI">
                          <i className="fa-solid fa-gear"></i>
                          <span className="item-text">AI Dashboard</span>
                          <span className="item-tooltip">AI Dashboard</span>
                        </Link>
                      </li>
                      <li className="item">
                        <Link to="doctors">
                          <i className="fa-solid fa-user-doctor"></i>
                          <span className="item-text">Doctors</span>
                          <span className="item-tooltip">Doctors</span>
                        </Link>
                      </li>
                    </>
                  )}

                  {/* Admin + Doctor */}
                  {(userRole === 1 || userRole === 0) && (
                    <>
                      <li className="item">
                        <Link to="patients">
                          <i className="fa-solid fa-users"></i>
                          <span className="item-text">Patients</span>
                          <span className="item-tooltip">Patients</span>
                        </Link>
                      </li>
                      <li className="item">
                        <Link to="appointments">
                          <i className="fa-solid fa-calendar-check"></i>
                          <span className="item-text">Appointments</span>
                          <span className="item-tooltip">Appointments</span>
                        </Link>
                      </li>
                      <li className="item">
                        <Link to="wards">
                          <i className="fa-solid fa-bed"></i>
                          <span className="item-text">Wards</span>
                          <span className="item-tooltip">Wards</span>
                        </Link>
                      </li>
                      <li className="item">
                        <Link to="records">
                          <i className="fa-solid fa-file-medical"></i>
                          <span className="item-text">Records</span>
                          <span className="item-tooltip">Records</span>
                        </Link>
                      </li>
                      <li className="item">
                        <Link to="bills">
                          <i className="fa-solid fa-money-bill-wave"></i>
                          <span className="item-text">Bills</span>
                          <span className="item-tooltip">Bills</span>
                        </Link>
                      </li>
                    </>
                  )}

                  {/* Doctor + Patient Profile */}
                  {(userRole === 0 || userRole === -1) && (
                    <li className="item">
                      <Link to={`/profile/${userData._id}`}>
                        <i className="fa-solid fa-user"></i>
                        <span className="item-text">My Profile</span>
                        <span className="item-tooltip">My Profile</span>
                      </Link>
                    </li>
                  )}

                  {/* Patient only */}
                  {userRole === -1 && (
                    <>
                      <li className="item">
                        {/* <Link to="wards">
                          <i className="fa-solid fa-bed"></i>
                          <span className="item-text">Wards</span>
                          <span className="item-tooltip">Wards</span>
                        </Link> */}
                      </li>
                      <li className="item">
                        <Link to="myRecords">
                          <i className="fa-solid fa-file-medical"></i>
                          <span className="item-text">My Records</span>
                          <span className="item-tooltip">My Records</span>
                        </Link>
                      </li>
                      <li className="item">
                        <Link to="myAppointments">
                          <i className="fa-solid fa-calendar-check"></i>
                          <span className="item-text">My Appointments</span>
                          <span className="item-tooltip">My Appointments</span>
                        </Link>
                      </li>
                      <li className="item">
                        <Link to="myBills">
                          {" "}
                          <i className="fa-solid fa-money-bill-wave"></i>
                          <span className="item-text">My Bills</span>
                          <span className="item-tooltip">My Bills</span>
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="section settings-section">
                <ul className="items">
                  <li className="item">
                    <Link to="notification">
                      <i className="fa-solid fa-bell"></i>
                      <span className="item-text">Notifications</span>
                      <span className="item-tooltip">Notifications</span>
                    </Link>
                  </li>
                  <li className="item" onClick={logOut}>
                    <a href="#">
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      <span className="item-text">Logout</span>
                      <span className="item-tooltip">Logout</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
        <div id="content-wrapper">
          <Layout
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            userData={userData}
          />
        </div>
      </div>
    </>
  );
};

export default Navbar;
